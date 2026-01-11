"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useContractStore } from "@/lib/store/contract-store";
import { toast } from "sonner";
import { extractContractData } from "@/app/actions/extract-contract";

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const { setPdfFile, setLoading } = useContractStore();

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv"
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a PDF, Word, or Excel file.");
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File too large. Maximum size is 10MB.");
        return;
      }

      setPdfFile(file);
      setLoading(true);

      try {
        // Create FormData and send to server action
        const formData = new FormData();
        formData.append('file', file);

        // Use real AI extraction
        console.log('[UploadZone] Starting extraction for:', file.name);
        const result = await extractContractData(formData);

        if (result.error) {
          console.error('[UploadZone] Extraction failed:', result.error);
          toast.error(`Extraction failed: ${result.error}`);
          return;
        }

        if (result.data) {
          console.log('[UploadZone] Extraction successful');
          // Update store with extracted data
          useContractStore.getState().setContract(result.data);
          toast.success("Contract extracted successfully!");
        }
      } catch (error) {
        console.error('[UploadZone] Fatal error during extraction:', error);
        toast.error(
          `A fatal error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setLoading(false);
      }
    },
    [setPdfFile, setLoading]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <Card
      className={`relative border-2 border-dashed transition-all duration-200 ${isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center py-16 px-6 cursor-pointer"
      >
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <Upload className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Upload Hotel Contract</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Drag and drop your PDF, Word, or Excel file here, or click to browse
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Supports PDF, DOCX, XLSX up to 10MB</span>
        </div>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.docx,.xlsx,.xls,.csv"
          onChange={handleChange}
          className="hidden"
        />
      </label>
    </Card>
  );
}
