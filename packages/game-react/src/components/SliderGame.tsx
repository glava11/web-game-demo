import { useGameStore } from '../stores/gameStore'
import { useGameLoop } from '../hooks/useGameLoop'
import { getScoreRating } from '@quicky-finger/shared'

interface Props {
  onScoreSubmit: (score: number) => void
}

export function SliderGame({ onScoreSubmit }: Props) {
  const { 
    isPlaying, 
    sliderPosition,
    currentScore, 
    bestScore,
    hasScore,
    startGame, 
    stopGame, 
    resetGame 
  } = useGameStore()

  const { direction } = useGameLoop()
  useGameLoop()

  const handleStart = () => {
    startGame()
  }

  const handleStop = () => {
    console.log('Stopping.. | Score:', useGameStore.getState().currentScore)
    stopGame()
    if (currentScore !== null) {
      onScoreSubmit(currentScore)
    }
  }

  const handlePlayAgain = () => {
    resetGame()
    startGame()
  }

  return (
    <div className="game-container max-w-sm sm:max-w-4xl w-full mx-auto">
      {/* Game Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl sm:text-7xl xl:text-9xl px-1 font-bold mb-2 max-w-max text-silver press-start-2p flicker">Quicky Finger</h1>
        <p className="text-gray-400">Stop the slider as close to center as possible!</p>
      </div>

      {/* FPS */}
      <div className="fps-counter fixed top-4 left-4 text-sm text-gray-400 mt-2">
        FPS:
        <span className="font-mono">
          `${0 || "--"} / ${0 || "--"}`
        </span>
      </div>

      {/* Best Score */}
      {bestScore > 0 && (
        <div className="text-center mb-4">
          <p className="text-sm text-gray-400">
            Best Score: <span className="text-yellow-400 font-bold">{bestScore}</span>
          </p>
        </div>
      )}

      {/* Game Area */}
      <div className="rounded-xl p-2 md:p-8 shadow-2xl game-area">
        
        {/* Slider Track */}
        {isPlaying && (
          <div className="mb-8">
            <div className="relative h-40 rounded-lg overflow-hidden max-w-full">
              {/* Target line */}
              <div 
                className="absolute top-0 bottom-0 w-1" 
                style={{ left: '50%',
                         transform: 'translateX(-50%)',
                         backgroundColor: 'var(--color-gold)' }}
              />
              
              {/* Moving slider */}
              <div 
                className={"slider absolute top-0 bottom-0 w-2 rounded transition-transform " + (direction.current == 1 ? 'right' : 'left')}
                style={{ 
                  left: `${sliderPosition}%`,
                  transform: 'translateX(-50%)',
                  willChange: 'transform',
                  backgroundColor: 'var(--color-success)'
                }}
              />
            </div>
            
            <div className="text-center mt-2 text-gray-400 text-sm">
              Position: {Math.round(sliderPosition)}%
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-4 h-full">
          {!isPlaying && !hasScore() && (
            <button 
              onClick={handleStart}
              className="btn btn-primary start-btn press-start-2p pulse-btn"
            >
              Start Game
            </button>
          )}

          {isPlaying && (
            <button 
              onClick={handleStop}
              className="btn btn-danger stop-btn animate-pulse stop-button-shake press-start-2p"
            >
              STOP!
            </button>
          )}
        </div>

        {/* Score Display */}
        {hasScore() && currentScore !== null && (
          <div className="text-center mt-8">
            <div className="mb-6">
              <p className="text-6xl font-bold text-primary mb-2">
                {currentScore}
              </p>
              <p className="text-2xl text-gray-300">
                {getScoreRating(currentScore)}
              </p>
            </div>

            <div className="text-gray-400 mb-6">
              <p>Final Position: {Math.round(sliderPosition)}%</p>
              <p>Distance from Center: {Math.abs(Math.round(sliderPosition - 50))}%</p>
            </div>

            <button 
              onClick={handlePlayAgain}
              className="px-8 py-3 bg-success hover:bg-green-600 text-white text-xl font-semibold rounded-lg transition-all"
            >
              🔄 Play Again
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>🎯 Perfect center (50%) = 1000 points</p>
        <p>📉 Every 1% away = -20 points</p>
      </div>
    </div>
  )
}