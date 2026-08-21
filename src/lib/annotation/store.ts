import type { Layer, Shape } from "./types";

/**
 * Module-level annotation store. Keyed by layer id (e.g. `q:12`, `pdf:3`,
 * `theory:notes`). Survives component unmount so switching modes / navigating
 * questions never destroys a teacher's markup.
 */
const layers = new Map<string, Layer>();
const listeners = new Map<string, Set<() => void>>();

function ensure(id: string): Layer {
  let l = layers.get(id);
  if (!l) {
    l = { shapes: [], undone: [] };
    layers.set(id, l);
  }
  return l;
}

export function getLayer(id: string): Layer {
  return ensure(id);
}

export function subscribe(id: string, fn: () => void) {
  const set = listeners.get(id) ?? new Set();
  set.add(fn);
  listeners.set(id, set);
  return () => set.delete(fn);
}

function emit(id: string) {
  listeners.get(id)?.forEach((fn) => fn());
}

export function addShape(id: string, s: Shape) {
  const l = ensure(id);
  l.shapes.push(s);
  l.undone = [];
  emit(id);
}

export function replaceShapes(id: string, shapes: Shape[]) {
  const l = ensure(id);
  l.shapes = shapes;
  emit(id);
}

export function eraseShapes(id: string, ids: Set<string>) {
  if (!ids.size) return;
  const l = ensure(id);
  l.shapes = l.shapes.filter((s) => !ids.has(s.id));
  emit(id);
}

export function undo(id: string) {
  const l = ensure(id);
  const s = l.shapes.pop();
  if (s) {
    l.undone.push(s);
    emit(id);
  }
}

export function redo(id: string) {
  const l = ensure(id);
  const s = l.undone.pop();
  if (s) {
    l.shapes.push(s);
    emit(id);
  }
}

export function clearLayer(id: string) {
  const l = ensure(id);
  l.shapes = [];
  l.undone = [];
  emit(id);
}

/** Clear every layer whose id starts with the given prefix (e.g. `pdf:`). */
export function clearGroup(prefix: string) {
  for (const key of layers.keys()) {
    if (key.startsWith(prefix)) clearLayer(key);
  }
}

export function layerCount(id: string) {
  return ensure(id).shapes.length;
}
