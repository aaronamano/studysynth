import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-amber-700/25 placeholder:text-amber-400/50 focus-visible:border-amber-500 focus-visible:ring-amber-500/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-[#1a1815]/80 flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-lg shadow-amber-900/10 transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:bg-[#1f1d18]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
