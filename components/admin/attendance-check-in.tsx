"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, CameraOff, Check, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  recordManualCheckIn,
  recordQrCheckIn,
} from "@/lib/services/attendance-actions";
import type { AttendanceResult } from "@/lib/services/attendance-service";

export function AttendanceCheckIn() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isScanning || !videoRef.current) return;
    const reader = new BrowserMultiFormatReader();
    let active = true;
    let controls: { stop: () => void } | undefined;

    void reader
      .decodeFromVideoDevice(undefined, videoRef.current, (decoded) => {
        if (!active || !decoded) return;
        active = false;
        controls?.stop();
        setIsScanning(false);
        startTransition(() => {
          void recordQrCheckIn(decoded.getText())
            .then(setResult)
            .catch((error: unknown) => {
              setCameraError(
                error instanceof Error
                  ? error.message
                  : "Could not record attendance.",
              );
            });
        });
      })
      .then((readerControls) => {
        controls = readerControls;
        if (!active) controls.stop();
      })
      .catch((error: unknown) => {
        setIsScanning(false);
        setCameraError(
          error instanceof Error
            ? error.message
            : "Camera access is unavailable.",
        );
      });

    return () => {
      active = false;
      controls?.stop();
    };
  }, [isScanning]);

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setCameraError("");
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      void recordManualCheckIn(formData)
        .then(setResult)
        .catch((error: unknown) => {
          setCameraError(
            error instanceof Error
              ? error.message
              : "Could not record attendance.",
          );
        });
    });
    event.currentTarget.reset();
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
      <div className="rounded-lg border border-line bg-[#132d26] p-5 text-white sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-citrus">
              Reception
            </p>
            <h2 className="mt-2 text-lg font-semibold">Scan member QR</h2>
            <p className="mt-1 text-xs leading-5 text-white/60">
              Camera access requires localhost or HTTPS.
            </p>
          </div>
          <ScanLine aria-hidden="true" className="text-citrus" size={20} />
        </div>
        <div className="mt-5 grid aspect-video min-h-48 place-items-center overflow-hidden rounded-md border border-white/10 bg-black/25">
          <video
            className={`h-full w-full object-cover ${isScanning ? "block" : "hidden"}`}
            muted
            playsInline
            ref={videoRef}
          />
          {!isScanning && (
            <div className="px-5 text-center">
              {cameraError ? (
                <CameraOff className="mx-auto text-white/50" size={24} />
              ) : (
                <Camera className="mx-auto text-white/50" size={24} />
              )}
              <p className="mt-3 text-xs text-white/70">
                {cameraError || "Camera paused"}
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setCameraError("");
              setResult(null);
              setIsScanning((current) => !current);
            }}
            size="sm"
            variant="secondary"
          >
            {isScanning ? (
              <>
                <CameraOff size={15} />
                Stop camera
              </>
            ) : (
              <>
                <Camera size={15} />
                Start camera
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <section className="rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              Manual check-in
            </h2>
            <p className="mt-1 text-xs text-muted">
              Enter a member code when camera scanning is unavailable.
            </p>
          </div>
          <form className="flex gap-2 p-5" onSubmit={handleManualSubmit}>
            <input
              aria-label="Member code"
              autoCapitalize="characters"
              className="h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm uppercase outline-none focus:border-forest-soft focus:ring-2 focus:ring-forest-soft/15"
              name="memberCode"
              placeholder="GYM-000001"
              required
            />
            <Button disabled={isPending} size="sm" type="submit">
              {isPending ? "Checking..." : "Check in"}
            </Button>
          </form>
        </section>
        {result && (
          <section
            aria-live="polite"
            className={`rounded-lg border p-5 ${result.ok ? "border-forest/20 bg-forest/5" : "border-coral/20 bg-coral/5"}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-md ${result.ok ? "bg-forest text-white" : "bg-coral text-white"}`}
              >
                {result.ok ? <Check size={16} /> : <CameraOff size={16} />}
              </span>
              <div>
                <h2
                  className={`text-sm font-semibold ${result.ok ? "text-forest" : "text-coral"}`}
                >
                  {result.ok
                    ? "Check-in successful"
                    : result.code.replaceAll("_", " ")}
                </h2>
                <p className="mt-1 text-xs leading-5 text-foreground">
                  {result.ok
                    ? `${result.member.name} · ${result.member.member_code}`
                    : result.message}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
