// components/WordManagement.tsx

"use client"

import type React from "react"
import { useState, useCallback, useRef, Dispatch, SetStateAction } from "react"
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
  const inputRef = useRef<HTMLInputElement>(null)
  const lastValidCursorPosition = useRef<number>(0)

  const validateWord = (word: string): boolean => {
    return /^[a-zA-Z]+$/.test(word)
  }

  const addWord = useCallback((wordToAdd: string) => {
    const trimmedWord = wordToAdd.trim()
    if (trimmedWord && validateWord(trimmedWord)) {
      setWords(prev => [...prev, trimmedWord.toLowerCase()])
      return true
    } else {
      // Trigger animations
      setIsShaking(true)
      setIsButtonFlashing(true)
      setTimeout(() => {
        setIsShaking(false)
        setIsButtonFlashing(false)
      }, 500)
      return false
    }
  }, [setWords])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (newWord) {
        const success = addWord(newWord)
        if (success) {
          setNewWord("")
          lastValidCursorPosition.current = 0
        }
      }
    } else {
      // Update last valid cursor position if the key is a letter
      if (/^[a-zA-Z]$/.test(e.key)) {
        lastValidCursorPosition.current = (e.target as HTMLInputElement).selectionStart! + 1
      }
    }
  }, [newWord, addWord])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    // Handle paste events (which come through as longer inputs)
    if (newValue.length > newWord.length + 1) {
      const words = newValue.split(/\s+/).filter(w => w)
      let addedAny = false
      
      words.forEach(word => {
        if (validateWord(word)) {
          addWord(word)
          addedAny = true
        }
      })
      
      if (addedAny) {
        setNewWord("")
        lastValidCursorPosition.current = 0
        return
      }
    }
    
    // For normal typing, only allow letters
    if (/^[a-zA-Z]*$/.test(newValue)) {
      setNewWord(newValue)
      lastValidCursorPosition.current = e.target.selectionStart!
    } else {
      // If invalid input, revert to previous value and restore cursor
      setNewWord(newWord)
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = lastValidCursorPosition.current
          inputRef.current.selectionEnd = lastValidCursorPosition.current
        }
      })
    }
  }, [newWord, addWord])

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
          ref={inputRef}
          value={newWord}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter words (space or enter to add)"
          className={`flex-1 ${isShaking ? "shake-animation" : ""}`}
        />
        <Button
          onClick={() => {
            if (addWord(newWord)) {
              setNewWord("")
              lastValidCursorPosition.current = 0
            }
          }}
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