import { EditorContext } from "./context";
import { useCanvasState } from "./hooks/use-canvas";
import { useDesigns } from "./hooks/use-designs";
import { useRouter } from "./hooks/use-router";
import { Editor } from "./components/editor";
import { Home } from "./components/home";
import WebFont from "webfontloader";
import { useEffect } from "react";

export function App({ question, initialDesignId, onDesignCreated }: {
  question?: any;
  initialDesignId?: string;
  onDesignCreated?: (id: string) => void;
} = {}) {
  const { path, navigate, designId } = useRouter();
  const canvasState = useCanvasState();
  const designState = useDesigns(canvasState.getCanvasJSONForPage);

  // Load Google Fonts
  useEffect(() => {
    WebFont.load({
      google: {
        families: [
          "Inter:400,500,600,700",
          "Playfair Display:400,500,600,700,800,900",
          "Montserrat:400,500,600,700,800,900",
          "Poppins:400,500,600,700",
          "Roboto:400,500,700",
          "Open Sans:400,600,700",
          "Lora:400,700",
          "Raleway:400,500,600",
          "Source Sans Pro:400,600,700",
          "Merriweather:400,700",
        ],
      },
    });
  }, []);

  // Load design from URL on initial load and when designId changes
  useEffect(() => {
    if (designId && !designState.loading) {
      if (designState.activeDesign?.id !== designId) {
        designState.loadDesign(designId);
      }
    }
  }, [designId, designState.loading]);

  // Sync canvas size to the loaded design's dimensions
  useEffect(() => {
    if (designState.activeDesign) {
      const { width, height } = designState.activeDesign;
      if (width && height && (width !== canvasState.canvasWidth || height !== canvasState.canvasHeight)) {
        canvasState.setCanvasSize(width, height);
      }
    }
  }, [designState.activeDesign]);

  // Auto-activate first page when pages load and canvases are registered
  useEffect(() => {
    if (designState.pages.length > 0 && !canvasState.activeCanvasId) {
      canvasState.setActiveCanvas(designState.pages[0].id);
    }
  }, [designState.pages, canvasState.activeCanvasId]);

  // Auto-save on every canvas modification (debounced inside scheduleSave)
  useEffect(() => {
    if (canvasState.lastModified > 0) {
      designState.scheduleSave();
    }
  }, [canvasState.lastModified]);

  // Auto-create design if no designId AND no initialDesignId
  // When the student returns to a design question, initialDesignId is set
  // from the stored answer so we load their existing canvas instead of
  // creating a new blank one.
  useEffect(() => {
    if (initialDesignId) {
      // Provided from parent (student returning to this question)
      if (!designState.loading && designState.activeDesign?.id !== initialDesignId) {
        designState.loadDesign(initialDesignId);
      }
    } else if (!designId && !designState.loading) {
      designState.createDesign().then(id => {
        if (id) {
          navigate(`/design/${id}`);
          onDesignCreated?.(id); // Report back so parent can persist it
        }
      });
    }
  }, [designId, designState.loading, initialDesignId]);

  if (designState.loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F3F4F7]">
        <div className="text-center">
          <div className="spinner !w-6 !h-6 !border-accent/30 !border-t-accent mb-3 mx-auto" />
          <p className="text-zinc-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }



  if (!designId) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F3F4F7]">
        <div className="text-center">
          <div className="spinner !w-6 !h-6 !border-accent/30 !border-t-accent mb-3 mx-auto" />
          <p className="text-zinc-400 text-sm">Initializing Design Lab...</p>
        </div>
      </div>
    );
  }

  // Editor view
  const contextValue = {
    ...canvasState,
    ...designState,
    // activeCanvasId is the source of truth for which page is active
    activePageId: canvasState.activeCanvasId ?? designState.activePageId,
    navigate,
    teacherResources: question?.designResources || [],
    teacherColors: question?.designColors || [],
    teacherTemplates: question?.designTemplates || [],
  };

  return (
    <div className="design-lab-root h-full">
      <EditorContext.Provider value={contextValue}>
        <Editor />
      </EditorContext.Provider>
    </div>
  );
}
