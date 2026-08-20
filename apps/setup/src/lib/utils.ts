import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Default twMerge only recognizes Tailwind's stock font-size scale
// (text-sm, text-lg, ... text-9xl) — none of this project's Foundations
// type-scale names (text-display-md, text-action, text-heading, etc.,
// all defined in index.css, not a JS tailwind.config) match that, so
// twMerge falls back to treating e.g. `text-display-md` as a text-*color*
// utility and drops it whenever a real color class like `text-foreground`
// sits next to it in the same className — silently shrinking text to the
// browser default. Registering these names under the `font-size` group
// (not `text-color`) fixes that misclassification at the source, for
// every current and future component using cn().
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-lg",
            "display-md",
            "heading",
            "body",
            "body-emphasis",
            "action",
            "caption",
            "label",
            "label-emphasis",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
