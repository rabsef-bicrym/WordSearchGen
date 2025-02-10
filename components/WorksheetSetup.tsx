// wordsearch/components/WorksheetSetup.tsx

import type React from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface WorksheetSetupProps {
  title: string
  setTitle: (title: string) => void
  className: string
  setClassName: (className: string) => void
  includeTime: boolean
  setIncludeTime: (includeTime: boolean) => void
}

const WorksheetSetup: React.FC<WorksheetSetupProps> = ({
  title,
  setTitle,
  className,
  setClassName,
  includeTime,
  setIncludeTime,
}) => {
  return (
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
  )
}

export default WorksheetSetup

