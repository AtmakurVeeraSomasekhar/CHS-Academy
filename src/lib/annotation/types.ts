export type AnnoTool =
  | "selection"
  | "pen"
  | "pencil"
  | "highlighter"
  | "eraser"
  | "line"
  | "arrow"
  | "rectangle"
  | "ellipse"
  | "text";

export interface Pt {
  x: number;
  y: number;
  p?: number; // pressure 0..1
}

export interface BaseShape {
  id: string;
  kind: "path" | "line" | "arrow" | "rectangle" | "ellipse" | "text";
  color: string;
  width: number;
  opacity: number; // 0..1
  tool: AnnoTool;
}

export interface PathShape extends BaseShape {
  kind: "path";
  points: Pt[];
}

export interface GeoShape extends BaseShape {
  kind: "line" | "arrow" | "rectangle" | "ellipse";
  from: Pt;
  to: Pt;
}

export interface TextShape extends BaseShape {
  kind: "text";
  at: Pt;
  text: string;
  size: number;
}

export type Shape = PathShape | GeoShape | TextShape;

/** Normalized (0..1 of layer width/height) storage keeps annotations aligned on resize/zoom. */
export interface Layer {
  shapes: Shape[];
  undone: Shape[];
}
