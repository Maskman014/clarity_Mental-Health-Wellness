import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { Shield, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useWellness } from "../context/WellnessContext";

export function VerifyPage() {
  const { verifyWellnessProof } = useWellness();
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "match" | "nomatch">("idle");
  const [streakLength, setStreakLength] = useState<number | undefined>();
  const [proofType, setProofType] = useState<string | undefined>();
  const [avgStress, setAvgStress] = useState<number | undefined>();

  const verify = useCallback(async (h: string) => {
    if (!h.trim()) return;
    setStatus("checking");
    setStreakLength(undefined);
    setProofType(undefined);
    setAvgStress(undefined);
    const result = await verifyWellnessProof(h.trim());
    if (result.found) { 
      setStreakLength(result.streakLength); 
      setProofType(result.proofType);
      setAvgStress(result.avgStress);
      setStatus("match"); 
    }
    else setStatus("nomatch");
  }, [verifyWellnessProof]);

  useEffect(() => {
    const h = new URLSearchParams(window.location.search).get("hash");
    if (h) { setHash(h); verify(h); }
  }, [verify]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)" }}>
      <div className="w-full max-w-md space-y-6">

        {/* Header card */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ZK Wellness Proof</h1>
              <p className="text-xs text-slate-400">Public verification · no login required</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-slate-400 font-medium">Proof Hash (SHA-256)</label>
            <textarea
              value={hash}
              onChange={(e) => { setHash(e.target.value); setStatus("idle"); setStreakLength(undefined); setProofType(undefined); setAvgStress(undefined); }}
              placeholder="Paste a proof hash here…"
              rows={3}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
            <button
              onClick={() => verify(hash)}
              disabled={!hash.trim() || status === "checking"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium text-sm hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "checking"
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                : <><Shield className="w-4 h-4" /> Verify Proof</>
              }
            </button>
          </div>
        </div>

        {/* Certificate card — VALID */}
        {status === "match" && (
          <div className="relative bg-slate-900 rounded-2xl p-8 border-2 border-emerald-500/60 shadow-[0_0_32px_rgba(16,185,129,0.25)]">
            {/* Corner decoration */}
            <div className="absolute top-4 right-4 opacity-10">
              <Shield className="w-20 h-20 text-emerald-400" />
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              {/* Badge icon */}
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                {proofType === 'low_stress' ? (
                  <>
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">Low-Stress Week Verified</p>
                    {avgStress !== undefined && (
                      <p className="text-6xl font-bold text-white leading-none">{avgStress.toFixed(1)}<span className="text-2xl text-slate-400 ml-1">avg stress</span></p>
                    )}
                    <p className="text-slate-400 text-sm mt-2">Low stress threshold maintained</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">Wellness Streak Verified</p>
                    {streakLength !== undefined && (
                      <p className="text-6xl font-bold text-white leading-none">{streakLength}<span className="text-2xl text-slate-400 ml-1">days</span></p>
                    )}
                    <p className="text-slate-400 text-sm mt-2">Consecutive wellness streak confirmed</p>
                  </>
                )}
              </div>

              <div className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-left">
                <p className="text-xs text-slate-500 mb-1">Proof Hash</p>
                <p className="font-mono text-xs text-emerald-300 break-all">{hash}</p>
              </div>

              <div className="mt-2 flex flex-col items-center">
                <div className="p-2 bg-white rounded-lg inline-block">
                  <QRCodeSVG value={`${window.location.origin}/verify?hash=${hash}`} size={100} />
                </div>
                <p className="text-xs text-slate-400 mt-2">Scan to verify</p>
              </div>

              <p className="text-xs text-slate-500">✓ No personal data was revealed · SHA-256 hash only</p>
            </div>
          </div>
        )}

        {/* Certificate card — NOT FOUND */}
        {status === "nomatch" && (
          <div className="relative bg-slate-900 rounded-2xl p-8 border-2 border-red-500/50 shadow-[0_0_24px_rgba(239,68,68,0.15)]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">Proof Not Found</p>
                <p className="text-slate-400 text-sm">This hash does not exist in the wellness_proofs table.</p>
              </div>
              <div className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-left">
                <p className="text-xs text-slate-500 mb-1">Queried Hash</p>
                <p className="font-mono text-xs text-red-300/70 break-all">{hash}</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs">
          Powered by <span className="text-emerald-400">Clarity</span> · Privacy-preserving wellness
        </p>
      </div>
    </div>
  );
}
