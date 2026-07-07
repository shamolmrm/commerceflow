'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endTime: Date
  className?: string
}

export default function CountdownTimer({ endTime, className }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = endTime.getTime() - Date.now()
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 }
      return {
        hours:   Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      }
    }
    setMounted(true)
    setTimeLeft(calc())
    const id = setInterval(() => setTimeLeft(calc()), 1000)
    return () => clearInterval(id)
  }, [endTime])

  const pad = (n: number) => String(n).padStart(2, '0')

  const blocks = mounted
    ? [
        { value: pad(timeLeft.hours),   label: 'HRS' },
        { value: pad(timeLeft.minutes), label: 'MIN' },
        { value: pad(timeLeft.seconds), label: 'SEC' },
      ]
    : [
        { value: '--', label: 'HRS' },
        { value: '--', label: 'MIN' },
        { value: '--', label: 'SEC' },
      ]

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {blocks.map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-1">
          <div className="bg-navy-800 text-white rounded-lg px-3 py-1.5 text-center min-w-[48px]">
            <div className="text-xl font-bold tabular-nums leading-none">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
          {i < 2 && <span className="text-navy-800 font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  )
}
