'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type SoundType = 'notification' | 'complete' | 'error' | 'spawn'

interface SoundEffectsContextValue {
  playSound: (type: SoundType) => void
  enabled: boolean
  toggleSound: () => void
}

const SoundEffectsContext = createContext<SoundEffectsContextValue>({
  playSound: () => {},
  enabled: false,
  toggleSound: () => {},
})

const STORAGE_KEY = 'grid-sounds-enabled'

function playNotification(ctx: AudioContext) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.frequency.value = 800
  g.gain.setValueAtTime(0.3, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
  o.connect(g).connect(ctx.destination)
  o.start(); o.stop(ctx.currentTime + 0.1)
}

function playComplete(ctx: AudioContext) {
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.frequency.setValueAtTime(600, t)
  o.frequency.setValueAtTime(900, t + 0.1)
  g.gain.setValueAtTime(0.3, t)
  g.gain.exponentialRampToValueAtTime(0.01, t + 0.2)
  o.connect(g).connect(ctx.destination)
  o.start(); o.stop(t + 0.2)
}

function playError(ctx: AudioContext) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sawtooth'
  o.frequency.value = 200
  g.gain.setValueAtTime(0.3, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
  o.connect(g).connect(ctx.destination)
  o.start(); o.stop(ctx.currentTime + 0.2)
}

function playSpawn(ctx: AudioContext) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.frequency.setValueAtTime(400, ctx.currentTime)
  o.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15)
  g.gain.setValueAtTime(0.3, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
  o.connect(g).connect(ctx.destination)
  o.start(); o.stop(ctx.currentTime + 0.15)
}

const players: Record<SoundType, (ctx: AudioContext) => void> = {
  notification: playNotification,
  complete: playComplete,
  error: playError,
  spawn: playSpawn,
}

export function SoundEffectsProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    setEnabled(localStorage.getItem(STORAGE_KEY) === 'true')
  }, [])

  const toggleSound = useCallback(() => {
    setEnabled(prev => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') ctx.resume()
    players[type]?.(ctx)
  }, [enabled])

  return (
    <SoundEffectsContext.Provider value={{ playSound, enabled, toggleSound }}>
      {children}
    </SoundEffectsContext.Provider>
  )
}

export function useSoundEffects() {
  return useContext(SoundEffectsContext)
}
