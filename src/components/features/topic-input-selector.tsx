// this component provides the unified interface for topic input with switch between PDF and text

"use client"

import TopicPdfImport from "./topic-pdf-import"
import TopicTextContent from "./topic-text-content"
import TopicInputSwitch from "./topic-input-switch"
import { useState } from "react"

export default function TopicInputSelector({ onValueChange }: { onValueChange: (value: File | string | null) => void }) {
  const [value, setValue] = useState<File | string | null>(null)
  const [inputType, setInputType] = useState<'pdf' | 'text'>('pdf')

  const handleValueChange = (newValue: File | string | null) => {
    if (inputType === 'pdf' && typeof newValue === 'string') {
      return
    }
    if (inputType === 'text' && newValue instanceof File) {
      return
    }
    setValue(newValue)
    onValueChange(newValue)
  }

  const handleInputTypeChange = (type: 'pdf' | 'text') => {
    setInputType(type)
    setValue(null)
    onValueChange(null)
  }

  return (
    <div className="space-y-4">
      <TopicInputSwitch 
        inputType={inputType}
        onInputTypeChange={handleInputTypeChange}
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