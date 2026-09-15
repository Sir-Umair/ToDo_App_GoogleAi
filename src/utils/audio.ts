// Web Audio API Synthesizer for deadline alarms

class SoundManager {
  private ctx: AudioContext | null = null;
  private loopInterval: number | null = null;
  private isMuted: boolean = false;

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

  // Play a single crisp chime (used for completion or quick test)
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

  // Play alarm chime sequence
  public playAlarmPulse() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Two-tone attention chime (High bell alert)
      const pattern = [
        { freq: 987.77, start: 0, dur: 0.22 },    // B5
        { freq: 1318.51, start: 0.18, dur: 0.26 }, // E6
        { freq: 1567.98, start: 0.40, dur: 0.35 }  // G6
      ];

      pattern.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Richer, audible timbre
        osc.frequency.setValueAtTime(freq, now + start);

        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.25, now + start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur + 0.05);
      });
    } catch {
      // Silent catch
    }
  }

  // Continuous alarm loop until dismissed
  public startAlarm() {
    if (this.isMuted) return;
    this.stopAlarm();
    this.playAlarmPulse();
    this.loopInterval = window.setInterval(() => {
      this.playAlarmPulse();
    }, 1800);
  }

  public stopAlarm() {
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
