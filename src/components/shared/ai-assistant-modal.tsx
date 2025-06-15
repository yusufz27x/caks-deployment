"use client"

import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send, MessageSquare, Loader2 } from "lucide-react"
import { AnimatedDialogContent } from "@/components/shared/animated-dialog-content"
import ReactMarkdown from 'react-markdown'

interface AIAssistantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cityName?: string
}

export function AIAssistantModal({ open, onOpenChange, cityName }: AIAssistantModalProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage("")
    setIsLoading(true)

    // Add user message to conversation
    const newConversation = [...conversation, { role: 'user' as const, content: userMessage }]
    setConversation(newConversation)

    const history = conversation.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          cityName,
          history,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()
      
      let assistantResponse = data.response
      // The AI might wrap the response in markdown code blocks, so we remove them before rendering.
      const codeBlockRegex = /^```(?:[a-zA-Z]+\n)?([\s\S]*?)```$/
      const match = assistantResponse.match(codeBlockRegex)
      if (match) {
        assistantResponse = match[1]
      }
      
      setConversation([...newConversation, { role: 'assistant', content: assistantResponse }])
    } catch (error) {
      console.error('Error sending message:', error)
      setConversation([...newConversation, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent open={open} className="max-w-4xl !max-w-4xl max-h-[80vh] flex flex-col h-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              <Bot className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Travel Assistant
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[60vh]">
          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-purple-900/20 rounded-xl border border-gray-200/30 dark:border-gray-700/30 custom-scrollbar">
            {conversation.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 mx-auto w-fit mb-4">
                  <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Welcome to Your AI Travel Assistant!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ask me anything about {cityName || 'your travel destination'}. I can help with recommendations, itineraries, and local insights.
                </p>
              </div>
            ) : (
              conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-800 dark:text-gray-200'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="mt-4 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me about ${cityName || 'your destination'}...`}
              className="flex-1 h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 focus:border-blue-400 dark:focus:border-blue-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              size="lg"
              className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </AnimatedDialogContent>
    </Dialog>
  )
} 