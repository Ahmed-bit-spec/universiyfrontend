import { CanvasArea } from "./canvas-area";
import { Toolbar } from "./toolbar";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { PagesBar } from "./pages-bar";

export function Editor() {
  return (
    <div className="flex flex-col h-full w-full">
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        <LeftSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <CanvasArea />
          <PagesBar />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}