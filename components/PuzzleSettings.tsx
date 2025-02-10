// wordsearch/components/PuzzleSettings.tsx

import type React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface PuzzleSettingsProps {
  allowBackwards: boolean
  setAllowBackwards: (allow: boolean) => void
  allowUpwards: boolean
  setAllowUpwards: (allow: boolean) => void
  allowDiagonal: boolean
  setAllowDiagonal: (allow: boolean) => void
  wordListStyle: string
  setWordListStyle: (style: string) => void
}

const PuzzleSettings: React.FC<PuzzleSettingsProps> = ({
  allowBackwards,
  setAllowBackwards,
  allowUpwards,
  setAllowUpwards,
  allowDiagonal,
  setAllowDiagonal,
  wordListStyle,
  setWordListStyle,
}) => {
  return (
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
    </div>
  )
}

export default PuzzleSettings

