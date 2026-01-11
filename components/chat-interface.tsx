"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, FileText, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  contractData: any;
  fullText: string | null;
}

export function ChatInterface({ contractData, fullText }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I've analyzed this contract and have full access to the document text. You can ask me anything about the specific rates, legal clauses, or any other details." }
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
          fullText, // Pass the full document context
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

  if (!contractData && !fullText) {
    return (
      <div className="flex flex-col h-full bg-slate-50 border-0">
        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bot className="h-24 w-24 text-slate-900" />
            </div>
            <div className="bg-slate-900 p-5 rounded-2xl shadow-lg mb-6 relative z-10 w-fit mx-auto">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-center mb-3 text-slate-900">Awaiting Intelligence</h3>
            <p className="text-sm text-slate-500 text-center max-w-[280px] leading-relaxed font-medium">
              Once you upload a contract, I'll be ready to provide deep analysis using both extracted data and full document context.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px bg-slate-100 flex-1 max-w-[80px]" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                PRO INTEL MODE
              </p>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <div className="h-px bg-slate-100 flex-1 max-w-[80px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-0">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-8 scroll-smooth">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110 ${msg.role === 'user'
              ? 'bg-slate-900 text-white shadow-xl'
              : 'bg-white border border-slate-200 shadow-md ring-1 ring-slate-100'
              }`}>
              {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 text-blue-600" />}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${msg.role === 'user'
                ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-200'
                : 'bg-white border border-slate-200 rounded-tl-none shadow-md text-slate-800'
                }`}
            >
              <div className="text-sm leading-relaxed font-medium">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside my-3 space-y-2 marker:text-blue-500">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside my-3 space-y-2 marker:text-blue-500 font-bold">{children}</ol>,
                      li: ({ children }) => <li className="pl-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-bold text-slate-900 border-b-2 border-blue-500/20">{children}</strong>,
                      code: (props) => {
                        const { className, children } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        return isInline ? (
                          <code className="bg-slate-100 text-blue-600 px-2 py-0.5 rounded font-mono text-[13px] font-bold">{children}</code>
                        ) : (
                          <code className="block bg-slate-900 text-blue-400 p-4 rounded-xl text-xs font-mono overflow-x-auto my-3 border border-slate-800 shadow-inner">{children}</code>
                        );
                      },
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 p-4 rounded-r-xl italic text-slate-600 my-4 shadow-sm font-medium">{children}</blockquote>
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
          <div className="flex items-start gap-4 animate-pulse">
            <div className="mt-1 w-10 h-10 rounded-xl bg-slate-100 border-slate-200 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-6 py-4 flex items-center gap-3 shadow-md">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
              </div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Synthesizing intelligence...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t bg-white relative">
        <div className="flex items-center max-w-4xl mx-auto w-full relative group">
          <Input
            placeholder="Search intelligence: e.g. 'Summarize the cancellation terms'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
            className="pr-16 h-14 rounded-2xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 text-sm font-medium transition-all focus:bg-white focus:border-blue-500 shadow-inner hover:bg-slate-100/50"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl shadow-lg bg-slate-900 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px bg-slate-100 flex-1 max-w-[80px]" />
          <div className="flex items-center gap-2">
            <p className="text-[9px] text-slate-400 uppercase tracking-[0.3em] font-black">
              Deep Context Enabled
            </p>
          </div>
          <div className="h-px bg-slate-100 flex-1 max-w-[80px]" />
        </div>
      </div>
    </div>
  );
}
