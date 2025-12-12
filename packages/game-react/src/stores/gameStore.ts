import { create } from 'zustand'
import { calculateScore } from '@quicky-finger/shared'

interface GameState {
  isPlaying: boolean
  sliderPosition: number
  currentScore: number | null
  bestScore: number
  
  // Computed
  hasScore: () => boolean
  
  // Actions
  startGame: () => void
  stopGame: () => void
  updatePosition: (position: number) => void
  resetGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  // State
  isPlaying: false,
  sliderPosition: 50,
  currentScore: null,
  bestScore: 0,
  
  // Computed
  hasScore: () => get().currentScore !== null,
  
  // Actions
  startGame: () => {
    set({
        isPlaying: true,
        currentScore: null,
        sliderPosition: 50,
    })
  },
  
  stopGame: () => {
    const { isPlaying, sliderPosition, bestScore } = get()
    if (!isPlaying) return
    
    const score = calculateScore(sliderPosition)
    
    set({
      isPlaying: false,
      currentScore: score,
      bestScore: score > bestScore ? score : bestScore,
    })
  },
  
  updatePosition: (position: number) => set({ sliderPosition: position }),
  
  resetGame: () => set({
    currentScore: null,
    sliderPosition: 50,
  }),
}))