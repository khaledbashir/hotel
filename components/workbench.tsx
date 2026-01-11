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
  const { pdfFile, contract, fullText, isLoading } = useContractStore();
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
      <div className="flex items-center justify-center h-[600px] bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent animate-pulse" />
        <div className="text-center relative z-10 px-6">
          <div className="relative mb-8 flex justify-center">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative">
              <Loader2 className="h-20 w-20 animate-spin text-blue-600 dark:text-blue-400 stroke-[1.5]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-blue-500 animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Intelligence at Work
          </h2>
          <div className="flex flex-col items-center gap-4">
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-lg leading-relaxed">
              Dissecting contract DNA... extracting rates, clauses, and intelligence.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                GLM-4.6v VISION ACTIVE
              </span>
            </div>
          </div>
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
            <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Preview
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="h-7 text-xs hover:bg-slate-100">
              Hide
            </Button>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border bg-white shadow-sm ring-1 ring-slate-200">
            <PDFViewer file={pdfFile} />
          </div>
        </div>
      )}

      {/* Main Content: Form Only */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!showPreview ? 'max-w-5xl mx-auto w-full' : ''}`}>
        {!showPreview && (
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="h-7 text-xs gap-2 border-slate-200 hover:bg-slate-50">
              <FileText className="h-3 w-3 text-blue-600" />
              Show Document
            </Button>
          </div>
        )}

        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 ring-1 ring-slate-100">
          <ContractForm />
        </div>
      </div>

      {/* Floating Chat Toggle Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-8 right-8 z-50 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-full p-5 shadow-2xl hover:scale-105 transition-all duration-300 group flex items-center justify-center ring-4 ring-white dark:ring-slate-950"
      >
        <Sparkles className="h-7 w-7" />
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold tracking-widest uppercase">
          Analyze Intelligence
        </span>
      </button>

      {/* Slide-out Chat Panel */}
      {showChat && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in"
            onClick={() => setShowChat(false)}
          />

          {/* Chat Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-950 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-50 transform transition-all duration-500 ease-in-out border-l border-slate-200 dark:border-slate-800">
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b bg-slate-900 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg tracking-tight">Contract Intelligence</h2>
                    <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Deep Document Analysis</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChat(false)}
                  className="text-white hover:bg-white/10 h-8 w-8"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <ChatInterface contractData={contract} fullText={fullText} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
