"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, FileText, Bot, User } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

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
      <div className="flex flex-col h-full bg-card border-0">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Contract Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask about rates, policies, and terms</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl border border-primary/10 shadow-sm mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Waiting for Contract</h3>
            <p className="text-sm text-muted-foreground text-center max-w-[250px]">
              Upload a contract first. Then I'll help you analyze rates, policies, and terms through natural conversation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gradient-to-b from-muted/50 to-muted/30">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px bg-border flex-1 max-w-[100px]" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                GLM-4.6v AI • Secure • Private
              </p>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            </div>
            <div className="h-px bg-border flex-1 max-w-[100px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card border-0">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Contract Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask about rates, policies, and terms</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`mt-1 flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm'
            }`}>
              {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 text-primary" />}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none shadow-primary/20'
                  : 'bg-white border border-border rounded-tl-none shadow-sm'
              }`}
            >
              <div className="text-sm leading-relaxed">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="pl-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      code: (props) => {
                        const { className, children } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        return isInline ? (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                        ) : (
                          <code className="block bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto my-2">{children}</code>
                        );
                      },
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-primary/30 pl-3 italic text-muted-foreground">{children}</blockquote>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
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
      <div className="p-5 border-t bg-gradient-to-b from-muted/50 to-muted/30">
        <div className="flex items-center max-w-4xl mx-auto w-full">
          <Input
            placeholder="Ask about rates, policies, payment terms... (e.g. 'What is the high season rate for Deluxe Suite?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
            className="pr-14 h-12 rounded-xl border-border/50 bg-white shadow-sm focus-visible:ring-primary/20 focus-visible:ring-offset-0 text-sm"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-px bg-border flex-1 max-w-[100px]" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              GLM-4.6v AI • Secure • Private
            </p>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          </div>
          <div className="h-px bg-border flex-1 max-w-[100px]" />
        </div>
      </div>
    </div>
  );
}
