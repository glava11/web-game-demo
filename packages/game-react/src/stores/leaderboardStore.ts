import { create } from 'zustand'
import type { Player } from '@quicky-finger/shared'

interface LeaderboardState {
  players: Player[]
  currentNickname: string
  
  // Computed
  topPlayers: () => Player[]
  currentPlayerRank: () => number | null
  currentPlayerScore: () => number | null
  
  // Actions
  updateLeaderboard: (players: Player[]) => void
  setNickname: (nickname: string) => void
  clearNickname: () => void
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  // State
  players: [],
  currentNickname: '',
  
  // Computed
  topPlayers: () => get().players.slice(0, 20).sort((a, b) => b.score - a.score),
  
  currentPlayerRank: () => {
    const { currentNickname, players } = get()
    if (!currentNickname) return null
    const index = players.findIndex(p => p.nickname === currentNickname)
    return index >= 0 ? index + 1 : null
  },
  
  currentPlayerScore: () => {
    const { currentNickname, players } = get()
    if (!currentNickname) return null
    const player = players.find(p => p.nickname === currentNickname)
    return player?.score ?? null
  },
  
  // Actions
  updateLeaderboard: (players: Player[]) => set({ players }),
  
  setNickname: (nickname: string) => set({ currentNickname: nickname }),
  
  clearNickname: () => set({ currentNickname: '' }),
}))