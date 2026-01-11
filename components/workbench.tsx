"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useContractStore } from "@/lib/store/contract-store";
import { Loader2, FileText, MessageSquare, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState('form');
  const [showPreview, setShowPreview] = useState(true);

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
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[750px]">
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

      {/* Main Content: Form & Chat */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!showPreview ? 'max-w-4xl mx-auto w-full' : ''}`}>
        {!showPreview && (
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="h-7 text-xs gap-2">
              <FileText className="h-3 w-3" />
              Show Document
            </Button>
          </div>
        )}
        
        <div className="flex-1 flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-4 border-b bg-muted/5">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="form" className="flex items-center gap-2 py-2">
                  <LayoutGrid className="h-4 w-4" />
                  Structured Data
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2 py-2">
                  <MessageSquare className="h-4 w-4" />
                  Contract Intelligence
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="form" className="flex-1 m-0 p-4 overflow-auto focus-visible:outline-none">
              <ContractForm />
            </TabsContent>

            <TabsContent value="chat" className="flex-1 m-0 p-0 overflow-hidden focus-visible:outline-none">
              <ChatInterface contractData={contract} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
