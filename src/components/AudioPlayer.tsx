import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  id: string;
  title: string;
  gradient: string;
}

// ── Synthesis helpers ────────────────────────────────────────────────────────

/** Rain: white-noise buffer through a broad lowpass. */
function playRain(ctx: AudioContext, masterGain: GainNode): AudioNode[] {
  const bufSize = ctx.sampleRate * 3;
  const buf = ctx.createBuffer(2, bufSize, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < bufSize; i++) ch[i] = Math.random() * 2 - 1;
  }

  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3500;
  lp.Q.value = 0.3;

  const boost = ctx.createGain();
  boost.gain.value = 1.5;

  src.connect(lp);
  lp.connect(boost);
  boost.connect(masterGain);
  src.start();

  return [src];
}

/** Waves: detuned sine pair with slow amplitude swell simulating ocean waves. */
function playWaves(ctx: AudioContext, masterGain: GainNode): AudioScheduledSource[] {
  // Two detuned oscillators create a natural "beating" effect like water
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 110;

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 115;

  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.value = 220;

  // Combine them
  const mix = ctx.createGain();
  mix.gain.value = 0.25;

  // Amplitude gain that will be modulated for "wave swell"
  const swellGain = ctx.createGain();
  swellGain.gain.value = 0.6;

  osc1.connect(mix);
  osc2.connect(mix);
  osc3.connect(mix);
  mix.connect(swellGain);
  swellGain.connect(masterGain);

  // LFO for wave-like amplitude swell (0.12 Hz = ~8 second cycle)
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.12;

  // The LFO modulates swellGain.gain
  // We want gain to go between 0.25 and 0.95 (never quite silent)
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.35;
  lfo.connect(lfoDepth);
  lfoDepth.connect(swellGain.gain);
  swellGain.gain.setValueAtTime(0.6, ctx.currentTime);

  osc1.start();
  osc2.start();
  osc3.start();
  lfo.start();

  return [osc1, osc2, osc3, lfo];
}

/** Ambient: stacked drone tones with slow tremolo. */
function playAmbient(ctx: AudioContext, masterGain: GainNode): AudioNode[] {
  const freqs = [55, 82.5, 110, 165, 220];
  const oscs = freqs.map((f, i) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    return o;
  });

  const mix = ctx.createGain();
  mix.gain.value = 0.18;
  oscs.forEach((o) => o.connect(mix));

  // Slow amplitude tremolo (0.08 Hz ≈ 12 seconds)
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08;

  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.25;

  const amplitudeNode = ctx.createGain();
  amplitudeNode.gain.value = 1.0;

  lfo.connect(lfoDepth);
  lfoDepth.connect(amplitudeNode.gain);

  mix.connect(amplitudeNode);
  amplitudeNode.connect(masterGain);

  oscs.forEach((o) => o.start());
  lfo.start();

  return [...oscs, lfo];
}

// ────────────────────────────────────────────────────────────────────────────

export function AudioPlayer({ id, title, gradient }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<AudioNode[]>([]);

  const stopSources = useCallback(() => {
    sourcesRef.current.forEach((node) => {
      try {
        (node as OscillatorNode | AudioBufferSourceNode).stop();
      } catch {
        // already stopped
      }
    });
    sourcesRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      stopSources();
      ctxRef.current?.close();
    };
  }, [stopSources]);

  const startAudio = useCallback(async () => {
    setError(null);
    try {
      if (ctxRef.current) await ctxRef.current.close();
      ctxRef.current = new AudioContext();
      if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();

      const ctx = ctxRef.current;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(volume * 0.6, ctx.currentTime + 0.5);
      master.connect(ctx.destination);
      masterRef.current = master;

      let sources: AudioNode[];
      if (id === 'rain') {
        sources = playRain(ctx, master);
      } else if (id === 'waves') {
        sources = playWaves(ctx, master);
      } else {
        sources = playAmbient(ctx, master);
      }
      sourcesRef.current = sources;
    } catch (err) {
      console.error('AudioPlayer error:', err);
      setError('Could not start audio. Try clicking again.');
      setIsPlaying(false);
    }
  }, [id, volume]);

  const stopAudio = useCallback(() => {
    const master = masterRef.current;
    const ctx = ctxRef.current;
    if (master && ctx && ctx.state !== 'closed') {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setTimeout(() => {
        stopSources();
        ctx.close().catch(() => {});
        ctxRef.current = null;
      }, 450);
    } else {
      stopSources();
    }
  }, [stopSources]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await startAudio();
    }
  }, [isPlaying, startAudio, stopAudio]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (masterRef.current && ctxRef.current && ctxRef.current.state !== 'closed' && isPlaying && !isMuted) {
      masterRef.current.gain.setValueAtTime(v * 0.6, ctxRef.current.currentTime);
    }
  }, [isPlaying, isMuted]);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    if (masterRef.current && ctxRef.current && ctxRef.current.state !== 'closed' && isPlaying) {
      masterRef.current.gain.setValueAtTime(
        next ? 0 : volume * 0.6,
        ctxRef.current.currentTime
      );
    }
  }, [isMuted, isPlaying, volume]);

  const barColor =
    id === 'rain' ? 'from-blue-500 to-cyan-400' :
    id === 'waves' ? 'from-teal-500 to-emerald-400' :
    'from-violet-500 to-indigo-400';

  return (
    <div className="group relative">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-300 rounded-2xl blur-xl"
        style={{ background: `linear-gradient(135deg, ${gradient})` }}
      />
      <div className="relative bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-sm">{title}</h3>
            <p className={`text-xs mt-0.5 ${isPlaying && !error ? 'text-emerald-400' : error ? 'text-red-400' : 'text-slate-500'}`}>
              {isPlaying && !error ? 'Playing' : error ? error : 'Tap to play'}
            </p>
          </div>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPlaying
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-600/60'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-emerald-500 bg-slate-700"
          />
          <span className="text-xs text-slate-500 w-8 text-right flex-shrink-0">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {isPlaying && !error && (
          <div className="flex gap-0.5 mt-4 h-5 items-end justify-center overflow-hidden">
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full bg-gradient-to-t ${barColor}`}
                style={{
                  height: `${40 + Math.abs(Math.sin(i * 0.8)) * 60}%`,
                  animation: `pulse ${0.35 + (i % 5) * 0.09}s ease-in-out ${i * 0.06}s infinite alternate`,
                  opacity: 0.7 + (i % 3) * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          from { transform: scaleY(0.5); }
          to   { transform: scaleY(1.0); }
        }
      `}</style>
    </div>
  );
}
