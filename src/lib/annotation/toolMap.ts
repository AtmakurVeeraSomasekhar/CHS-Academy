import type { WBTool } from "@/components/chs/WhiteboardToolbar";
import type { AnnoTool } from "./types";

/** Bridge between the existing toolbar's tool ids and the annotation engine. */
export function toAnnoTool(t: WBTool): AnnoTool {
  switch (t) {
    case "selection":
      return "selection";
    case "pencil":
      return "pencil";
    case "highlighter":
      return "highlighter";
    case "eraser":
      return "eraser";
    case "line":
    case "dashed":
    case "triangle":
    case "polygon":
      return t === "triangle" || t === "polygon" ? "line" : "line";
    case "arrow":
      return "arrow";
    case "rectangle":
      return "rectangle";
    case "ellipse":
      return "ellipse";
    case "text":
    case "textbox":
      return "text";
    default:
      return "pen";
  }
}

export function toWBTool(t: AnnoTool): WBTool {
  return t === "text" ? "textbox" : (t as WBTool);
}
