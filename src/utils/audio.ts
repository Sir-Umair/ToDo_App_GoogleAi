// Web Audio API Synthesizer for deadline alarms with multiple selectable tones
import { AlarmTone } from '../types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private loopInterval: number | null = null;
  private isMuted: boolean = false;
  private currentTone: AlarmTone = 'chime';
  private customAudioElement: HTMLAudioElement | null = null;
  private isPlayingCustom: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarm();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play a single crisp completion chime
  public playChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Harmonic chime chord: A5 (880Hz), C#6 (1108Hz), E6 (1318Hz)
      const frequencies = [880, 1108.73, 1318.51];

      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.95);
      });
    } catch {
      // Audio playback prevented by browser policy until interaction
    }
  }

  // Play specific tone pulse
  public playTone(tone: AlarmTone = 'chime') {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      if (tone === 'digital') {
        // High-tech beep beep beep (square/sine fast sequence)
        const beeps = [0, 0.12, 0.24];
        beeps.forEach((start) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1046.50, now + start); // C6

          gain.gain.setValueAtTime(0, now + start);
          gain.gain.linearRampToValueAtTime(0.12, now + start + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + 0.09);
        });
      } else if (tone === 'radar') {
        // Sonar / radar sweep sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.52);
      } else if (tone === 'gentle') {
        // Soft calming ambient chime
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.12 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 1.25);
        });
      } else {
        // Classic chime: B5 -> E6 -> G6
        const pattern = [
          { freq: 987.77, start: 0, dur: 0.22 },
          { freq: 1318.51, start: 0.18, dur: 0.26 },
          { freq: 1567.98, start: 0.40, dur: 0.35 }
        ];

        pattern.forEach(({ freq, start, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + start);

          gain.gain.setValueAtTime(0, now + start);
          gain.gain.linearRampToValueAtTime(0.24, now + start + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + dur + 0.05);
        });
      }
    } catch {
      // Silent catch
    }
  }

  // Play alarm pulse using set tone
  public playAlarmPulse(tone?: AlarmTone) {
    this.playTone(tone || this.currentTone);
  }

  // Play a custom ringtone dataUrl (supports iPhone/iOS Safari, Android, and Desktop browsers)
  public playCustomAudio(dataUrl: string, loop: boolean = false): void {
    if (this.isMuted) return;
    this.stopAlarm();

    // Ensure AudioContext is unlocked for iOS Safari
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const audio = new Audio();
      audio.src = dataUrl;
      audio.loop = loop;
      audio.volume = 0.95;
      // Attributes recommended for iOS Safari audio playback
      audio.preload = 'auto';
      this.customAudioElement = audio;
      this.isPlayingCustom = true;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If iOS Safari or browser requires user gesture, fall back to Web Audio synth chime
          this.playTone('chime');
        });
      }

      if (!loop) {
        audio.onended = () => {
          this.isPlayingCustom = false;
          this.customAudioElement = null;
        };
      }
    } catch {
      this.playTone('chime');
    }
  }

  // Continuous alarm loop until dismissed, supporting both synth tones and custom ringtone dataUrls
  public startAlarm(tone: AlarmTone = 'chime', customDataUrl?: string) {
    if (this.isMuted) return;
    this.currentTone = tone;
    this.stopAlarm();

    if (tone === 'custom' && customDataUrl) {
      this.playCustomAudio(customDataUrl, true);
      return;
    }

    this.playAlarmPulse(tone);
    this.loopInterval = window.setInterval(() => {
      this.playAlarmPulse(this.currentTone);
    }, 1800);
  }

  public stopAlarm() {
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    if (this.customAudioElement) {
      try {
        this.customAudioElement.pause();
        this.customAudioElement.currentTime = 0;
      } catch {
        // Ignore
      }
      this.customAudioElement = null;
    }
    this.isPlayingCustom = false;
  }
}

export const soundManager = new SoundManager();
