'use client'

import { useEffect, useRef } from 'react'
import io, { Socket } from 'socket.io-client'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    fetch('/api/socketio').finally(() => {
      socketRef.current = io({
        path: '/api/socketio',
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  return socketRef.current
}