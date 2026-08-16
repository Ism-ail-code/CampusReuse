import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, initials } from "@/lib/utils"

interface Props {
  name: string
  src?: string | null
  className?: string
}

export function UserAvatar({ name, src, className }: Props) {
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarImage src={src ?? undefined} alt={name} />
      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
        {initials(name) || "?"}
      </AvatarFallback>
    </Avatar>
  )
}
