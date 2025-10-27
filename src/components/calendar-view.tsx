"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for study sessions
const studySessions = [
  {
    title: "Quantum Physics Midterm",
    date: new Date(2025, 10, 15),
    timeframe: "9:00 AM - 11:00 AM",
  },
  {
    title: "Organic Chemistry Final",
    date: new Date(2025, 10, 22),
    timeframe: "1:00 PM - 3:00 PM",
  },
  {
    title: "Calculus III Quiz",
    date: new Date(2025, 10, 28),
    timeframe: "10:00 AM - 11:30 AM",
  },
  {
    title: "Data Structures Project",
    date: new Date(2025, 11, 5),
    timeframe: "All Day",
  },
];

export function CalendarView() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2025, 10, 1))

  const studyDays = studySessions.map(session => session.date);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              modifiers={{ studyDay: studyDays }}
              modifiersClassNames={{
                studyDay: "bg-purple-500 text-white",
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Study Sessions</h2>
        <div className="space-y-4">
          {studySessions.map((session, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{session.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{session.date.toLocaleDateString()}</p>
                <p>{session.timeframe}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}