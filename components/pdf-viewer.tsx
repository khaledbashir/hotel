"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PDFViewerProps {
  file: File | null;
}

export function PDFViewer({ file }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleDownload = () => {
    if (pdfUrl && file) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = file.name;
      a.click();
      toast.success('PDF downloaded');
    }
  };

  if (!file || !pdfUrl) {
    return (
      <Card className="flex items-center justify-center h-full min-h-[600px] bg-muted/30">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No document loaded</p>
          <p className="text-sm mt-2">Upload a contract to preview</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 2.5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(pdfUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Tab
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/10 p-4 flex justify-center">
        <div 
          className="transition-transform duration-200 ease-in-out"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="shadow-lg border-0 bg-white"
            style={{ width: '800px', height: '1000px' }}
            title="PDF Viewer"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    </Card>
  );
}
