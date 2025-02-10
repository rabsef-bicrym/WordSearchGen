"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { shuffle, maxBy } from "lodash"

// Port of the WordFind functionality
const LETTERS = "abcdefghijklmnoprstuvwy"
const allOrientations = [
  "horizontal",
  "horizontalBack",
  "vertical",
  "verticalUp",
  "diagonal",
  "diagonalUp",
  "diagonalBack",
  "diagonalUpBack",
]

const orientations = {
  horizontal: (x, y, i) => ({ x: x + i, y: y }),
  horizontalBack: (x, y, i) => ({ x: x - i, y: y }),
  vertical: (x, y, i) => ({ x: x, y: y + i }),
  verticalUp: (x, y, i) => ({ x: x, y: y - i }),
  diagonal: (x, y, i) => ({ x: x + i, y: y + i }),
  diagonalBack: (x, y, i) => ({ x: x - i, y: y + i }),
  diagonalUp: (x, y, i) => ({ x: x + i, y: y - i }),
  diagonalUpBack: (x, y, i) => ({ x: x - i, y: y - i }),
}

const checkOrientations = {
  horizontal: (x, y, h, w, l) => w >= x + l,
  horizontalBack: (x, y, h, w, l) => x + 1 >= l,
  vertical: (x, y, h, w, l) => h >= y + l,
  verticalUp: (x, y, h, w, l) => y + 1 >= l,
  diagonal: (x, y, h, w, l) => w >= x + l && h >= y + l,
  diagonalBack: (x, y, h, w, l) => x + 1 >= l && h >= y + l,
  diagonalUp: (x, y, h, w, l) => w >= x + l && y + 1 >= l,
  diagonalUpBack: (x, y, h, w, l) => x + 1 >= l && y + 1 >= l,
}

const WordSearchGenerator = () => {
  // Basic setup states
  const [title, setTitle] = useState("")
  const [className, setClassName] = useState("")
  const [includeTime, setIncludeTime] = useState(false)

  // Word management states
  const [words, setWords] = useState([])
  const [newWord, setNewWord] = useState("")

  // Puzzle configuration states
  const [allowBackwards, setAllowBackwards] = useState(false)
  const [allowUpwards, setAllowUpwards] = useState(false)
  const [allowDiagonal, setAllowDiagonal] = useState(false)
  const [wordListStyle, setWordListStyle] = useState("alphabetical")
  const [isShaking, setIsShaking] = useState(false)
  const [isButtonFlashing, setIsButtonFlashing] = useState(false)

  // Grid and puzzle states
  const [gridSize, setGridSize] = useState(10)
  const [puzzle, setPuzzle] = useState(null)
  const [wordPositions, setWordPositions] = useState({})
  const [showSolution, setShowSolution] = useState(false)
  const [error, setError] = useState("")

  // Calculate minimum grid size based on longest word
  const minGridSize = useMemo(() => {
    const longestWordLength = words.reduce((max, word) => Math.max(max, word.length), 5)
    return longestWordLength
  }, [words])

  // Adjust grid size when minimum changes
  useEffect(() => {
    if (gridSize < minGridSize) {
      const newSize = Math.min(minGridSize + 2, 20) // Give some padding but stay under max
      setGridSize(newSize)
    }
  }, [minGridSize, gridSize])

  const validateWord = (word) => {
    return /^[a-zA-Z]+$/.test(word)
  }

  const addWord = useCallback(() => {
    const trimmedWord = newWord.trim()
    if (trimmedWord && validateWord(trimmedWord)) {
      setWords((prev) => [...prev, trimmedWord.toLowerCase()])
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
  }, [newWord, validateWord]) // Added validateWord to dependencies

  const removeWord = useCallback((index) => {
    setWords((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const generatePuzzle = useCallback(
    (size) => {
      if (words.length === 0) {
        setError("Please add at least one word")
        return
      }

      try {
        // Initialize empty puzzle grid
        const grid = Array(size)
          .fill()
          .map(() => Array(size).fill(""))

        // Sort words according to selected style
        let sortedWords
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

        const newWordPositions = {}

        // Filter orientations based on settings
        const allowedOrientations = allOrientations.filter((orientation) => {
          if (!allowBackwards && orientation.includes("Back")) return false
          if (!allowUpwards && orientation.includes("Up")) return false
          if (!allowDiagonal && orientation.includes("diagonal")) return false
          // Only allow diagonal back if both diagonal and backwards are enabled
          if (orientation.includes("diagonalBack") && !(allowDiagonal && allowBackwards)) return false
          return true
        })

        // Try to place each word
        sortedWords.forEach((word) => {
          let placed = false
          const validPositions = []

          // Try orientations in random order
          const shuffledOrientations = shuffle(allowedOrientations)
          shuffledOrientations.forEach((orientation) => {
            if (placed) return

            // Create array of all possible positions and shuffle them
            const positions = []
            for (let y = 0; y < size; y++) {
              for (let x = 0; x < size; x++) {
                positions.push({ x, y })
              }
            }
            const shuffledPositions = shuffle(positions)

            // Try each position in random order
            shuffledPositions.forEach((pos) => {
              if (placed) return
              const x = pos.x
              const y = pos.y

              if (checkOrientations[orientation](x, y, size, size, word.length)) {
                // Check if word fits at this position and orientation
                let fits = true
                let overlap = 0
                const positions = []

                for (let i = 0; i < word.length; i++) {
                  const pos = orientations[orientation](x, y, i)
                  const current = grid[pos.y][pos.x]

                  if (current && current !== word[i]) {
                    fits = false
                    break
                  }
                  if (current === word[i]) {
                    overlap++
                  }
                  positions.push(pos)
                }

                if (fits) {
                  validPositions.push({ positions, overlap })
                }
              }
            })
          })

          // Place the word in the best position (maximum overlap)
          if (validPositions.length > 0) {
            const bestPosition = maxBy(validPositions, "overlap")
            bestPosition.positions.forEach((pos, i) => {
              grid[pos.y][pos.x] = word[i]
            })
            // Store the positions for this word
            newWordPositions[word] = bestPosition.positions
            placed = true
          }
        })

        // Fill remaining spaces with random letters
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            if (!grid[y][x]) {
              grid[y][x] = LETTERS[Math.floor(Math.random() * LETTERS.length)]
            }
          }
        }

        setPuzzle(grid)
        setWordPositions(newWordPositions)
        setError("")
      } catch (err) {
        setError(err.message)
      }
    },
    [words, allowBackwards, allowUpwards, allowDiagonal, wordListStyle],
  )

  // Check if a cell position is part of a solution word
  const isPartOfWord = useCallback(
    (x, y) => {
      if (!showSolution) return false
      return Object.values(wordPositions).some((positions) => positions.some((pos) => pos.x === x && pos.y === y))
    },
    [wordPositions, showSolution],
  )

  // Generate instructions based on settings
  const instructions = useMemo(() => {
    const parts = ["Find these vocabulary words in the puzzle!"]

    // Direction instructions
    const directions = []
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

    // Word list style
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

    // Time tracking
    if (includeTime) {
      parts.push("Record your start and end time.")
    }

    return parts.join(" ")
  }, [allowBackwards, allowUpwards, allowDiagonal, wordListStyle, includeTime])

  // Debounced version of generatePuzzle for smooth slider interaction
  const debouncedGenerate = useMemo(() => _.debounce((size) => generatePuzzle(size), 100), [generatePuzzle])

  // Handle slider change
  const handleSizeChange = useCallback(
    (value) => {
      setGridSize(value[0])
      debouncedGenerate(value[0])
    },
    [debouncedGenerate],
  )

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Word Search Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Main Setup Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Worksheet Setup</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Word Search Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Ancient Egypt Vocabulary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g., Period 3"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={includeTime} onCheckedChange={setIncludeTime} id="time-tracking" />
              <Label htmlFor="time-tracking">Include time tracking for students</Label>
            </div>
          </div>

          <Separator />

          {/* Word Management Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Word Management</h3>
            <div className="flex gap-2">
              <Input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addWord()}
                placeholder="Enter a vocabulary word (letters only)"
                className={`flex-1 ${isShaking ? "shake-animation" : ""}`}
              />
              <Button
                onClick={addWord}
                className={isButtonFlashing ? "flash-animation" : ""}
                style={{ "--btn-bg": "var(--background)" }}
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

          <Separator />

          {/* Puzzle Settings Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Puzzle Settings</h3>

            <div className="grid grid-cols-2 gap-8">
              {/* Difficulty Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Difficulty Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch checked={allowBackwards} onCheckedChange={setAllowBackwards} id="allow-backwards" />
                    <Label htmlFor="allow-backwards">Allow backward words</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={allowUpwards} onCheckedChange={setAllowUpwards} id="allow-upwards" />
                    <Label htmlFor="allow-upwards">Allow upward words</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={allowDiagonal} onCheckedChange={setAllowDiagonal} id="allow-diagonal" />
                    <Label htmlFor="allow-diagonal">Allow diagonal words</Label>
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Word List Display</h4>
                <RadioGroup value={wordListStyle} onValueChange={setWordListStyle} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alphabetical" id="alphabetical" />
                    <Label htmlFor="alphabetical">Alphabetical order</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="random" id="random" />
                    <Label htmlFor="random">Random order</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="byLength" id="byLength" />
                    <Label htmlFor="byLength">Group by length</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Grid Size Control */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <h4 className="font-medium">Grid Size</h4>
                <span className="text-sm text-gray-500">
                  {gridSize}×{gridSize} (min: {minGridSize})
                </span>
              </div>
              <Slider
                value={[gridSize]}
                onValueChange={handleSizeChange}
                min={minGridSize}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Preview</h3>
              <div className="flex items-center space-x-2">
                <Switch checked={showSolution} onCheckedChange={setShowSolution} id="show-solution" />
                <Label htmlFor="show-solution">Show Solution</Label>
              </div>
            </div>

            {/* Instructions Preview */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p>{instructions}</p>
            </div>

            {/* Generate button */}
            <Button onClick={() => generatePuzzle(gridSize)} className="w-full">
              Generate Puzzle
            </Button>

            {/* Error message */}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            {/* Puzzle grid */}
            {puzzle && (
              <div className="mt-6 flex justify-center">
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
                          isPartOfWord(x, y) ? "bg-blue-200 border-blue-300" : "bg-white"
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
        </div>
      </CardContent>
    </Card>
  )
}

export default WordSearchGenerator

