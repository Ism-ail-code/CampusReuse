import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MessageSquare } from "lucide-react"
import { ConversationList } from "@/components/messages/ConversationList"
import { ConversationThread } from "@/components/messages/ConversationThread"

export function MessagesPage() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const select = (id: string) => {
    if (window.innerWidth >= 768) {
      setSelectedId(id)
    } else {
      navigate(`/messages/${id}`)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-5xl flex-col overflow-hidden rounded-2xl border bg-card shadow-card md:h-[calc(100vh-8rem)]">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-full overflow-y-auto border-r md:w-80 lg:w-96">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-base font-bold">Messages</h2>
          </div>
          <ConversationList key={selectedId ?? "inbox"} activeId={selectedId ?? undefined} onSelect={select} />
        </aside>
        <section className="hidden min-w-0 flex-1 md:block">
          {selectedId ? (
            <ConversationThread conversationId={selectedId} onBack={() => setSelectedId(null)} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30" aria-hidden />
                <p className="text-sm font-medium text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
