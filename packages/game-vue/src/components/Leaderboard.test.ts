import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import Leaderboard from "./LeaderBoard.vue";
import { useLeaderboardStore } from "../stores/leaderboardStore";
import type { Player } from "@quicky-finger/shared";

describe("Leaderboard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders leaderboard title", () => {
    const wrapper = mount(Leaderboard);
    expect(wrapper.text()).toContain("Global Leaderboard");
  });

  it("shows empty state when no players", () => {
    const wrapper = mount(Leaderboard);
    expect(wrapper.text()).toContain("No scores yet");
  });

  it("displays players in leaderboard", () => {
    const store = useLeaderboardStore();
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
        framework: "react",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    const wrapper = mount(Leaderboard);
    expect(wrapper.text()).toContain("Player1");
    expect(wrapper.text()).toContain("Player2");
    expect(wrapper.text()).toContain("1000");
    expect(wrapper.text()).toContain("900");
  });

  it("displays medals for top 3 players", () => {
    const store = useLeaderboardStore();
    const players: Player[] = [
      {
        id: "1",
        nickname: "First",
        score: 1000,
        framework: "vue",
        timestamp: Date.now(),
      },
      {
        id: "2",
        nickname: "Second",
        score: 900,
        framework: "vue",
        timestamp: Date.now(),
      },
      {
        id: "3",
        nickname: "Third",
        score: 800,
        framework: "vue",
        timestamp: Date.now(),
      },
      {
        id: "4",
        nickname: "Fourth",
        score: 700,
        framework: "vue",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    const wrapper = mount(Leaderboard);
    const html = wrapper.html();

    expect(html).toContain("🥇");
    expect(html).toContain("🥈");
    expect(html).toContain("🥉");
  });

  it("highlights current player row", () => {
    const store = useLeaderboardStore();
    store.setNickname("CurrentPlayer");

    const players: Player[] = [
      {
        id: "1",
        nickname: "OtherPlayer",
        score: 1000,
        framework: "vue",
        timestamp: Date.now(),
      },
      {
        id: "2",
        nickname: "CurrentPlayer",
        score: 900,
        framework: "vue",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    const wrapper = mount(Leaderboard);
    expect(wrapper.text()).toContain("(You)");
  });

  it("shows current player stats when they have a rank", () => {
    const store = useLeaderboardStore();
    store.setNickname("TestPlayer");

    const players: Player[] = [
      {
        id: "1",
        nickname: "Leader",
        score: 1000,
        framework: "vue",
        timestamp: Date.now(),
      },
      {
        id: "2",
        nickname: "TestPlayer",
        score: 800,
        framework: "vue",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    const wrapper = mount(Leaderboard);
    expect(wrapper.text()).toContain("Your Rank");
    expect(wrapper.text()).toContain("#2");
    expect(wrapper.text()).toContain("Your Score");
    expect(wrapper.text()).toContain("800");
  });

  it("displays framework emojis", () => {
    const store = useLeaderboardStore();
    const players: Player[] = [
      {
        id: "1",
        nickname: "VuePlayer",
        score: 900,
        framework: "vue",
        timestamp: Date.now(),
      },
      {
        id: "2",
        nickname: "ReactPlayer",
        score: 800,
        framework: "react",
        timestamp: Date.now(),
      },
      {
        id: "3",
        nickname: "AngularPlayer",
        score: 700,
        framework: "angular",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    const wrapper = mount(Leaderboard);
    const html = wrapper.html();

    expect(html).toContain("💚"); // Vue
    expect(html).toContain("⚛️"); // React
    expect(html).toContain("🅰️"); // Angular
  });

  it("shows player count", () => {
    const store = useLeaderboardStore();
    const players: Player[] = [
      {
        id: "1",
        nickname: "P1",
        score: 900,
        framework: "vue",
        timestamp: Date.now(),
      },
      {
        id: "2",
        nickname: "P2",
        score: 800,
        framework: "vue",
        timestamp: Date.now(),
      },
      {
        id: "3",
        nickname: "P3",
        score: 700,
        framework: "vue",
        timestamp: Date.now(),
      },
    ];

    store.updateLeaderboard(players);

    const wrapper = mount(Leaderboard);
    expect(wrapper.text()).toContain("3 players");
  });

  it("limits display to top 20 players", () => {
    const store = useLeaderboardStore();
    const players: Player[] = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      nickname: `Player${i}`,
      score: 1000 - i,
      framework: "vue" as const,
      timestamp: Date.now(),
    }));

    store.updateLeaderboard(players);

    const wrapper = mount(Leaderboard);
    const rows = wrapper.findAll("tbody tr");

    expect(rows.length).toBeLessThanOrEqual(20);
  });
});
