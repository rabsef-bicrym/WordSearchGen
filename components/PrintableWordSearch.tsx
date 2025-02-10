// components/PrintableWordSearch.tsx

import React, { useMemo } from "react"
import { shuffle } from "lodash-es"

interface PrintableWordSearchProps {
  title: string
  className: string
  instructions: string
  words: string[]
  puzzle: string[][] | null
  wordPositions: { [key: string]: { x: number; y: number }[] }
  wordListStyle: string
  includeTime: boolean
}

const PrintableWordSearch: React.FC<PrintableWordSearchProps> = ({
  title,
  className,
  instructions,
  words,
  puzzle,
  wordPositions,
  wordListStyle,
  includeTime,
}) => {
  const sortedWords = useMemo(() => {
    switch (wordListStyle) {
      case "alphabetical":
        return [...words].sort()
      case "byLength":
        return [...words].sort((a, b) => b.length - a.length)
      case "random":
        return shuffle([...words])
      default:
        return words
    }
  }, [words, wordListStyle])

  const highlightedCells = useMemo(() => {
    const set = new Set<string>()
    Object.values(wordPositions).forEach((positions) => {
      positions.forEach((pos) => {
        set.add(`${pos.x}-${pos.y}`)
      })
    })
    return set
  }, [wordPositions])

  if (!puzzle) return null

  // Landscape-optimized styles
  const pageStyle: React.CSSProperties = {
    width: "11in",
    height: "8.5in",
    margin: "0 auto",
    padding: "0.5in",
    pageBreakAfter: "always",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
  }

  const headerStyle: React.CSSProperties = {
    textAlign: "center",
    marginBottom: "0.3in",
  }

  const titleStyle: React.CSSProperties = {
    fontSize: "24pt",
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: "0.15in",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: "14pt",
    color: "#2d3748",
    marginBottom: "0.15in",
  }

  const nameStyle: React.CSSProperties = {
    fontSize: "14pt",
    color: "#2d3748",
    marginBottom: "0.15in",
    display: "flex",
    justifyContent: "center",
    gap: "0.3in",
  }

  const nameInputStyle: React.CSSProperties = {
    borderBottom: "1px solid #cbd5e0",
    minWidth: "3in",
  }

  const instructionsStyle: React.CSSProperties = {
    fontSize: "11pt",
    color: "#4a5568",
    lineHeight: 1.4,
    marginBottom: "0.2in",
  }

  const contentStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5in",
    flex: 1,
    justifyContent: "center",
  }

  const wordListContainerStyle: React.CSSProperties = {
    flex: "0 0 2in",
  }

  const wordListTitleStyle: React.CSSProperties = {
    fontSize: "12pt",
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: "0.15in",
    textTransform: "uppercase",
  }

  const wordItemStyle: React.CSSProperties = {
    padding: "0.1in",
    fontSize: "11pt",
    marginBottom: "0.1in",
  }

  const gridContainerStyle: React.CSSProperties = {
    flex: "0 0 6.5in",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }

  const gridStyle = (size: number): React.CSSProperties => ({
    display: "grid",
    gridTemplateColumns: `repeat(${size}, 1fr)`,
    gap: "0.15in",
    width: "5.8in",
    height: "5.8in",
    alignItems: "center",
    justifyItems: "center",
    margin: "auto",
  })

  const cellStyle = (isHighlighted: boolean): React.CSSProperties => ({
    backgroundColor: isHighlighted ? "#bfdbfe" : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16pt",
    fontWeight: "500",
    width: "100%",
    height: "100%",
    color: "#1a365d",
  })

  const timeTrackingStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: "1in",
    marginTop: "0.2in",
    fontSize: "11pt",
    color: "#4a5568",
  }

  const timeInputStyle: React.CSSProperties = {
    borderBottom: "1px solid #cbd5e0",
    paddingBottom: "2px",
    minWidth: "1.2in",
    textAlign: "center",
  }

  const renderHeader = () => (
    <div style={headerStyle}>
      <div style={titleStyle}>{title || "Word Search Puzzle"}</div>
      <div style={nameStyle}>
        Name: <span style={nameInputStyle}></span>
      </div>
      <div style={subtitleStyle}>Class: {className || "_________________"}</div>
      <div style={instructionsStyle}>{instructions}</div>
      {includeTime && (
        <div style={timeTrackingStyle}>
          <div>
            Start Time: <span style={timeInputStyle}>__________</span>
          </div>
          <div>
            End Time: <span style={timeInputStyle}>__________</span>
          </div>
        </div>
      )}
    </div>
  )

  const renderWordList = () => (
    <div style={wordListContainerStyle}>
      <div style={wordListTitleStyle}>Word List:</div>
      {sortedWords.map((word, idx) => (
        <div key={idx} style={wordItemStyle}>
          {word.toUpperCase()}
        </div>
      ))}
    </div>
  )

  const renderGrid = (showSolution: boolean) => (
    <div style={gridContainerStyle}>
      <div style={gridStyle(puzzle[0].length)}>
        {puzzle.map((row, y) =>
          row.map((letter, x) => {
            const isHighlighted = showSolution && highlightedCells.has(`${x}-${y}`)
            return (
              <div key={`${x}-${y}`} style={cellStyle(isHighlighted)}>
                {letter.toUpperCase()}
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  const renderPage = (showSolution: boolean) => (
    <div style={pageStyle} className={`wordsearch-page ${showSolution ? 'teacher-copy' : 'student-copy'}`}>
      {renderHeader()}
      <div style={contentStyle}>
        {renderWordList()}
        {renderGrid(showSolution)}
      </div>
    </div>
  )

  return (
    <div className="print-container">
      {renderPage(true)}  {/* Teacher's copy */}
      {renderPage(false)} {/* Student's copy */}
    </div>
  )
}

export default PrintableWordSearch