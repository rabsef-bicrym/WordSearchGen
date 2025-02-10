// app/components/WordSearchGenerator.tsx

// Word search generation algorithm based on wordfind by bunkat
// Original: https://github.com/bunkat/wordfind
// Used under MIT License

"use client"

import React, { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { shuffle, debounce } from "lodash-es"
import WorksheetSetup from "./WorksheetSetup"
import WordManagement from "./WordManagement"
import PuzzleSettings from "./PuzzleSettings"
import GridSizeControl from "./GridSizeControl"
import PuzzlePreview from "./PuzzlePreview"
import DonationButton from "./DonationButton"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

// Define orientation types for better type safety
type Orientation = {
  name: string
  vector: [number, number]
  requires: {
    backwards?: boolean
    upwards?: boolean
    diagonal?: boolean
  }
}

// Define all possible orientations with their requirements
const orientations: Orientation[] = [
  { name: "horizontal", vector: [1, 0], requires: {} },
  { name: "horizontalBack", vector: [-1, 0], requires: { backwards: true } },
  { name: "vertical", vector: [0, 1], requires: {} },
  { name: "verticalUp", vector: [0, -1], requires: { upwards: true } },
  { name: "diagonal", vector: [1, 1], requires: { diagonal: true } },
  { name: "diagonalUp", vector: [1, -1], requires: { diagonal: true, upwards: true } },
  { name: "diagonalBack", vector: [-1, 1], requires: { diagonal: true, backwards: true } },
  { name: "diagonalUpBack", vector: [-1, -1], requires: { diagonal: true, backwards: true, upwards: true } },
]

const WordSearchGenerator: React.FC = () => {
  // worksheet setup states
  const [title, setTitle] = useState("")
  const [className, setClassName] = useState("")
  const [includeTime, setIncludeTime] = useState(false)

  // word management state
  const [words, setWords] = useState<string[]>([])

  // puzzle settings
  const [allowBackwards, setAllowBackwards] = useState(false)
  const [allowUpwards, setAllowUpwards] = useState(false)
  const [allowDiagonal, setAllowDiagonal] = useState(false)
  const [wordListStyle, setWordListStyle] = useState("alphabetical")

  // grid & puzzle states
  const [gridSize, setGridSize] = useState(10)
  const [puzzle, setPuzzle] = useState<string[][] | null>(null)
  const [wordPositions, setWordPositions] = useState<{ [key: string]: { x: number; y: number }[] }>({})
  const [showSolution, setShowSolution] = useState(false)
  const [error, setError] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // calculate min grid size based on longest word
  const minGridSize = useMemo(() => {
    const longest = words.reduce((max, word) => Math.max(max, word.length), 5)
    return longest
  }, [words])

  // filter orientations based on settings
  const getAllowedOrientations = useCallback((): [number, number][] => {
    return orientations.filter(orientation => {
      // Check each requirement against the current settings
      const { backwards, upwards, diagonal } = orientation.requires
      
      if (backwards && !allowBackwards) return false
      if (upwards && !allowUpwards) return false
      if (diagonal && !allowDiagonal) return false
      
      return true
    }).map(o => o.vector)
  }, [allowBackwards, allowUpwards, allowDiagonal])

  // puzzle generation function
  const generatePuzzle = useCallback(
    (size: number) => {
      setIsGenerating(true)
      if (words.length === 0) {
        setError("please add at least one word")
        setIsGenerating(false)
        return
      }

      try {
        // create an empty grid (rows × cols)
        const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""))
        const newWordPositions: { [key: string]: { x: number; y: number }[] } = {}

        // sort words per selected style
        let sortedWords: string[]
        switch (wordListStyle) {
          case "alphabetical":
            sortedWords = [...words].sort()
            break
          case "byLength":
            sortedWords = [...words].sort((a, b) => b.length - a.length)
            break
          case "random":
            sortedWords = shuffle([...words])
            break
          default:
            sortedWords = [...words]
        }

        const allowedOrientations = getAllowedOrientations()

        // attempt to place each word
        for (const word of sortedWords) {
          let placed = false
          for (let attempts = 0; attempts < 100 && !placed; attempts++) {
            const orientation = allowedOrientations[Math.floor(Math.random() * allowedOrientations.length)]
            const x = Math.floor(Math.random() * size)
            const y = Math.floor(Math.random() * size)

            if (canPlaceWord(grid, word, x, y, orientation, size)) {
              placeWord(grid, word, x, y, orientation)
              newWordPositions[word] = []
              for (let i = 0; i < word.length; i++) {
                newWordPositions[word].push({ x: x + orientation[0] * i, y: y + orientation[1] * i })
              }
              placed = true
            }
          }
          if (!placed) {
            throw new Error(`unable to place word: ${word}. try increasing the grid size or removing some words.`)
          }
        }

        // fill empty cells with random letters
        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            if (grid[row][col] === "") {
              grid[row][col] = LETTERS[Math.floor(Math.random() * LETTERS.length)]
            }
          }
        }

        setPuzzle(grid)
        setWordPositions(newWordPositions)
        setError("")
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsGenerating(false)
      }
    },
    [words, wordListStyle, getAllowedOrientations],
  )

  // check if a word can be placed at (x,y) in the given orientation
  const canPlaceWord = (
    grid: string[][],
    word: string,
    x: number,
    y: number,
    orientation: [number, number],
    size: number,
  ): boolean => {
    for (let i = 0; i < word.length; i++) {
      const newX = x + orientation[0] * i
      const newY = y + orientation[1] * i
      if (
        newX < 0 ||
        newX >= size ||
        newY < 0 ||
        newY >= size ||
        (grid[newY][newX] !== "" && grid[newY][newX] !== word[i])
      ) {
        return false
      }
    }
    return true
  }

  // place the word on the grid
  const placeWord = (grid: string[][], word: string, x: number, y: number, orientation: [number, number]): void => {
    for (let i = 0; i < word.length; i++) {
      const newX = x + orientation[0] * i
      const newY = y + orientation[1] * i
      grid[newY][newX] = word[i]
    }
  }

  // debounce grid size changes
  const debouncedGenerate = useMemo(
    () =>
      debounce((size: number) => {
        generatePuzzle(size)
      }, 500),
    [generatePuzzle],
  )

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Word Search Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <WorksheetSetup
            title={title}
            setTitle={setTitle}
            className={className}
            setClassName={setClassName}
            includeTime={includeTime}
            setIncludeTime={setIncludeTime}
          />

          <Separator />

          <WordManagement words={words} setWords={setWords} />

          <Separator />

          <PuzzleSettings
            allowBackwards={allowBackwards}
            setAllowBackwards={setAllowBackwards}
            allowUpwards={allowUpwards}
            setAllowUpwards={setAllowUpwards}
            allowDiagonal={allowDiagonal}
            setAllowDiagonal={setAllowDiagonal}
            wordListStyle={wordListStyle}
            setWordListStyle={setWordListStyle}
          />

          <GridSizeControl
            gridSize={gridSize}
            setGridSize={setGridSize}
            minGridSize={minGridSize}
            debouncedGenerate={debouncedGenerate}
          />

          <Separator />
          <PuzzlePreview
            words={words}
            puzzle={puzzle}
            wordPositions={wordPositions}
            showSolution={showSolution}
            setShowSolution={setShowSolution}
            error={error}
            isGenerating={isGenerating}
            generatePuzzle={generatePuzzle}
            gridSize={gridSize}
            allowBackwards={allowBackwards}
            allowUpwards={allowUpwards}
            allowDiagonal={allowDiagonal}
            wordListStyle={wordListStyle}
            includeTime={includeTime}
            title={title}
            className={className}
          />
        </div>
        <div className="print:hidden">
            <DonationButton />
          </div>
      </CardContent>
    </Card>
  )
}

export default WordSearchGenerator