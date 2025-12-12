import { useState, useRef, useEffect, useCallback } from 'react'
import type { GameMessage, ScoreSubmission } from '@quicky-finger/shared'

const WS_URL = 'ws://localhost:8080'

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const handlersRef = useRef(new Map<string, (payload: any) => void>())

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
        setError(null)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setConnected(false)
      }

      ws.onerror = () => {
        console.error('WebSocket error')
        setError('Connection error')
      }

      ws.onmessage = (event) => {
        try {
          const message: GameMessage = JSON.parse(event.data)
          const handler = handlersRef.current.get(message.type)
          if (handler && message.payload) {
            handler(message.payload)
          }
        } catch (err) {
          console.error('Failed to parse message:', err)
        }
      }

      wsRef.current = ws
    } catch (err) {
      setError('Failed to connect')
      console.error('Connection failed:', err)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onopen = null
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      wsRef.current.close()
      wsRef.current = null
    }
    handlersRef.current.clear()
  }, [])

  const send = useCallback((message: GameMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected')
    }
  }, [])

  const submitScore = useCallback((submission: ScoreSubmission) => {
    send({
      type: 'SCORE_SUBMIT',
      payload: submission,
    })
  }, [send])

  const onMessage = useCallback((type: string, handler: (payload: any) => void) => {
    handlersRef.current.set(type, handler)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connected,
    error,
    connect,
    disconnect,
    send,
    submitScore,
    onMessage,
  }
}