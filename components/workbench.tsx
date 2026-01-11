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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Processing contract...</p>
          <p className="text-sm text-muted-foreground mt-2">
            AI is extracting structured data from your document
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[700px]">
      {/* Left Column: PDF Viewer */}
      <div className="h-full">
        <PDFViewer file={pdfFile} />
      </div>

      {/* Right Column: Tabs for Form & Chat */}
      <div className="h-full flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Form
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="flex-1 mt-4 overflow-auto">
            <ContractForm />
          </TabsContent>

          <TabsContent value="chat" className="flex-1 mt-4 overflow-auto">
            <ChatInterface contractData={contract} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
