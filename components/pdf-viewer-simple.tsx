"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, FileText, AlertCircle } from "lucide-react";

interface PDFViewerProps {
  file: File | null;
}

export function PDFViewer({ file }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setError(null);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfUrl(null);
    }
  }, [file]);

  const handleLoadError = () => {
    setError("Failed to load PDF. The file may be corrupted.");
  };

  if (!isClient) {
    return (
      <Card className="flex items-center justify-center h-full min-h-[600px] bg-muted/30">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Loading...</p>
        </div>
      </Card>
    );
  }

  if (!file || !pdfUrl) {
    return (
      <Card className="flex items-center justify-center h-full min-h-[600px] bg-muted/30">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No document loaded</p>
          <p className="text-sm mt-2">Upload a contract to preview</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex items-center justify-center h-full min-h-[600px] bg-destructive/10">
        <div className="text-center text-destructive">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">PDF Viewer Error</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
        <div className="text-sm font-medium text-muted-foreground">
          Contract Preview
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.5))}
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
            onClick={() => setScale((prev) => Math.min(prev + 0.2, 2.0))}
            disabled={scale >= 2.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas - Native browser PDF viewer */}
      <div className="flex-1 overflow-auto bg-muted/10 flex items-center justify-center p-4">
        <iframe
          src={pdfUrl}
          className="border shadow-lg"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
          title="PDF Viewer"
          onError={handleLoadError}
        />
      </div>
    </Card>
  );
}
