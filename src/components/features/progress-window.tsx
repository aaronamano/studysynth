"use client"

import { Loader2, BookOpen, Search, Calendar, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface ProgressWindowProps {
  isOpen: boolean
  progressData: Array<{ type: string; content: string; step?: number }>
  onClose: () => void
  isComplete: boolean
}

const stepConfig = {
  1: { icon: BookOpen, label: "Study Guide", color: "text-amber-400" },
  2: { icon: Search, label: "Resources", color: "text-blue-400" },
  3: { icon: Calendar, label: "Calendar Events", color: "text-green-400" },
  4: { icon: FileText, label: "Google Doc", color: "text-purple-400" },
  5: { icon: Calendar, label: "Calendar Sync", color: "text-pink-400" },
}

export default function ProgressWindow({ isOpen, progressData, onClose, isComplete }: ProgressWindowProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={`fixed right-0 top-0 z-50 h-full w-96 bg-[#1a1815] border-l border-amber-800/20 shadow-2xl transform transition-transform duration-300 ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-amber-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isComplete ? (
                <Loader2 className="w-4 h-4 text-amber-400/60 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="text-sm text-amber-200/80">
                {isComplete ? "Complete" : "Generating Study Plan"}
              </span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
              <AlertCircle className="w-4 h-4 text-amber-200/60" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <div className="space-y-3">
            {progressData.map((data, index) => {
              const stepInfo = data.step ? stepConfig[data.step as keyof typeof stepConfig] : null
              const Icon = stepInfo?.icon || CheckCircle

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                    data.type === 'error' ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/2 border border-white/5'
                  }`}
                >
                  <div className={`mt-0.5 ${stepInfo?.color || 'text-amber-400/60'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-amber-200/80">{data.content}</div>
                    {data.type === 'study_guide' && (
                      <div className="mt-2 p-2 bg-white/5 rounded text-xs text-amber-200/60 max-h-24 overflow-auto">
                        {data.content.substring(0, 200)}...
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {isComplete && (
          <div className="p-4 border-t border-amber-800/20">
            <button
              onClick={onClose}
              className="w-full py-2 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-lg text-xs text-white transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
