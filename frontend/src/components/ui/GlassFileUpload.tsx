"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Upload, FileText, X } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "selected";
}

interface GlassFileUploadProps {
  initialFiles?: Array<{ id: string; name: string; size: number; type: string; status: string }>;
  onFilesChange?: (files: UploadedFile[]) => void;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  className?: string;
}

export function GlassFileUpload({
  initialFiles = [],
  onFilesChange,
  accept = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  className
}: GlassFileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles.map((file) => ({ ...file, status: "selected" })));
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const processFiles = useCallback((newFiles: File[]) => {
    setErrorMessage("");
    if (files.length + newFiles.length > maxFiles) {
      setErrorMessage(`Choose up to ${maxFiles} files.`);
      return;
    }

    const oversized = newFiles.find((file) => file.size > maxSize);
    if (oversized) {
      setErrorMessage(`${oversized.name} exceeds the ${(maxSize / (1024 * 1024)).toFixed(0)} MB file size limit.`);
      return;
    }

    const processedFiles: UploadedFile[] = newFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "selected"
    }));

    const updatedFiles = [...files, ...processedFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, maxFiles, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  }, [processFiles]);

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.01 }}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300",
          isDragging
            ? "border-accentCyan bg-accentCyan/5"
            : "border-glassBorder bg-surface/50 hover:border-accentGold/50 hover:bg-surface"
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            animate={isDragging ? { y: -5 } : { y: 0 }}
            className="w-16 h-16 rounded-full bg-surface border border-glassBorder flex items-center justify-center mb-4"
          >
            <Upload className="w-8 h-8 text-accentGold" />
          </motion.div>
          <p className="text-sm text-textPrimary font-medium mb-2">
            {isDragging ? "Drop files here" : "Upload documents"}
          </p>
          <p className="text-xs text-textSecondary">
            Drag & drop or click to browse
          </p>
          <p className="text-[10px] text-textSecondary mt-2">
            Max {maxFiles} files • {formatFileSize(maxSize)} each
          </p>
        </div>
      </motion.div>
      <p className="text-xs leading-relaxed text-textSecondary">Files are selected in this browser only. This app has no document-upload or document-reading service yet; file contents are not sent or analyzed.</p>
      {errorMessage && <p role="alert" className="text-xs text-red-300">{errorMessage}</p>}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-glassBorder"
            >
              <div className="w-10 h-10 rounded-lg bg-surfaceSecondary border border-glassBorderSecondary flex items-center justify-center">
                <FileText className="w-5 h-5 text-textSecondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-textPrimary truncate">{file.name}</p>
                <p className="text-xs text-textSecondary">{formatFileSize(file.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-textSecondary">Selected locally</span>
                <button
                  onClick={() => removeFile(file.id)}
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  className="p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-4 h-4 text-textSecondary hover:text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
