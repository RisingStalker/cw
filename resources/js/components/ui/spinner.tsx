import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTranslations, t } from "@/hooks/use-translations"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const translations = useTranslations();
  return (
    <Loader2Icon
      role="status"
      aria-label={t('loading', translations)}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
