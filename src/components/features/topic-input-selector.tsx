// this component provides the unified interface for topic input with switch between PDF and text

"use client"

import TopicPdfImport from "./topic-pdf-import"
import TopicTextContent from "./topic-text-content"
import TopicInputSwitch from "./topic-input-switch"
import type { TopicTextareaProps } from "@/lib/types"

export default function TopicInputSelector({ 
  value, 
  onChange, 
  inputType, 
  onInputTypeChange 
}: TopicTextareaProps) {
  const handleValueChange = (newValue: File | string | null) => {
    // Clear the other input type when switching
    if (inputType === 'pdf' && typeof newValue === 'string') {
      return
    }
    if (inputType === 'text' && newValue instanceof File) {
      return
    }
    onChange(newValue)
  }

  return (
    <div className="space-y-4">
      <TopicInputSwitch 
        inputType={inputType}
        onInputTypeChange={onInputTypeChange}
      />
      
      {inputType === 'pdf' ? (
        <TopicPdfImport 
          value={value instanceof File ? value : null}
          onChange={(file) => handleValueChange(file)}
        />
      ) : (
        <TopicTextContent 
          value={typeof value === 'string' ? value : ''}
          onChange={(text) => handleValueChange(text)}
        />
      )}
    </div>
  )
}