"use client"

import { useState, useEffect, useRef } from "react"

export function useCountUp(end, duration = 2000, start = 0) {
  const [count, setCount] = useState(start)
  const countRef = useRef(start)
  const timeRef = useRef(null)

  useEffect(() => {
    const startTime = Date.now()
    const endValue = Number(end)
    const startValue = Number(start)

    const updateCount = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const currentCount = Math.floor(startValue + progress * (endValue - startValue))

      if (countRef.current !== currentCount) {
        countRef.current = currentCount
        setCount(currentCount)
      }

      if (progress < 1) {
        timeRef.current = requestAnimationFrame(updateCount)
      }
    }

    timeRef.current = requestAnimationFrame(updateCount)

    return () => {
      if (timeRef.current) {
        cancelAnimationFrame(timeRef.current)
      }
    }
  }, [end, duration, start])

  return count
}
