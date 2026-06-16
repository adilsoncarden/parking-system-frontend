import { useEffect, useRef, useState } from "react";

// OCR best-effort cargado bajo demanda desde CDN (no agrega dependencias al build).
const TESSERACT_CDN =
  "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js";

// Extrae una placa "LLL-DDD" (o lo más parecido) del texto crudo del OCR.
function extractPlate(raw) {
  const cleaned = (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, " ");
  const m =
    cleaned.match(/([A-Z]{3})\s*-?\s*(\d{3})/) ||
    cleaned.match(/([A-Z]{2,3})\s*-?\s*(\d{3,4})/);
  if (m) return `${m[1]}-${m[2]}`;
  const tokens = cleaned.split(/\s+/).filter((t) => t.length >= 4);
  tokens.sort((a, b) => b.length - a.length);
  return tokens[0] || "";
}

/**
 * Panel de cámara grande tipo CCTV, embebido en el Control de Acceso.
 * - Botón "Activar cámara" → muestra el video en vivo a tamaño completo.
 * - "Escanear placa" → captura un frame, corre OCR y llama onDetected(placa).
 * El campo de placa del formulario sigue siendo editable (esto solo lo rellena).
 */
export default function CameraPanel({ onDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | scanning | error
  const [errorMsg, setErrorMsg] = useState("");
  const [lastRead, setLastRead] = useState("");

  // Libera el video y el stream usando refs (sin tocar estado). Pausar y limpiar
  // el srcObject ANTES de cortar las pistas evita el AbortError "play() interrupted
  // by pause()" al navegar fuera con la cámara prendida.
  const teardown = () => {
    const v = videoRef.current;
    if (v) {
      try {
        v.pause();
      } catch {
        /* noop */
      }
      v.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const stopCamera = () => {
    teardown();
    setActive(false);
    setStatus("idle");
    setLastRead("");
  };

  // Al desmontar: solo libera (sin setState, que provocaría warnings/errores).
  useEffect(() => teardown, []);

  // Engancha el stream cuando el <video> YA está montado (active=true).
  // Llamamos play() nosotros y le ENGANCHAMOS un .catch: si teardown/stopCamera
  // interrumpe la reproducción (pause o srcObject=null) antes de que la promesa
  // resuelva, el AbortError "play() interrupted by pause()" se traga aquí en vez de
  // quedar como "Uncaught (in promise)" en la consola.
  useEffect(() => {
    if (active && streamRef.current && videoRef.current) {
      const v = videoRef.current;
      v.srcObject = streamRef.current;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, [active]);

  const startCamera = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(
        err?.name === "NotAllowedError"
          ? "Permiso de cámara denegado. Habilítalo en el navegador."
          : "No se pudo acceder a una cámara en este dispositivo.",
      );
      setStatus("error");
      setActive(false);
    }
  };

  const handleScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (status !== "ready" || !video || !canvas || !video.videoWidth) return;

    setStatus("scanning");
    setLastRead("");
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

      const mod = await import(/* @vite-ignore */ TESSERACT_CDN);
      const recognize = mod.recognize || mod.default?.recognize;
      const result = await recognize(canvas, "eng", {
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",
      });
      const plate = extractPlate(result?.data?.text || "");
      setLastRead(plate || "(sin lectura clara)");
      if (plate) onDetected(plate);
      setStatus("ready");
    } catch {
      setLastRead("");
      setErrorMsg("No se pudo procesar el OCR. Escribe o corrige la placa a mano.");
      setStatus("ready");
    }
  };

  return (
    <div className="mb-4">
      <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
        {/* Video en vivo */}
        {active && (
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        )}

        {/* Guía de encuadre */}
        {active && status !== "error" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-emerald-400/80 rounded-lg w-3/5 h-16 sm:h-20" />
          </div>
        )}

        {/* Estado: cámara apagada */}
        {!active && status !== "error" && (
          <div className="flex flex-col items-center justify-center text-center text-slate-300 gap-3 px-6">
            <span className="material-symbols-outlined text-5xl text-slate-500">photo_camera</span>
            <p className="text-sm text-slate-400">Cámara de lectura de placas</p>
            <button
              type="button"
              onClick={startCamera}
              disabled={status === "loading"}
              className="bg-white/95 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg hover:bg-white flex items-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">videocam</span>
              {status === "loading" ? "Iniciando…" : "Activar cámara"}
            </button>
          </div>
        )}

        {/* Estado: error */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center text-center text-slate-200 text-sm p-6 gap-2">
            <span className="material-symbols-outlined text-4xl text-amber-400">videocam_off</span>
            {errorMsg}
            <button
              type="button"
              onClick={startCamera}
              className="mt-1 bg-white/95 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Badge "EN VIVO" */}
        {active && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> EN VIVO
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controles bajo la cámara */}
      {active && (
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={handleScan}
            disabled={status !== "ready"}
            className="flex-1 py-2.5 rounded-lg font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              {status === "scanning" ? "hourglass_top" : "document_scanner"}
            </span>
            {status === "scanning" ? "Leyendo placa…" : "Escanear placa"}
          </button>
          <button
            type="button"
            onClick={stopCamera}
            title="Apagar cámara"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-base">videocam_off</span>
          </button>
        </div>
      )}

      {lastRead && status !== "error" && (
        <p className="text-center text-sm mt-2 text-slate-600">
          Lectura: <strong className="tracking-widest text-slate-900">{lastRead}</strong>
        </p>
      )}
    </div>
  );
}
