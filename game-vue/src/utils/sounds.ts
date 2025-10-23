/**
 * Simple sound effects using Web Audio API
 * No external files needed - generates tones programmatically
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;
  private activeOscillators: OscillatorNode[] = [];

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
  ) {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
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

  cleanup() {
    this.stopTension();
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (error) {
        // already stopped
        // console.warn('Error stopping oscillator:', error);
      }
    });
    this.activeOscillators = [];
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  // Countdown beeps - ascending tension
  playCountdownBeep() {
    this.playTone(440, 0.15, "square");
  }

  // GO! - exciting start
  playCountdownGo() {
    // this.playTone(880, 0.2, 'square');
    // setTimeout(() => this.playTone(1100, 0.25, 'square'), 100);
    this.playTone(444, 0.55, "square");
  }

  // Tension loop - plays while slider moves
  private tensionInterval: number | null = null;
  private tensionFrequency = 220;

  startTension() {
    this.stopTension(); // Clear any existing

    this.tensionInterval = window.setInterval(() => {
      // // Gradually increase frequency for building tension
      // this.tensionFrequency = Math.min(this.tensionFrequency + 5, 440);
      // this.playTone(this.tensionFrequency, 0.05, 'sawtooth');

      // // Option 1: Heartbeat style
      // this.playTone(100, 0.1, 'sine');
      // setTimeout(() => this.playTone(100, 0.1, 'sine'), 100);

      // // Option 2: Ticking clock
      // this.playTone(1000, 0.02, 'square');

      // Option 3: Rising siren
      this.tensionFrequency = Math.min(this.tensionFrequency + 10, 880);
      this.playTone(this.tensionFrequency, 0.05, "sawtooth");
    }, 500) as any;
  }

  stopTension() {
    if (this.tensionInterval) {
      clearInterval(this.tensionInterval);
      this.tensionInterval = null;
      this.tensionFrequency = 220; // Reset
    }
  }

  // Game start - ascending tone
  playStart() {
    this.playTone(440, 0.1);
    setTimeout(() => this.playTone(554, 0.15), 100);
  }

  // Stop button clicked - sharp beep
  playStop() {
    this.playTone(880, 0.05, "square");
  }

  // Score reveal - based on quality
  playScore(score: number) {
    if (score >= 995) {
      // Perfect - triumphant chord
      this.playTone(523, 0.3); // C
      setTimeout(() => this.playTone(659, 0.2), 100); // E
      setTimeout(() => this.playTone(784, 0.75), 200); // G
    } else if (score >= 900) {
      // Excellent - happy chirp
      this.playTone(659, 0.15);
      setTimeout(() => this.playTone(784, 0.15), 80);
      setTimeout(() => this.playTone(988, 0.2), 160);
    } else if (score >= 700) {
      // Good - pleasant tone
      this.playTone(523, 0.2);
      setTimeout(() => this.playTone(659, 0.2), 100);
    } else {
      // Try again - gentle nudge
      this.playTone(392, 0.15);
      setTimeout(() => this.playTone(330, 0.2), 100);
    }
  }

  // New best score - celebration
  playNewBest() {
    const notes = [523, 659, 784, 1047]; // C E G C
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15), i * 80);
    });
  }

  // Button hover - subtle click
  playHover() {
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
