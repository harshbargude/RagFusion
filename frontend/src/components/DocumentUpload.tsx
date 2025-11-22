import React, { useState } from 'react';
import apiClient from '../api/client';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { useToast } from '../hooks/useToast';

export const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/v1/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Document uploaded successfully', 'success');
      // TODO: emit event or refresh document list
    } catch (error) {
      console.error('Upload failed', error);
      showToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept=".csv,.xlsx,.txt,.pdf"
        />
        <Button type="submit" isLoading={uploading} disabled={!file}>
          Upload Document
        </Button>
      </form>
    </Card>
  );
};
