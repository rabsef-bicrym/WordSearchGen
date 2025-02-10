"use client"

import { useState, useEffect } from "react"
import WordSearchGenerator from "../components/WordSearchGenerator"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <WordSearchGenerator />
    </main>
  )
}

