import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-purple-500/30 placeholder:text-purple-500 focus-visible:border-purple-400 focus-visible:ring-purple-500/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-black/60 flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-lg shadow-purple-600/10 transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:bg-black/80",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
