// wordsearch/components/GridSizeControl.tsx

"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Slider } from "@/components/ui/slider"

interface GridSizeControlProps {
  gridSize: number
  setGridSize: (size: number) => void
  minGridSize: number
  debouncedGenerate: (size: number) => void
}

const GridSizeControl: React.FC<GridSizeControlProps> = ({ gridSize, setGridSize, minGridSize, debouncedGenerate }) => {
  const [tempGridSize, setTempGridSize] = useState(gridSize)
  const [isSliderDragging, setIsSliderDragging] = useState(false)

  const handleSizeChange = useCallback((value: number[]) => {
    setTempGridSize(value[0])
    setIsSliderDragging(true)
  }, [])

  const handleSliderDragEnd = useCallback(() => {
    setGridSize(tempGridSize)
    setIsSliderDragging(false)
    debouncedGenerate(tempGridSize)
  }, [tempGridSize, setGridSize, debouncedGenerate])

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h4 className="font-medium">Grid Size</h4>
        <span className="text-sm text-gray-500">
          {isSliderDragging ? tempGridSize : gridSize}×{isSliderDragging ? tempGridSize : gridSize} (min: {minGridSize})
        </span>
      </div>
      <Slider
        value={[isSliderDragging ? tempGridSize : gridSize]}
        onValueChange={handleSizeChange}
        onValueCommit={handleSliderDragEnd}
        min={minGridSize}
        max={20}
        step={1}
        className="w-full"
      />
    </div>
  )
}

export default GridSizeControl

