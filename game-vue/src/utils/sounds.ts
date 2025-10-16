/**
 * Simple sound effects using Web Audio API
 * No external files needed - generates tones programmatically
 */

class SoundManager {
	private audioContext: AudioContext | null = null;
	private enabled = true;

	private getContext(): AudioContext {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		}
		return this.audioContext;
	}

	setEnabled(enabled: boolean) {
		this.enabled = enabled;
	}

	private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
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
			gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

			oscillator.start(ctx.currentTime);
			oscillator.stop(ctx.currentTime + duration);
		} catch (error) {
			console.warn('Sound playback failed:', error);
		}
	}

	// Game start - ascending tone
	playStart() {
		this.playTone(440, 0.1);
		setTimeout(() => this.playTone(554, 0.15), 100);
	}

	// Stop button clicked - sharp beep
	playStop() {
		this.playTone(880, 0.05, 'square');
	}

	// Score reveal - based on quality
	playScore(score: number) {
		if (score === 1000) {
			// Perfect - triumphant chord
			this.playTone(523, 0.3); // C
			setTimeout(() => this.playTone(659, 0.3), 100); // E
			setTimeout(() => this.playTone(784, 0.5), 200); // G
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
		this.playTone(1000, 0.02, 'square');
	}
}

export const sounds = new SoundManager();

// Convenience functions
export const playStart = () => sounds.playStart();
export const playStop = () => sounds.playStop();
export const playScore = (score: number) => sounds.playScore(score);
export const playNewBest = () => sounds.playNewBest();
export const playHover = () => sounds.playHover();
export const setSoundsEnabled = (enabled: boolean) => sounds.setEnabled(enabled);
