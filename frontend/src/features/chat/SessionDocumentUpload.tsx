import React, { useState, useRef } from "react";
import { Upload, X, File, Loader2 } from "lucide-react";
import { uploadDocumentToSession } from "./chatApi";
import { useToast } from "../../hooks/useToast";

interface SessionDocumentUploadProps {
  sessionId: string;
  onUploadSuccess?: () => void;
}

export const SessionDocumentUpload: React.FC<SessionDocumentUploadProps> = ({
  sessionId,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await uploadDocumentToSession(sessionId, file);
      showToast("Document uploaded successfully", "success");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess?.();
    } catch (error) {
      console.error("Upload failed", error);
      showToast("Failed to upload document", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4">
      <div className="flex items-center gap-3">
        {!file ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".csv,.xlsx,.txt,.pdf"
              className="hidden"
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Upload Document</span>
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              CSV, XLSX, TXT, PDF
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1 bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
              <File className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                {file.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload</span>
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
