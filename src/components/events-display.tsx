import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle } from "lucide-react"
import type { EventsDisplayProps } from "@/lib/types"


export default function EventsDisplay({ events, isGenerating }: EventsDisplayProps) {
  if (isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-green-500">Study Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-amber-900/30 rounded w-3/4"></div>
            <div className="h-4 bg-amber-900/30 rounded w-2/3"></div>
            <div className="h-4 bg-amber-900/30 rounded w-4/5"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!events || events.length === 0) {
    return null
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDuration = (start: Date, end: Date) => {
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const durationMs = endTime - startTime
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`
    }
    return `${minutes}m`
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-green-500 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Study Schedule ({events.length} events)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <div key={index} className="border-l-4 border-green-500/60 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-amber-200 mb-1">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-amber-400/70 mb-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-amber-400/60">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {calculateDuration(event.startDate, event.endDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-amber-800/15">
          <p className="text-xs text-amber-400/50 text-center">
            All events have been added to your calendar
          </p>
        </div>
      </CardContent>
    </Card>
  )
}