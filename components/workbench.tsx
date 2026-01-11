"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useContractStore } from "@/lib/store/contract-store";
import { Loader2, FileText, MessageSquare, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically import PDFViewer to avoid server-side rendering issues
const PDFViewer = dynamic(() => import('./pdf-viewer-simple').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[600px] bg-muted/30">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading viewer...</span>
      </div>
    </div>
  )
});

const ContractForm = dynamic(() => import('./contract-form').then(mod => mod.ContractForm), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[600px] bg-muted/30">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading form...</span>
      </div>
    </div>
  )
});

const ChatInterface = dynamic(() => import('./chat-interface').then(mod => mod.ChatInterface), {
  ssr: false,
});

export function Workbench() {
  const { pdfFile, contract, isLoading } = useContractStore();
  const [showPreview, setShowPreview] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // Close chat on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowChat(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/10 rounded-xl border-2 border-dashed border-muted">
        <div className="text-center">
          <div className="relative mb-6">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <FileText className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xl font-bold tracking-tight">Intelligence at Work</p>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Our AI is currently dissecting your contract to extract structured rates, policies, and terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[750px] relative">
      {/* Sidebar: PDF Viewer */}
      {showPreview && (
        <div className="w-full lg:w-[35%] xl:w-[30%] h-full flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Preview
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="h-7 text-xs">
              Hide
            </Button>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border bg-card shadow-sm">
            <PDFViewer file={pdfFile} />
          </div>
        </div>
      )}

      {/* Main Content: Form Only */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!showPreview ? 'max-w-4xl mx-auto w-full' : ''}`}>
        {!showPreview && (
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="h-7 text-xs gap-2">
              <FileText className="h-3 w-3" />
              Show Document
            </Button>
          </div>
        )}
        
        <div className="flex-1 bg-card rounded-xl border shadow-sm overflow-hidden p-6">
          <ContractForm />
        </div>
      </div>

      {/* Floating Chat Toggle Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-all duration-300 group"
      >
        <Sparkles className="h-6 w-6" />
        <span className="absolute right-full mr-3 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask AI
        </span>
      </button>

      {/* Slide-out Chat Panel */}
      {showChat && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowChat(false)}
          />
          
          {/* Chat Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  <div>
                    <h2 className="font-bold text-lg">Contract Intelligence</h2>
                    <p className="text-xs text-white/80">Ask anything about your contract</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChat(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <ChatInterface contractData={contract} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
