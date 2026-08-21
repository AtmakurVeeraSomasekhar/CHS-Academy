import {
  Camera,
  Keyboard,
  FileDown,
  FileImage,
  Maximize2,
  Mic,
  Printer,
  Radio,
  Share2,
  Star,
  Upload,
  Youtube,
} from "lucide-react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface Props {
  onPng: (preset: "landscape" | "square" | "portrait") => void;
  onQuestionPdf: () => void;
  onSessionPdf: () => void;
  onUploadImage: () => void;
  onShare: () => void;
  onPrint: () => void;
  onFullscreen: () => void;
  onFavorites: () => void;
  onObs: () => void;
  onYoutube: () => void;
  onVoiceNotes: () => void;
  onShortcuts: () => void;
  voiceNotesActive?: boolean;
}

export function OverflowMenu(p: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-9 w-9 rounded-md bg-navy-elevated/80 border border-gold/30 flex items-center justify-center text-white hover:bg-navy-elevated transition"
          title="More"
          aria-label="More options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 bg-navy-panel text-white border-gold/30">
        <DropdownMenuLabel className="text-gold tracking-widest text-[10px] uppercase">
          Export
        </DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="focus:bg-white/10">
            <Camera className="h-4 w-4 mr-2" /> Export PNG
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-navy-panel text-white border-gold/30">
            <DropdownMenuItem onClick={() => p.onPng("landscape")}>Landscape 1600×900</DropdownMenuItem>
            <DropdownMenuItem onClick={() => p.onPng("square")}>Square 1080×1080</DropdownMenuItem>
            <DropdownMenuItem onClick={() => p.onPng("portrait")}>Portrait 4:5</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={p.onQuestionPdf}>
          <FileImage className="h-4 w-4 mr-2" /> Export Question PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={p.onSessionPdf}>
          <FileDown className="h-4 w-4 mr-2" /> Export Session PDF
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuLabel className="text-gold tracking-widest text-[10px] uppercase">
          Question
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={p.onUploadImage}>
          <Upload className="h-4 w-4 mr-2" /> Upload image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={p.onFavorites}>
          <Star className="h-4 w-4 mr-2" /> Favorites
        </DropdownMenuItem>
        <DropdownMenuItem onClick={p.onShare}>
          <Share2 className="h-4 w-4 mr-2" /> Copy share link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={p.onPrint}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuLabel className="text-gold tracking-widest text-[10px] uppercase">
          Studio
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={p.onVoiceNotes}>
          <Mic className={`h-4 w-4 mr-2 ${p.voiceNotesActive ? "text-brand-red" : ""}`} />
          {p.voiceNotesActive ? "Stop Voice Recorder" : "Voice Recorder"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={p.onObs}>
          <Radio className="h-4 w-4 mr-2" /> OBS Integration
        </DropdownMenuItem>
        <DropdownMenuItem onClick={p.onFullscreen}>
          <Maximize2 className="h-4 w-4 mr-2" /> Fullscreen
        </DropdownMenuItem>
        <DropdownMenuItem onClick={p.onShortcuts}>
          <Keyboard className="h-4 w-4 mr-2" /> Keyboard Shortcuts
        </DropdownMenuItem>
        <DropdownMenuItem onClick={p.onYoutube}>
          <Youtube className="h-4 w-4 mr-2 text-brand-red" /> Subscribe on YouTube
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

