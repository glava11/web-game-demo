import { useLeaderboardStore } from '../stores/leaderboardStore'

const frameworkEmoji: Record<string, string> = {
  vue: '💚',
  react: '⚛️',
  angular: '🅰️'
}

function getFrameworkEmoji(framework: string): string {
  return frameworkEmoji[framework] || '🎮'
}

function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function Leaderboard() {
  const { 
    players, 
    currentNickname, 
    topPlayers, 
    currentPlayerRank, 
    currentPlayerScore 
  } = useLeaderboardStore()

  const rank = currentPlayerRank()
  const score = currentPlayerScore()
  const top = topPlayers()

  return (
    <div className="max-w-4xl w-full mx-auto">
      <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🏆 Global Leaderboard</h2>
          <div className="text-sm text-gray-400">
            {players.length} players
          </div>
        </div>

        {/* Current player stats */}
        {rank && (
          <div className="bg-gray-700 rounded-lg p-4 mb-4 border-2 border-primary">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-400">Your Rank:</span>
                <span className="text-2xl font-bold ml-2 text-primary">
                  #{rank}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Your Score:</span>
                <span className="text-2xl font-bold ml-2 text-yellow-400">
                  {score}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard table */}
        {top.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No scores yet. Be the first! 🎯
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Player</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Framework</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {top.map((player, index) => {
                  const isCurrentPlayer = player.nickname === currentNickname
                  const rowClass = [
                    'hover:bg-gray-700 hover:bg-opacity-50 transition-colors',
                    index === 0 && 'bg-yellow-900 bg-opacity-20',
                    index === 1 && 'bg-gray-700 bg-opacity-30',
                    index === 2 && 'bg-orange-900 bg-opacity-20',
                    isCurrentPlayer && 'bg-primary bg-opacity-10'
                  ].filter(Boolean).join(' ')

                  return (
                    <tr key={player.id} className={rowClass}>
                      <td className="px-4 py-3 text-lg font-bold">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && <span className="text-gray-400">#{index + 1}</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {player.nickname}
                        {isCurrentPlayer && (
                          <span className="ml-2 text-xs text-primary">(You)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xl font-bold text-yellow-400">
                        {player.score}
                      </td>
                      <td className="px-4 py-3 text-2xl">
                        {getFrameworkEmoji(player.framework)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatTime(player.timestamp)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}