/**
 * Simple sound effects using Web Audio API
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;
  private activeOscillators: OscillatorNode[] = [];
  private activeTimeouts: number[] = [];

  private getContext(): AudioContext | null {
    if (!this.audioContext) {
      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) {
        this.enabled = false;
        console.warn("Web Audio API is not supported in this browser.");
        return null;
      }
      this.audioContext = new AudioCtx();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private trackTimeout(fn: () => void, delay: number): number {
    const id = window.setTimeout(() => {
      fn();
      // Remove from tracking after execution
      const index = this.activeTimeouts.indexOf(id);
      if (index > -1) this.activeTimeouts.splice(index, 1);
    }, delay);

    this.activeTimeouts.push(id);
    return id;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
  ): void {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return; // no audio support
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + duration,
      );

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      this.activeOscillators.push(oscillator);
      oscillator.onended = () => {
        const index = this.activeOscillators.indexOf(oscillator);
        if (index > -1) {
          this.activeOscillators.splice(index, 1);
        }
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.warn("Sound playback failed:", error);
    }
  }

  cleanup(): void {
    this.stopTension();

    this.activeTimeouts.forEach((id) => clearTimeout(id));
    this.activeTimeouts = [];

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (error) {
        // already stopped
        console.warn("Error stopping oscillator:", error);
      }
    });
    this.activeOscillators = [];

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  // Countdown beeps
  playCountdownBeep(): void {
    this.playTone(440, 0.15, "square");
  }

  // GO! beep
  playCountdownGo(): void {
    this.playTone(444, 0.55, "square");
  }

  // Tension loop
  private tensionInterval: number | null = null;
  private tensionFrequency = 220;

  startTension(): void {
    this.stopTension();

    this.tensionInterval = window.setInterval(() => {
      // Rising siren
      this.tensionFrequency = Math.min(this.tensionFrequency + 10, 880);
      this.playTone(this.tensionFrequency, 0.05, "sawtooth");
    }, 500) as number;
  }

  stopTension(): void {
    if (this.tensionInterval) {
      clearInterval(this.tensionInterval);
      this.tensionInterval = null;
      this.tensionFrequency = 220;
    }
  }

  // Game start - ascending tone
  playStart(): void {
    this.playTone(440, 0.1);
    this.trackTimeout(() => this.playTone(554, 0.15), 100);
  }

  // Stop button clicked - sharp beep
  playStop(): void {
    this.playTone(880, 0.05, "square");
  }

  // Score reveal
  playScore(score: number): void {
    if (score >= 995) {
      // Perfect - triumphant chord
      this.playTone(523, 0.3); // C
      this.trackTimeout(() => this.playTone(659, 0.2), 100); // E
      this.trackTimeout(() => this.playTone(784, 0.75), 200); // G
    } else if (score >= 900) {
      // Excellent - happy chirp
      this.playTone(659, 0.15);
      this.trackTimeout(() => this.playTone(784, 0.15), 80);
      this.trackTimeout(() => this.playTone(988, 0.2), 160);
    } else if (score >= 700) {
      // Good - pleasant tone
      this.playTone(523, 0.2);
      this.trackTimeout(() => this.playTone(659, 0.2), 100);
    } else {
      // Try again - gentle nudge
      this.playTone(392, 0.15);
      this.trackTimeout(() => this.playTone(330, 0.2), 100);
    }
  }

  // New best score - celebration
  playNewBest(): void {
    const notes = [523, 659, 784, 1047]; // C E G C
    notes.forEach((freq, i) => {
      this.trackTimeout(() => this.playTone(freq, 0.15), i * 80);
    });
  }

  // Button hover - subtle click
  playHover(): void {
    this.playTone(1000, 0.02, "square");
  }
}

export const sounds = new SoundManager();

// Convenience functions
export const playStart = () => sounds.playStart();
export const playStop = () => sounds.playStop();
export const playScore = (score: number) => sounds.playScore(score);
export const playNewBest = () => sounds.playNewBest();
export const playHover = () => sounds.playHover();
export const setSoundsEnabled = (enabled: boolean) =>
  sounds.setEnabled(enabled);
export const playCountdownBeep = () => sounds.playCountdownBeep();
export const playCountdownGo = () => sounds.playCountdownGo();
export const startTension = () => sounds.startTension();
export const stopTension = () => sounds.stopTension();
export const cleanupSounds = () => sounds.cleanup();
