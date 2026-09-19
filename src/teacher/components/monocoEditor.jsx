// MonacoCodeEditor.jsx
// A real Monaco Editor (the same engine VS Code uses) — replaces the old
// textarea + regex-highlight "fake editor". Gives students genuine
// IntelliSense, red error squiggles, autocomplete, bracket matching,
// folding, minimap, etc. for free, per-language.
//
// npm install @monaco-editor/react monaco-editor

import { useRef, useCallback, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

// Map our internal language ids -> Monaco's language ids.
// Mapping javascript to typescript enables JSX/TSX tokenization and parsing
// for React support out of the box.
const MONACO_LANG_MAP = {
  python: "python",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  javascript: "typescript",
  html: "html",
  css: "css",
  sql: "sql",
};

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', Consolas, monospace",
  minimap: { enabled: true, scale: 1 },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 4,
  insertSpaces: true,
  wordWrap: "off",
  renderWhitespace: "selection",
  smoothScrolling: true,
  cursorBlinking: "smooth",
  quickSuggestions: { other: true, comments: false, strings: true },
  suggestOnTriggerCharacters: true,
  formatOnPaste: true,
  formatOnType: true,
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true, indentation: true },
  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
};

// Popular Tailwind CSS Utility Classes for Autocomplete
const TAILWIND_CLASSES = [
  // Layout & Flexbox/Grid
  "flex", "grid", "block", "inline-block", "inline", "hidden", "flex-col", "flex-row", "flex-wrap",
  "items-center", "items-start", "items-end", "justify-center", "justify-between", "justify-start", "justify-end",
  "gap-1", "gap-2", "gap-3", "gap-4", "gap-6", "gap-8", "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-6", "grid-cols-12",
  // Spacing (Padding & Margin)
  "p-0", "p-1", "p-2", "p-3", "p-4", "p-5", "p-6", "p-8", "p-10",
  "px-1", "px-2", "px-3", "px-4", "px-6", "px-8", "py-1", "py-2", "py-3", "py-4", "py-6", "py-8",
  "m-0", "m-1", "m-2", "m-3", "m-4", "m-5", "m-6", "m-8", "mx-auto", "my-auto",
  "mt-1", "mt-2", "mt-3", "mt-4", "mt-6", "mt-8", "mb-1", "mb-2", "mb-3", "mb-4", "mb-6", "mb-8",
  "ml-1", "ml-2", "ml-3", "ml-4", "mr-1", "mr-2", "mr-3", "mr-4",
  // Sizing
  "w-full", "w-screen", "w-auto", "h-full", "h-screen", "h-auto", "max-w-xs", "max-w-sm", "max-w-md", "max-w-lg", "max-w-xl", "max-w-2xl", "max-w-5xl", "max-w-7xl",
  // Typography
  "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl",
  "font-light", "font-normal", "font-medium", "font-semibold", "font-bold", "font-extrabold",
  "text-center", "text-left", "text-right", "text-justify", "italic", "underline", "uppercase", "lowercase", "capitalize",
  // Colors (Text, Bg, Border)
  "text-white", "text-black", "text-transparent",
  "text-neutral-50", "text-neutral-100", "text-neutral-200", "text-neutral-300", "text-neutral-400", "text-neutral-500", "text-neutral-600", "text-neutral-700", "text-neutral-800", "text-neutral-900",
  "text-red-500", "text-orange-500", "text-amber-500", "text-yellow-500", "text-lime-500", "text-[#2C2DE0]", "text-emerald-500", "text-teal-500", "text-cyan-500", "text-sky-500", "text-blue-500", "text-indigo-500", "text-violet-500", "text-purple-500", "text-fuchsia-500", "text-pink-500", "text-rose-500",
  "bg-white", "bg-black", "bg-transparent",
  "bg-neutral-50", "bg-neutral-100", "bg-neutral-200", "bg-neutral-300", "bg-neutral-400", "bg-neutral-500", "bg-neutral-600", "bg-neutral-700", "bg-neutral-800", "bg-neutral-900",
  "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500", "bg-[#2C2DE0]", "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500",
  // Borders
  "border", "border-0", "border-2", "border-4", "border-8", "border-transparent",
  "border-neutral-200", "border-neutral-300", "border-neutral-700", "rounded", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full",
  // Effects & Interactions
  "shadow", "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl", "shadow-none",
  "opacity-0", "opacity-25", "opacity-50", "opacity-75", "opacity-100",
  "cursor-pointer", "cursor-default", "cursor-not-allowed", "select-none",
  // Transitions
  "transition", "transition-all", "duration-75", "duration-100", "duration-150", "duration-200", "duration-300", "duration-500",
  "ease-linear", "ease-in", "ease-out", "ease-in-out",
  // Hover & Focus States
  "hover:bg-neutral-100", "hover:bg-neutral-800", "hover:text-blue-500", "hover:shadow-lg", "hover:scale-105", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500"
];

function parseSqlSchema(schemaText) {
  if (!schemaText) return { tables: [], columns: {} };
  const tables = [];
  const columns = {};

  // Find all CREATE TABLE blocks
  const createTableRegex = /CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
  let match;
  while ((match = createTableRegex.exec(schemaText)) !== null) {
    const tableName = match[1];
    tables.push(tableName);
    
    // Parse columns inside this block
    const blockContent = match[2];
    const lines = blockContent.split(",");
    const tableCols = [];
    lines.forEach(line => {
      // Find the first word in the line, which is the column name
      const colMatch = /^\s*(\w+)/.exec(line);
      if (colMatch) {
        const colName = colMatch[1];
        // Ignore keywords
        if (!["primary", "foreign", "key", "unique", "constraint", "check"].includes(colName.toLowerCase())) {
          tableCols.push(colName);
        }
      }
    });
    columns[tableName] = tableCols;
  }
  return { tables, columns };
}

export default function MonacoCodeEditor({
  value,
  onChange,
  langId,
  readOnly = false,
  onValidate,
  theme = "vs-dark",
  sqlSchema = "",
}) {
  const editorRef = useRef(null);
  const monaco = useMonaco();
  const monacoLang = MONACO_LANG_MAP[langId] || "plaintext";

  const handleMount = useCallback((editor, monacoInstance) => {
    editorRef.current = editor;

    if (monacoInstance.languages.typescript) {
      // Keep JS diagnostics quiet and auto-configured
      monacoInstance.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      });
      monacoInstance.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monacoInstance.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        checkJs: false,
      });

      // TS Diagnostics (JSX/TSX files) setup as loose javascript with JSX enabled
      monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      });
      monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monacoInstance.languages.typescript.ScriptTarget.ES2020,
        jsx: 1, // 1 = React
        allowNonTsExtensions: true,
        alwaysStrict: false,
        noImplicitAny: false,
        checkJs: false,
      });

      // Declare React & ReactDOM as global definitions in Monaco's TS sandbox
      monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(`
        declare const React: any;
        declare const ReactDOM: any;
      `, "react_globals.d.ts");
    }
  }, []);

  const handleValidate = useCallback(
    (markers) => {
      if (onValidate) onValidate(markers);
    },
    [onValidate]
  );

  // Effect to register Custom Autocomplete Providers
  useEffect(() => {
    if (!monaco) return;

    const providers = [];

    // 1. SQL Autocomplete Engine (Database Mode)
    if (monacoLang === "sql" && sqlSchema) {
      const { tables, columns } = parseSqlSchema(sqlSchema);
      
      const sqlProvider = monaco.languages.registerCompletionItemProvider("sql", {
        provideCompletionItems: (model, position) => {
          const suggestions = [];

          // Table suggestions
          tables.forEach(table => {
            suggestions.push({
              label: table,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: table,
              detail: "Database Table",
            });
          });

          // Column suggestions
          Object.entries(columns).forEach(([table, cols]) => {
            cols.forEach(col => {
              suggestions.push({
                label: col,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: col,
                detail: `Column in ${table}`,
              });
            });
          });

          // Standard SQL Keywords
          const keywords = [
            "SELECT", "FROM", "WHERE", "INSERT", "INTO", "UPDATE", "SET", "DELETE",
            "CREATE", "TABLE", "DROP", "ALTER", "ADD", "PRIMARY", "KEY", "FOREIGN",
            "REFERENCES", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP",
            "BY", "ORDER", "HAVING", "LIMIT", "OFFSET", "AND", "OR", "NOT", "IN",
            "LIKE", "BETWEEN", "IS", "NULL", "AS", "COUNT", "SUM", "AVG", "MIN", "MAX"
          ];
          keywords.forEach(kw => {
            suggestions.push({
              label: kw,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: kw,
              detail: "SQL Keyword",
            });
          });

          return { suggestions };
        }
      });
      providers.push(sqlProvider);
    }

    // 2. Tailwind CSS Autocomplete Engine (HTML / CSS / JSX files)
    const tailwindProvider = monaco.languages.registerCompletionItemProvider(
      ["html", "css", "typescript"],
      {
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          const lastClassQuote = /class(?:Name)?=["'][^"']*$/i.test(textUntilPosition);
          const isCssFile = model.getLanguageId() === "css";

          if (!lastClassQuote && !isCssFile) {
            return { suggestions: [] };
          }

          const suggestions = TAILWIND_CLASSES.map(cls => ({
            label: cls,
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: cls,
            detail: "Tailwind CSS Utility",
          }));

          return { suggestions };
        },
      }
    );
    providers.push(tailwindProvider);

    return () => {
      providers.forEach(p => p.dispose());
    };
  }, [monaco, monacoLang, sqlSchema]);

  return (
    <div style={{ flex: 1, minHeight: 220, background: "#1e1e1e" }}>
      <Editor
        height="100%"
        theme={theme}
        language={monacoLang}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        onValidate={handleValidate}
        options={{ ...EDITOR_OPTIONS, readOnly }}
        loading={
          <div style={{ color: "#8b949e", fontSize: 12, padding: "1rem" }}>
            Loading editor…
          </div>
        }
      />
    </div>
  );
}