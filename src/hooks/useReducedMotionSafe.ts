import { useReducedMotion } from "framer-motion";

export function useMotionDuration(base = 0.24) {
  const reduce = useReducedMotion();
  return reduce ? 0 : base;
}
