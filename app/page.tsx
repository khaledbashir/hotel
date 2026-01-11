"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload-zone";
import { Workbench } from "@/components/workbench";
import { Button } from "@/components/ui/button";
import { useContractStore } from "@/lib/store/contract-store";
import { mockContractData } from "@/lib/schemas/contract-schema";
import { FileText, Sparkles } from "lucide-react";

export default function Home() {
  const { pdfFile, contract, setContract, reset } = useContractStore();
  const [showWorkbench, setShowWorkbench] = useState(false);

  const handleLoadMockData = () => {
    setContract(mockContractData);
    setShowWorkbench(true);
  };

  const handleReset = () => {
    reset();
    setShowWorkbench(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Hotel Contract Intelligence</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Document Extraction</p>
              </div>
            </div>
            {(pdfFile || contract) && (
              <Button onClick={handleReset} variant="outline" size="sm">
                New Contract
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!showWorkbench && !contract ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Extract Contract Intelligence</h2>
              <p className="text-muted-foreground">
                Upload hotel contracts and let AI extract pricing, terms, and room rates automatically
              </p>
            </div>
            
            <UploadZone />
          </div>
        ) : (
          <Workbench />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 bg-white/50 backdrop-blur-sm dark:bg-slate-950/50">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Built with Next.js 14, z.ai GLM-4.6v, and Shadcn/UI</p>
        </div>
      </footer>
    </div>
  );
}
