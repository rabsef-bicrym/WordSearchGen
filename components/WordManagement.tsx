// wordsearch/components/WordManagement.tsx

"use client"

import type React from "react"
import { useState, useCallback, Dispatch, SetStateAction } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface WordManagementProps {
  words: string[]
  setWords: Dispatch<SetStateAction<string[]>>
}

const WordManagement: React.FC<WordManagementProps> = ({ words, setWords }) => {
  const [newWord, setNewWord] = useState("")
  const [isShaking, setIsShaking] = useState(false)
  const [isButtonFlashing, setIsButtonFlashing] = useState(false)

  const addWord = useCallback(() => {
    const validateWord = (word: string): boolean => {
      return /^[a-zA-Z]+$/.test(word)
    }

    const trimmedWord = newWord.trim()
    if (trimmedWord && validateWord(trimmedWord)) {
      setWords(prev => [...prev, trimmedWord.toLowerCase()])
      setNewWord("")
    } else {
      // Trigger animations
      setIsShaking(true)
      setIsButtonFlashing(true)
      setTimeout(() => {
        setIsShaking(false)
        setIsButtonFlashing(false)
      }, 500)
    }
  }, [newWord, setWords])

  const removeWord = useCallback(
    (index: number) => {
      setWords(prev => prev.filter((_, i) => i !== index))
    },
    [setWords]
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Word Management</h3>
      <div className="flex gap-2">
        <Input
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addWord()}
          placeholder="Enter a vocabulary word (letters only)"
          className={`flex-1 ${isShaking ? "shake-animation" : ""}`}
        />
        <Button
          onClick={addWord}
          className={isButtonFlashing ? "flash-animation" : ""}
          style={{ "--btn-bg": "var(--background)" } as React.CSSProperties}
        >
          Add Word
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((word, index) => (
          <div key={index} className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2">
            <span>{word}</span>
            <button onClick={() => removeWord(index)} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WordManagement