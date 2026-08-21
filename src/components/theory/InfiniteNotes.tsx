import { useEffect, useRef, useState } from "react";
import { AnnotationCanvas } from "@/components/annotation/AnnotationCanvas";
import type { AnnoTool } from "@/lib/annotation/types";

interface Props {
  layerId: string;
  tool: AnnoTool;
  color: string;
  width: number;
  opacity: number;
  annotate: boolean;
  onFocusLayer?: (id: string) => void;
  /** Paper style: engineering grid or plain white page. */
  grid?: boolean;
}

const PAGE = 1100;

/**
 * Unlimited notes surface — a clean writing workspace with no chrome. Grows
 * automatically as the teacher writes toward the bottom of the page.
 */
export function InfiniteNotes({
  layerId,
  tool,
  color,
  width,
  opacity,
  annotate,
  onFocusLayer,
  grid = true,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(PAGE * 2);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight > el.scrollHeight - 500) {
        setHeight((h) => h + PAGE);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="h-full min-h-0 overflow-auto overscroll-contain bg-white"
    >
      <div className={`relative w-full ${grid ? "chs-notes-grid" : ""}`} style={{ height }}>
        <AnnotationCanvas
          layerId={layerId}
          tool={tool}
          color={color}
          width={width}
          opacity={opacity}
          active={annotate}
          onFocus={onFocusLayer}
        />
      </div>
    </div>
  );
}
