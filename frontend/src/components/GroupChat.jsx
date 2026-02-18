import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { sendMessage, getMessages } from "@/apis/chatApis"
import { toast } from "sonner"

export function GroupChat({ groupId, currentUserId }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [groupId])

  const fetchMessages = async () => {
    try {
      const data = await getMessages(groupId)
      setMessages(data.messages || [])
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch messages")
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setSendingMessage(true)
    try {
      await sendMessage(groupId, newMessage.trim())
      setNewMessage("")
      fetchMessages()
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-4 border rounded-lg ">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId._id === currentUserId
            return (
              <div key={msg._id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{msg.senderId.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <p className="text-xs text-muted-foreground mb-1">{msg.senderId.name}</p>
                  <div className={`rounded-lg px-3 py-2 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Textarea 
          placeholder="Type a message..." 
          className="min-h-[60px]" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage(e)
            }
          }}
        />
        <Button type="submit" size="icon" disabled={sendingMessage || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
