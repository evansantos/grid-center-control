'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'grid-onboarding-seen'

const steps = [
  { title: 'Welcome to Grid Dashboard', description: 'Your command center for managing AI agents. Let\'s take a quick tour of the key features.' },
  { title: 'The Living Office', description: 'Watch your agents at work in real-time. Each card shows an agent\'s current status, activity, and health.' },
  { title: 'Click Any Agent for Details', description: 'Dive deeper into any agent\'s performance, logs, and configuration by clicking their card.' },
  { title: 'Use ⌘K for Quick Search', description: 'Press ⌘K (or Ctrl+K) anytime to quickly find agents, commands, and settings.' },
  { title: 'Check Analytics for Insights', description: 'Visit the Analytics tab to see trends, performance metrics, and system-wide statistics.' },
]

export function resetOnboarding() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function ResetOnboardingButton() {
  return (
    <button
      onClick={() => { resetOnboarding(); window.location.reload() }}
      className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
    >
      Replay Onboarding Tour
    </button>
  )
}

export function OnboardingTour() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
    setStep(0)
  }, [])

  if (!visible) return null

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Step counter */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-zinc-500 font-medium">{step + 1} of {steps.length}</span>
          <button onClick={finish} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Skip
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-zinc-800 rounded-full mb-5">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <h2 className="text-lg font-semibold text-zinc-100 mb-2">{current.title}</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">{current.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="px-4 py-2 text-sm rounded-md text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
          <button
            onClick={isLast ? finish : () => setStep(s => s + 1)}
            className="px-5 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
