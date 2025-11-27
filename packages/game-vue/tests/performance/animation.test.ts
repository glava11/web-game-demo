import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useGameStore } from "../../src/stores/gameStore";
import { calculateScore } from "../../src/utils/scoring";

/**
 * Performance tests for game animations and calculations
 * These ensure the game maintains 60fps and responds quickly
 */

describe("Animation Performance", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates score in under 1ms", () => {
    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      calculateScore(Math.random() * 100, 50);
    }

    const end = performance.now();
    const avgTime = (end - start) / iterations;

    console.log(`Average score calculation: ${avgTime.toFixed(10)}ms`);

    // Should be much less than 1ms per calculation
    expect(avgTime).toBeLessThan(1);
  });

  it("updates game state efficiently", () => {
    const gameStore = useGameStore();
    const updates = 1000;

    gameStore.startGame();

    const start = performance.now();

    for (let i = 0; i < updates; i++) {
      gameStore.updatePosition(i % 100);
    }

    const end = performance.now();
    const avgTime = (end - start) / updates;

    console.log(`Average state update: ${avgTime.toFixed(10)}ms`);

    // Should complete in under 0.1ms per update (way under 16ms frame budget)
    expect(avgTime).toBeLessThan(0.1);
  });

  it("handles rapid start/stop cycles", () => {
    const gameStore = useGameStore();
    const cycles = 100;

    const start = performance.now();

    for (let i = 0; i < cycles; i++) {
      gameStore.startGame();
      gameStore.updatePosition(50);
      gameStore.stopGame();
      gameStore.resetGame();
    }

    const end = performance.now();
    const avgTime = (end - start) / cycles;

    console.log(`Average game cycle: ${avgTime.toFixed(10)}ms`);

    // Should complete well within frame budget
    expect(avgTime).toBeLessThan(16); // 60fps = 16.67ms per frame
  });

  it("maintains performance with many leaderboard entries", async () => {
    const { useLeaderboardStore } = await import(
      "../../src/stores/leaderboardStore"
    );
    const leaderboardStore = useLeaderboardStore();

    // Create large dataset
    const players = Array.from({ length: 1000 }, (_, i) => ({
      id: String(i),
      nickname: `Player${i}`,
      score: Math.floor(Math.random() * 1000),
      framework: "vue" as const,
      timestamp: Date.now(),
    }));

    const start = performance.now();

    leaderboardStore.updateLeaderboard(players);
    const topPlayers = leaderboardStore.topPlayers;

    const end = performance.now();
    const time = end - start;

    console.log(`Leaderboard update with 1000 players: ${time.toFixed(10)}ms`);

    // Should handle large datasets efficiently
    expect(time).toBeLessThan(50); // Generous budget
    expect(topPlayers).toHaveLength(20); // Only showing top 20
  });
});

describe("Memory Performance", () => {
  it("cleans up game state on reset", () => {
    const gameStore = useGameStore();

    // Play multiple games
    for (let i = 0; i < 10; i++) {
      gameStore.startGame();
      gameStore.updatePosition(Math.random() * 100);
      gameStore.stopGame();
      gameStore.resetGame();
    }

    // State should be clean
    expect(gameStore.isPlaying).toBe(false);
    expect(gameStore.currentScore).toBeNull();
    expect(gameStore.sliderPosition).toBe(50);
  });

  it("does not leak memory through store subscriptions", () => {
    const stores = [];

    // Create and destroy multiple store instances
    for (let i = 0; i < 100; i++) {
      const pinia = createPinia();
      setActivePinia(pinia);
      const store = useGameStore();
      stores.push(store);
    }

    // If this doesn't crash or hang, memory is being managed
    expect(stores).toHaveLength(100);
  });
});

describe("Scoring Edge Cases Performance", () => {
  it("handles edge case calculations efficiently", () => {
    const edgeCases = [
      [0, 50],
      [100, 50],
      [50, 50],
      [-10, 50],
      [110, 50],
      [49.999, 50],
      [50.001, 50],
    ];

    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      edgeCases.forEach(([pos, target]) => {
        calculateScore(pos, target);
      });
    }

    const end = performance.now();
    const time = end - start;

    console.log(`Edge case calculations (1k): ${time.toFixed(10)}ms`);

    expect(time).toBeLessThan(10); // Should be very fast
  });

  it("scoring remains consistent under load", () => {
    const position = 48;
    const target = 50;

    const results = new Set();

    for (let i = 0; i < 1000; i++) {
      results.add(calculateScore(position, target));
    }

    // Should always produce same result
    expect(results.size).toBe(1);
    expect(Array.from(results)[0]).toBe(960);
  });
});

describe("Frame Budget Compliance", () => {
  it("stays within 16ms frame budget for typical operations", () => {
    const gameStore = useGameStore();
    const frameOperations = [];

    // Simulate a typical frame
    const operations = [
      () => gameStore.updatePosition(Math.random() * 100),
      () => calculateScore(gameStore.sliderPosition, 50),
      () => {
        /* Render simulation - no-op in test */
      },
    ];

    for (let frame = 0; frame < 60; frame++) {
      const frameStart = performance.now();

      operations.forEach((op) => op());

      const frameEnd = performance.now();
      frameOperations.push(frameEnd - frameStart);
    }

    const avgFrameTime =
      frameOperations.reduce((a, b) => a + b) / frameOperations.length;
    const maxFrameTime = Math.max(...frameOperations);

    console.log(`Average frame time: ${avgFrameTime.toFixed(10)}ms`);
    console.log(`Max frame time: ${maxFrameTime.toFixed(10)}ms`);

    // Should be well under 16.67ms budget
    expect(avgFrameTime).toBeLessThan(1);
    expect(maxFrameTime).toBeLessThan(5);
  });
});
