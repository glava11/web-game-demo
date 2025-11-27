import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useLeaderboardStore } from "../../src/stores/leaderboardStore";
import { useGameStore } from "../../src/stores/gameStore";
import type { Player } from "@quicky-finger/shared";

/**
 * Integration tests for WebSocket flow
 * These tests verify the complete flow from game play to leaderboard update
 */

describe("WebSocket Integration Flow", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("Score Submission Flow", () => {
    it("completes full flow: play game -> submit score -> update leaderboard", () => {
      const gameStore = useGameStore();
      const leaderboardStore = useLeaderboardStore();

      // 1. Set nickname
      leaderboardStore.setNickname("TestPlayer");
      expect(leaderboardStore.currentNickname).toBe("TestPlayer");

      // 2. Start game
      gameStore.startGame();
      expect(gameStore.isPlaying).toBe(true);

      // 3. Simulate slider position
      gameStore.updatePosition(48); // Close to center

      // 4. Stop game (triggers score calculation)
      gameStore.stopGame();
      expect(gameStore.isPlaying).toBe(false);
      expect(gameStore.currentScore).toBeGreaterThan(0);

      // 5. Simulate leaderboard update from server
      const players: Player[] = [
        {
          id: "1",
          nickname: "TestPlayer",
          score: gameStore.currentScore!,
          framework: "vue",
          timestamp: Date.now(),
        },
      ];

      leaderboardStore.updateLeaderboard(players);

      // 6. Verify player appears in leaderboard
      expect(leaderboardStore.players).toHaveLength(1);
      expect(leaderboardStore.players[0].nickname).toBe("TestPlayer");
      expect(leaderboardStore.currentPlayerRank).toBe(1);
    });

    it("handles multiple players scoring", () => {
      const leaderboardStore = useLeaderboardStore();
      leaderboardStore.setNickname("Player2");

      const players: Player[] = [
        {
          id: "1",
          nickname: "Player1",
          score: 1000,
          framework: "vue",
          timestamp: Date.now(),
        },
        {
          id: "2",
          nickname: "Player2",
          score: 950,
          framework: "vue",
          timestamp: Date.now(),
        },
        {
          id: "3",
          nickname: "Player3",
          score: 900,
          framework: "react",
          timestamp: Date.now(),
        },
      ];

      leaderboardStore.updateLeaderboard(players);

      // Verify ranking is correct
      expect(leaderboardStore.currentPlayerRank).toBe(2);
      expect(leaderboardStore.currentPlayerScore).toBe(950);
      expect(leaderboardStore.topPlayers[0].score).toBe(1000);
    });

    it("allows same nickname to have multiple scores", () => {
      const leaderboardStore = useLeaderboardStore();
      leaderboardStore.setNickname("RetryPlayer");

      // Simulate multiple attempts by same player
      const players: Player[] = [
        {
          id: "1",
          nickname: "RetryPlayer",
          score: 800,
          framework: "vue",
          timestamp: Date.now() - 2000,
        },
        {
          id: "2",
          nickname: "RetryPlayer",
          score: 950,
          framework: "vue",
          timestamp: Date.now() - 1000,
        },
        {
          id: "3",
          nickname: "RetryPlayer",
          score: 1000,
          framework: "vue",
          timestamp: Date.now(),
        },
      ];

      leaderboardStore.updateLeaderboard(players);

      // All scores should be in leaderboard
      expect(leaderboardStore.players).toHaveLength(3);

      // Best score should be shown
      const playerScores = leaderboardStore.players
        .filter((p) => p.nickname === "RetryPlayer")
        .map((p) => p.score);

      expect(playerScores).toContain(800);
      expect(playerScores).toContain(950);
      expect(playerScores).toContain(1000);
    });
  });

  describe("Real-time Updates", () => {
    it("updates all clients when new score arrives", () => {
      const store1 = useLeaderboardStore();
      const store2 = useLeaderboardStore(); // Simulates second client

      const initialPlayers: Player[] = [
        {
          id: "1",
          nickname: "Player1",
          score: 900,
          framework: "vue",
          timestamp: Date.now(),
        },
      ];

      store1.updateLeaderboard(initialPlayers);
      store2.updateLeaderboard(initialPlayers);

      // Both stores should have same data
      expect(store1.players).toEqual(store2.players);

      // Simulate new score broadcast
      const updatedPlayers: Player[] = [
        ...initialPlayers,
        {
          id: "2",
          nickname: "Player2",
          score: 950,
          framework: "react",
          timestamp: Date.now(),
        },
      ];

      store1.updateLeaderboard(updatedPlayers);
      store2.updateLeaderboard(updatedPlayers);

      // Both stores should reflect the update
      expect(store1.players).toHaveLength(2);
      expect(store2.players).toHaveLength(2);
      expect(store1.topPlayers[0].score).toBe(950);
      expect(store2.topPlayers[0].score).toBe(950);
    });
  });

  describe("Edge Cases", () => {
    it("handles score submission without nickname gracefully", () => {
      const gameStore = useGameStore();
      const leaderboardStore = useLeaderboardStore();

      // No nickname set
      expect(leaderboardStore.currentNickname).toBe("");

      // Play game anyway
      gameStore.startGame();
      gameStore.updatePosition(50);
      gameStore.stopGame();

      // Score should be calculated locally
      expect(gameStore.currentScore).toBeGreaterThan(0);

      // But player won't be in leaderboard
      expect(leaderboardStore.currentPlayerRank).toBeNull();
    });

    it("handles empty leaderboard", () => {
      const leaderboardStore = useLeaderboardStore();

      leaderboardStore.updateLeaderboard([]);

      expect(leaderboardStore.players).toEqual([]);
      expect(leaderboardStore.topPlayers).toEqual([]);
      expect(leaderboardStore.currentPlayerRank).toBeNull();
    });

    it("limits leaderboard to top 20 players", () => {
      const leaderboardStore = useLeaderboardStore();

      const manyPlayers: Player[] = Array.from({ length: 30 }, (_, i) => ({
        id: String(i),
        nickname: `Player${i}`,
        score: 1000 - i,
        framework: "vue" as const,
        timestamp: Date.now(),
      }));

      leaderboardStore.updateLeaderboard(manyPlayers);

      // Should only show top 20
      expect(leaderboardStore.topPlayers).toHaveLength(20);
      expect(leaderboardStore.topPlayers[0].score).toBe(1000);
      expect(leaderboardStore.topPlayers[19].score).toBe(981);
    });
  });

  describe("Data Consistency", () => {
    it("maintains score order after multiple updates", () => {
      const leaderboardStore = useLeaderboardStore();

      // First update
      leaderboardStore.updateLeaderboard([
        {
          id: "1",
          nickname: "P1",
          score: 800,
          framework: "vue",
          timestamp: Date.now(),
        },
      ]);

      // Second update with more players
      leaderboardStore.updateLeaderboard([
        {
          id: "1",
          nickname: "P1",
          score: 800,
          framework: "vue",
          timestamp: Date.now(),
        },
        {
          id: "2",
          nickname: "P2",
          score: 950,
          framework: "react",
          timestamp: Date.now(),
        },
      ]);

      // Third update with even more
      leaderboardStore.updateLeaderboard([
        {
          id: "1",
          nickname: "P1",
          score: 800,
          framework: "vue",
          timestamp: Date.now(),
        },
        {
          id: "2",
          nickname: "P2",
          score: 950,
          framework: "react",
          timestamp: Date.now(),
        },
        {
          id: "3",
          nickname: "P3",
          score: 900,
          framework: "angular",
          timestamp: Date.now(),
        },
      ]);

      // Verify order is always maintained
      const scores = leaderboardStore.topPlayers.map((p) => p.score);
      const sortedScores = [...scores].sort((a, b) => b - a);

      expect(scores).toEqual(sortedScores);
    });
  });
});
