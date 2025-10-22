/**
 * Visual effects utilities
 */

export function flashScreen(color: string = '#ffffff', duration: number = 300) {
	// Create flash overlay
	const flash = document.createElement('div');
	flash.style.cssText = `
    position: fixed;
    inset: 0;
    background: ${color};
    pointer-events: none;
    z-index: 9999;
    animation: flashFade ${duration}ms ease-out;
  `;

	// Add flash animation keyframes if not exists
	if (!document.getElementById('flash-keyframes')) {
		const style = document.createElement('style');
		style.id = 'flash-keyframes';
		style.textContent = `
      @keyframes flashFade {
        0% { opacity: 0.8; }
        100% { opacity: 0; }
      }
    `;
		document.head.appendChild(style);
	}

	document.body.appendChild(flash);

	// Remove after animation
	setTimeout(() => {
		flash.remove();
	}, duration);
}

export function flashPerfect() {
	// Gold flash for perfect score
	flashScreen('#FFD700', 400);
}

export function flashExcellent() {
	// Blue flash for excellent score
	flashScreen('#3b82f6', 300);
}

export function vibrate(pattern: number | number[]) {
	if ('vibrate' in navigator) {
		navigator.vibrate(pattern);
	}
}

export function vibratePerfect() {
	// Strong, celebratory pattern
	vibrate([100, 50, 100, 50, 200]);
}

export function vibrateExcellent() {
	// Medium pattern
	vibrate([100, 50, 100]);
}

export function vibrateGood() {
	// Light pattern
	vibrate([50, 30, 50]);
}

export function vibrateStop() {
	// Single quick pulse
	vibrate(30);
}

export function playEffects(score: number) {
	if (score >= 995) {
		flashPerfect();
		vibratePerfect();
	} else if (score >= 950) {
		flashExcellent();
		vibrateExcellent();
	} else if (score >= 700) {
		vibrateGood();
	}
}
