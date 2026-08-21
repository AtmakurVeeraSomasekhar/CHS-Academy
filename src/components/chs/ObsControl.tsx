import { useEffect, useRef, useState } from "react";
import OBSWebSocket from "obs-websocket-js";
import { Circle, Square, Settings2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const KEY = "chs.obs";
type Cfg = { host: string; port: string; password: string };
const DEFAULT: Cfg = { host: "localhost", port: "4455", password: "" };

type Status = "disconnected" | "connecting" | "connected" | "recording" | "error";

export function ObsControl() {
  const [cfg, setCfg] = useState<Cfg>(DEFAULT);
  const [status, setStatus] = useState<Status>("disconnected");
  const obsRef = useRef<OBSWebSocket | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCfg({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const connect = async () => {
    setStatus("connecting");
    const obs = new OBSWebSocket();
    try {
      await obs.connect(`ws://${cfg.host}:${cfg.port}`, cfg.password || undefined);
      obsRef.current = obs;
      setStatus("connected");
      obs.on("ConnectionClosed", () => setStatus("disconnected"));
      obs.on("RecordStateChanged", (d) => {
        if (d.outputActive) setStatus("recording");
        else setStatus("connected");
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[CHS] OBS connect failed", err);
      setStatus("error");
    }
  };

  const saveCfg = (next: Cfg) => {
    setCfg(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggleRecord = async () => {
    if (status === "disconnected" || status === "error") {
      await connect();
      return;
    }
    const obs = obsRef.current;
    if (!obs) return;
    try {
      if (status === "recording") {
        await obs.call("StopRecord");
        setStatus("connected");
      } else {
        await obs.call("StartRecord");
        setStatus("recording");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[CHS] OBS record toggle failed", err);
      setStatus("error");
    }
  };

  const label =
    status === "recording"
      ? "Stop"
      : status === "connected"
        ? "Record"
        : status === "connecting"
          ? "..."
          : "Connect";

  const dot =
    status === "recording"
      ? "bg-brand-red animate-pulse"
      : status === "connected"
        ? "bg-emerald-400"
        : status === "connecting"
          ? "bg-yellow-400"
          : status === "error"
            ? "bg-red-400"
            : "bg-white/40";

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-navy-elevated/80 border border-gold/30 pl-2 pr-1 py-1 shadow">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <button
        onClick={toggleRecord}
        title={
          status === "disconnected"
            ? "Connect to OBS (run OBS with obs-websocket enabled)"
            : "Toggle recording"
        }
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-black tracking-wider uppercase text-white hover:bg-white/10"
      >
        {status === "recording" ? (
          <Square className="h-3 w-3" fill="currentColor" />
        ) : (
          <Circle className="h-3 w-3 text-brand-red" fill="currentColor" />
        )}
        {label}
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="h-7 w-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70"
            title="OBS settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 bg-navy-panel text-white border-gold/30">
          <div className="space-y-2 text-xs">
            <div className="font-black tracking-widest uppercase text-gold">OBS WebSocket</div>
            <label className="block">
              <span className="text-white/70">Host</span>
              <input
                value={cfg.host}
                onChange={(e) => saveCfg({ ...cfg, host: e.target.value })}
                className="mt-1 w-full rounded-md bg-navy-deep border border-white/20 px-2 py-1"
              />
            </label>
            <label className="block">
              <span className="text-white/70">Port</span>
              <input
                value={cfg.port}
                onChange={(e) => saveCfg({ ...cfg, port: e.target.value })}
                className="mt-1 w-full rounded-md bg-navy-deep border border-white/20 px-2 py-1"
              />
            </label>
            <label className="block">
              <span className="text-white/70">Password</span>
              <input
                type="password"
                value={cfg.password}
                onChange={(e) => saveCfg({ ...cfg, password: e.target.value })}
                className="mt-1 w-full rounded-md bg-navy-deep border border-white/20 px-2 py-1"
              />
            </label>
            <button
              onClick={connect}
              className="w-full mt-2 rounded-md bg-gold text-navy-deep px-2 py-1 font-black text-xs"
            >
              Reconnect
            </button>
            <p className="text-[10px] text-white/50 leading-snug">
              Runs against a local OBS instance with the obs-websocket plugin. Password stored
              in this browser only — teacher workstation use.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
