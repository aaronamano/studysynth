// this component provides a toggle switch for selecting between PDF upload and text input

"use client"

import { Button } from "@/components/ui/button"
import { FileText, Type } from "lucide-react"

interface TopicInputSwitchProps {
  inputType: 'pdf' | 'text'
  onInputTypeChange: (type: 'pdf' | 'text') => void
}

export default function TopicInputSwitch({ inputType, onInputTypeChange }: TopicInputSwitchProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-black/40 border border-purple-500/30 rounded-lg">
      <Button
        variant={inputType === 'pdf' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onInputTypeChange('pdf')}
        className={`flex items-center gap-2 ${
          inputType === 'pdf' 
            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
            : 'text-purple-300 hover:text-purple-200 hover:bg-purple-900/20'
        }`}
      >
        <FileText className="h-4 w-4" />
        <span>PDF Upload</span>
      </Button>
      
      <Button
        variant={inputType === 'text' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onInputTypeChange('text')}
        className={`flex items-center gap-2 ${
          inputType === 'text' 
            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
            : 'text-purple-300 hover:text-purple-200 hover:bg-purple-900/20'
        }`}
      >
        <Type className="h-4 w-4" />
        <span>Text Input</span>
      </Button>
    </div>
  )
}