import { useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Expand, Minimize2 } from "lucide-react";

export function QuestionImageViewer({ src }: { src: string }) {
  const [full, setFull] = useState(false);

  return (
    <div
      className={
        full
          ? "fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          : "mt-4 relative h-[280px] rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
      }
    >
      <TransformWrapper minScale={0.5} maxScale={6} initialScale={1} centerOnInit>
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full !h-full flex items-center justify-center"
        >
          <img
            src={src}
            alt="Question figure"
            className="max-h-full max-w-full object-contain select-none"
            draggable={false}
          />
        </TransformComponent>
      </TransformWrapper>
      <button
        onClick={() => setFull((v) => !v)}
        className="absolute top-2 right-2 h-8 w-8 rounded-md bg-white/90 hover:bg-white flex items-center justify-center text-navy-deep shadow"
        title={full ? "Exit fullscreen" : "Fullscreen"}
      >
        {full ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
      </button>
    </div>
  );
}
