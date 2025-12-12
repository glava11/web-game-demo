import { useEffect } from 'react'
import { SliderGame } from './components/SliderGame'
import { Leaderboard } from './components/Leaderboard'
import { useLeaderboardStore } from './stores/leaderboardStore'
import { useWebSocket } from './hooks/useWebSocket'
import type { Player } from '@quicky-finger/shared'

function App() {
  const { setNickname } = useLeaderboardStore()
  const { connected, connect, disconnect, submitScore, onMessage } = useWebSocket()

  useEffect(() => {
    connect()
    
    // Set temporary nickname (will add proper input later)
    setNickname('ReactPlayer')
    
    onMessage('LEADERBOARD_UPDATE', (payload: { players: Player[] }) => {
      useLeaderboardStore.getState().updateLeaderboard(payload.players)
    })
    return () => disconnect()
  }, [])

  const handleScoreSubmit = (score: number) => {
    submitScore({
      nickname: useLeaderboardStore.getState().currentNickname,
      score,
      framework: 'react'
    })
  }

  return (
        <>
          {/* Connection status */}
          <div className="fixed top-4 right-4 z-50">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              connected 
                ? 'bg-opacity-20 success' 
                : 'bg-opacity-20 danger'
            }`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>

          {/* Main content */}
          <div className="container mx-auto px-0 py-20 md:px-4 md:py-8 md:space-y-8">
            <SliderGame onScoreSubmit={handleScoreSubmit} />
            <Leaderboard />

            <footer className="flex flex-col items-center justify-center">
              <span
                >© 2025 <a href="https://drazenorsolic.xyz">dražen o. glava</a></span
              >
              <span
                ><a href="https://github.com/glava11/web-game-demo">github</a></span
              >
            </footer>
          </div>
        </>
    
  )
}

export default App