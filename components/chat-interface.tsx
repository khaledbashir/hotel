"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, FileText } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  contractData: any;
}

export function ChatInterface({ contractData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I've analyzed this contract. You can ask me about rates, cancellation policies, payment terms, or any other details." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          contractData,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get answer. Please check your connection.');
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error while processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!contractData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-8 bg-muted/5">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <MessageSquare className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Wait for Extraction</h3>
        <p className="text-muted-foreground max-w-sm">
          Once the contract is processed, you can chat with it to clarify terms and find specific data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border'
            }`}>
              {msg.role === 'user' ? 'YOU' : 'AI'}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-muted/50 border rounded-tl-none text-foreground'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="mt-1 w-8 h-8 rounded-full bg-muted border flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <div className="bg-muted/50 border rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
              </div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Analyzing Context</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-muted/5">
        <div className="relative flex items-center max-w-4xl mx-auto w-full">
          <Input
            placeholder="Type your question about the contract... (e.g. 'What are the peak season dates?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
            className="pr-12 h-12 rounded-xl border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2 uppercase tracking-widest font-medium">
          Powered by GLM-4.6v Intelligence
        </p>
      </div>
    </div>
  );
}
