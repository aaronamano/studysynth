import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-amber-600 to-orange-700 text-amber-100 shadow-lg shadow-amber-600/20 hover:from-amber-500 hover:to-orange-600 hover:shadow-xl hover:shadow-amber-500/30 border border-amber-600/30 hover:scale-[1.02] hover:shadow-amber-500/25",
        destructive:
          "bg-gradient-to-r from-red-800 to-red-900 text-red-100 shadow-lg shadow-red-900/30 hover:from-red-700 hover:to-red-800 border border-red-700/40",
        outline:
          "border border-amber-700/40 bg-transparent text-amber-200/80 shadow-sm hover:bg-amber-900/25 hover:text-amber-100 hover:border-amber-600/60",
        secondary:
          "bg-[#1a1815]/80 text-amber-300/80 border border-amber-800/25 shadow-md shadow-amber-900/10 hover:bg-amber-900/25 hover:border-amber-700/40 hover:text-amber-200",
        ghost:
          "hover:bg-amber-900/25 hover:text-amber-100 text-amber-200/70",
        link: "text-amber-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-full gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-full px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
