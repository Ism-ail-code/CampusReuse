import { useNavigate, useParams } from "react-router-dom"
import { MessageSquare } from "lucide-react"
import { ConversationList } from "@/components/messages/ConversationList"
import { ConversationThread } from "@/components/messages/ConversationThread"

export function ConversationPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.75rem-env(safe-area-inset-bottom))] max-w-5xl flex-col overflow-hidden bg-card md:h-[calc(100dvh-8rem)] md:rounded-2xl md:border md:shadow-card">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden overflow-y-auto border-r md:block md:w-80 lg:w-96">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-base font-bold">Messages</h2>
          </div>
          <ConversationList activeId={id} onSelect={(cid) => navigate(`/messages/${cid}`)} />
        </aside>
        <section className="min-w-0 flex-1">
          <ConversationThread conversationId={id} onBack={() => navigate("/messages")} />
        </section>
      </div>
    </div>
  )
}
