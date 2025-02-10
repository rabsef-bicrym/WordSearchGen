// wordsearch/components/PuzzlePreview.tsx

"use client"

import React, { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import PrintableWordSearch from "./PrintableWordSearch"

interface PuzzlePreviewProps {
  words: string[]
  puzzle: string[][] | null
  wordPositions: { [key: string]: { x: number; y: number }[] }
  showSolution: boolean
  setShowSolution: (show: boolean) => void
  error: string
  isGenerating: boolean
  generatePuzzle: (size: number) => void
  gridSize: number
  allowBackwards: boolean
  allowUpwards: boolean
  allowDiagonal: boolean
  wordListStyle: string
  includeTime: boolean
  title: string
  className: string
}

const PuzzlePreview: React.FC<PuzzlePreviewProps> = ({
  words,
  puzzle,
  wordPositions,
  showSolution,
  setShowSolution,
  error,
  isGenerating,
  generatePuzzle,
  gridSize,
  allowBackwards,
  allowUpwards,
  allowDiagonal,
  wordListStyle,
  includeTime,
  title,
  className
}) => {
  const generatedInstructions = useMemo(() => {
    const parts = ["Find these vocabulary words in the puzzle!"]

    const directions: string[] = []
    directions.push("forward")
    if (allowBackwards) directions.push("backward")
    if (allowUpwards) directions.push("upward")
    if (allowDiagonal) {
      directions.push("diagonal")
      if (allowBackwards) directions.push("diagonal backward")
    }
    if (directions.length > 1) {
      const lastDir = directions.pop()
      parts.push(`Words can go ${directions.join(", ")} and ${lastDir}.`)
    }

    switch (wordListStyle) {
      case "alphabetical":
        parts.push("Words are listed in alphabetical order.")
        break
      case "byLength":
        parts.push("Words are listed by length, longest first.")
        break
      case "random":
        parts.push("Words are listed in random order.")
        break
    }

    if (includeTime) {
      parts.push("Record your start and end time.")
    }

    return parts.join(" ")
  }, [allowBackwards, allowUpwards, allowDiagonal, wordListStyle, includeTime])

  const isPartOfWord = (x: number, y: number) => {
    if (!showSolution) return false
    return Object.values(wordPositions).some((positions) =>
      positions.some((pos) => pos.x === x && pos.y === y),
    )
  }

  // local print handler: our hidden printable component is rendered in a print-only block
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* main preview visible on screen */}
      <div className="space-y-4 print:hidden">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Preview</h3>
          <div className="flex items-center space-x-2">
            <Switch
              checked={showSolution}
              onCheckedChange={setShowSolution}
              id="show-solution"
            />
            <Label htmlFor="show-solution">Show Solution</Label>
          </div>
        </div>

        {/* Instructions Preview */}
        <div className="bg-gray-50 p-4 rounded-lg text-sm">
          <p>{generatedInstructions}</p>
        </div>

        {/* Generate and Print buttons */}
        <div className="flex space-x-4">
          <Button onClick={() => generatePuzzle(gridSize)} className="flex-1">
            Generate Puzzle
          </Button>
          <Button onClick={handlePrint} className="flex-1" disabled={!puzzle}>
            Print Word Search
          </Button>
        </div>

        {/* Error message */}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Puzzle grid */}
        {puzzle && (
          <div className="mt-6 flex justify-center relative">
            {isGenerating && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <p className="text-lg font-semibold">Regenerating puzzle...</p>
              </div>
            )}
            <div
              className="grid gap-1 bg-gray-50 p-4 rounded-lg"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {puzzle.map((row, y) =>
                row.map((letter, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`w-8 h-8 flex items-center justify-center font-mono text-lg border border-gray-200 rounded transition-colors duration-200 ${
                      isPartOfWord(x, y)
                        ? "bg-blue-200 border-blue-300"
                        : "bg-white"
                    }`}
                  >
                    {letter.toUpperCase()}
                  </div>
                )),
              )}
            </div>
          </div>
        )}
      </div>

      {/* hidden printable version: visible only when printing */}
      <div className="hidden print:block">
        <PrintableWordSearch
          title={title}
          className={className}
          instructions={generatedInstructions}
          words={words}
          puzzle={puzzle}
          wordPositions={wordPositions}
          wordListStyle={wordListStyle}
          includeTime={includeTime}
        />
      </div>
    </>
  )
}

export default PuzzlePreview
