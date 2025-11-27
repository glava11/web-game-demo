import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useLeaderboardStore } from "./leaderboardStore";
import type { Player } from "@quicky-finger/shared";

describe("leaderboardStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initializes with empty state", () => {
    const store = useLeaderboardStore();

    expect(store.players).toEqual([]);
    expect(store.currentNickname).toBe("");
    expect(store.topPlayers).toEqual([]);
    expect(store.currentPlayerRank).toBeNull();
    expect(store.currentPlayerScore).toBeNull();
  });

  it("updates leaderboard with new players", () => {
    const store = useLeaderboardStore();
    const players: Player[] = [
      {
        id: "1",
        nickname: "Player1",
        score: 900,
        framework: "vue",
        timestamp: Date.now(),
      },
      {
        id: "2",
        nickname: "Player2",
        score: 800,
        framework: "react",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    expect(store.players).toEqual(players);
    expect(store.players.length).toBe(2);
  });

  it("sets current nickname", () => {
    const store = useLeaderboardStore();

    store.setNickname("TestPlayer");

    expect(store.currentNickname).toBe("TestPlayer");
  });

  it("clears current nickname", () => {
    const store = useLeaderboardStore();

    store.setNickname("TestPlayer");
    store.clearNickname();

    expect(store.currentNickname).toBe("");
  });

  it("returns top 20 players only", () => {
    const store = useLeaderboardStore();
    const players: Player[] = Array.from({ length: 30 }, (_, i) => ({
      id: String(i),
      nickname: `Player${i}`,
      score: 1000 - i,
      framework: "vue" as const,
      timestamp: Date.now(),
    }));

    store.updateLeaderboard(players);

    expect(store.topPlayers.length).toBe(20);
  });

  it("calculates current player rank correctly", () => {
    const store = useLeaderboardStore();
    store.setNickname("Player2");

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
        score: 900,
        framework: "vue",
        timestamp: Date.now(),
      },
      {
        id: "3",
        nickname: "Player3",
        score: 800,
        framework: "vue",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    expect(store.currentPlayerRank).toBe(2);
  });

  it("returns null rank when player not in leaderboard", () => {
    const store = useLeaderboardStore();
    store.setNickname("NonExistent");

    const players: Player[] = [
      {
        id: "1",
        nickname: "Player1",
        score: 1000,
        framework: "vue",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    expect(store.currentPlayerRank).toBeNull();
  });

  it("returns null rank when no nickname set", () => {
    const store = useLeaderboardStore();

    const players: Player[] = [
      {
        id: "1",
        nickname: "Player1",
        score: 1000,
        framework: "vue",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    expect(store.currentPlayerRank).toBeNull();
  });

  it("gets current player score correctly", () => {
    const store = useLeaderboardStore();
    store.setNickname("Player2");

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
        score: 850,
        framework: "vue",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    expect(store.currentPlayerScore).toBe(850);
  });

  it("returns null score when player not found", () => {
    const store = useLeaderboardStore();
    store.setNickname("NonExistent");

    const players: Player[] = [
      {
        id: "1",
        nickname: "Player1",
        score: 1000,
        framework: "vue",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    expect(store.currentPlayerScore).toBeNull();
  });

  it("handles empty leaderboard gracefully", () => {
    const store = useLeaderboardStore();
    store.setNickname("Player1");
    store.updateLeaderboard([]);

    expect(store.currentPlayerRank).toBeNull();
    expect(store.currentPlayerScore).toBeNull();
    expect(store.topPlayers).toEqual([]);
  });
});
