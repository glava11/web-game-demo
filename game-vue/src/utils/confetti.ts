import confetti from 'canvas-confetti';

/**
 * Trigger confetti celebration
 */

export function celebratePerfectScore() {
	// Perfect score = 1000 points
	const duration = 3000;
	const end = Date.now() + duration;

	const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

	(function frame() {
		confetti({
			particleCount: 5,
			angle: 60,
			spread: 55,
			origin: {x: 0},
			colors: colors,
		});
		confetti({
			particleCount: 5,
			angle: 120,
			spread: 55,
			origin: {x: 1},
			colors: colors,
		});
		confetti({
			particleCount: 5,
			spread: 70,
			origin: {y: 0.6},
			colors: colors,
		});

		if (Date.now() < end) {
			requestAnimationFrame(frame);
		}
	})();
}

export function celebrateExcellentScore() {
	// 950+ points
	confetti({
		particleCount: 150,
		spread: 70,
		origin: {y: 0.6},
		colors: ['#3b82f6', '#8b5cf6', '#10b981', '#94a3b8'],
	});
}

export function celebrateGreatScore() {
	// 850+ points
	confetti({
		particleCount: 75,
		spread: 60,
		origin: {y: 0.6},
		colors: ['#3b82f6', '#10b981', '#94a3b8', '#64748b'],
	});
}

export function celebrateGoodScore() {
	// 700+ points
	confetti({
		particleCount: 50,
		spread: 50,
		origin: {y: 0.6},
		colors: ['#3b82f6', '#94a3b8', '#64748b'],
	});
}

export function celebrateScore(score: number) {
	if (score >= 995) {
		celebratePerfectScore();
	} else if (score >= 950) {
		celebrateExcellentScore();
	} else if (score >= 850) {
		celebrateGreatScore();
	} else if (score >= 700) {
		celebrateGoodScore();
	}
	// Below 700 = no confetti, try again!
}

/**
 * Confetti for new personal best
 */
export function celebrateNewBest() {
	const count = 200;
	const defaults = {
		origin: {y: 0.7},
	};

	function fire(particleRatio: number, opts: confetti.Options) {
		confetti({
			...defaults,
			...opts,
			particleCount: Math.floor(count * particleRatio),
		});
	}

	fire(0.25, {
		spread: 26,
		startVelocity: 55,
	});
	fire(0.2, {
		spread: 60,
	});
	fire(0.35, {
		spread: 100,
		decay: 0.91,
		scalar: 0.8,
	});
	fire(0.1, {
		spread: 120,
		startVelocity: 25,
		decay: 0.92,
		scalar: 1.2,
	});
	fire(0.1, {
		spread: 120,
		startVelocity: 45,
	});
}

/**
 * Custom confetti shapes and styles
 */
export function celebrateCreative() {
	const scalar = 2;
	const star = confetti.shapeFromText({text: '⭐', scalar});
	const fire = confetti.shapeFromText({text: '🔥', scalar});
	const trophy = confetti.shapeFromText({text: '🏆', scalar});

	confetti({
		shapes: [star, fire, trophy],
		particleCount: 50,
		spread: 100,
		origin: {y: 0.6},
		scalar,
	});
}
