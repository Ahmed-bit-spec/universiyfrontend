/**
 * ELibrarySearchContext
 * Shared search state between DashboardHeader (when on /e-library)
 * and LibraryHome page. Both read/write the same atom.
 */
import { createContext, useContext, useState, useCallback } from "react";

const ELibrarySearchCtx = createContext(null);

export const ELibrarySearchProvider = ({ children }) => {
  const [search, setSearch] = useState("");

  const clear = useCallback(() => setSearch(""), []);

  return (
    <ELibrarySearchCtx.Provider value={{ search, setSearch, clear }}>
      {children}
    </ELibrarySearchCtx.Provider>
  );
};

export const useELibrarySearch = () => {
  const ctx = useContext(ELibrarySearchCtx);
  if (!ctx) throw new Error("useELibrarySearch must be used inside ELibrarySearchProvider");
  return ctx;
};