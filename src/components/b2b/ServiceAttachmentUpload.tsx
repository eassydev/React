'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  AlertCircle,
  CheckCircle,
  FileImage,
  Camera,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UploadFile {
  id: string;
  file: File;
  type: 'before_image' | 'after_image' | 'before_video' | 'after_video';
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface ServiceAttachmentUploadProps {
  bookingId: string;
  providerId: string;
  onUploadComplete?: () => void;
  maxFiles?: number;
}

const FILE_CONSTRAINTS = {
  maxSize: {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
  },
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/mov', 'video/avi'],
  maxFiles: 5
};

export const ServiceAttachmentUpload: React.FC<ServiceAttachmentUploadProps> = ({
  bookingId,
  providerId,
  onUploadComplete,
  maxFiles = FILE_CONSTRAINTS.maxFiles
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File, type: string): string | null => {
    const isImage = type.includes('image');
    const isVideo = type.includes('video');
    
    // Check file type
    if (isImage && !FILE_CONSTRAINTS.allowedImageTypes.includes(file.type)) {
      return `Invalid image format. Allowed: ${FILE_CONSTRAINTS.allowedImageTypes.join(', ')}`;
    }
    
    if (isVideo && !FILE_CONSTRAINTS.allowedVideoTypes.includes(file.type)) {
      return `Invalid video format. Allowed: ${FILE_CONSTRAINTS.allowedVideoTypes.join(', ')}`;
    }
    
    // Check file size
    const maxSize = isImage ? FILE_CONSTRAINTS.maxSize.image : FILE_CONSTRAINTS.maxSize.video;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const addFiles = async (files: FileList, type: string) => {
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < files.length && newFiles.length < maxFiles; i++) {
      const file = files[i];
      const validation = validateFile(file, type);
      
      if (validation) {
        toast({
          title: 'Invalid File',
          description: `${file.name}: ${validation}`,
          variant: 'destructive',
        });
        continue;
      }
      
      const preview = await createPreview(file);
      
      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        type: type as any,
        preview,
        progress: 0,
        status: 'pending'
      });
    }
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    const formData = new FormData();
    formData.append('file', uploadFile.file);
    formData.append('bookingId', bookingId);
    formData.append('attachmentType', uploadFile.type);

    try {
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      const xhr = new XMLHttpRequest();
      
      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress }
                : f
            ));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              setUploadFiles(prev => prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, status: 'completed', progress: 100 }
                  : f
              ));
              resolve();
            } else {
              throw new Error(response.message || 'Upload failed');
            }
          } else {
            throw new Error(`Upload failed with status ${xhr.status}`);
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('POST', `/provider-api/v1.0.0/b2b-bookings/${bookingId}/attachments`);
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('providerToken')}`);
        xhr.send(formData);
      });

    } catch (error: any) {
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: error.message }
          : f
      ));
      throw error;
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      toast({
        title: 'No Files',
        description: 'No files to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      await Promise.all(pendingFiles.map(uploadFile));
      
      toast({
        title: 'Upload Complete',
        description: `Successfully uploaded ${pendingFiles.length} file(s)`,
      });
      
      if (onUploadComplete) {
        onUploadComplete();
      }
      
      // Clear completed files after a delay
      setTimeout(() => {
        setUploadFiles(prev => prev.filter(f => f.status !== 'completed'));
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Some files failed to upload',
        variant: 'destructive',
      });
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files, type);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files) {
      addFiles(e.target.files, type);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>;
      default:
        return <FileImage className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'before_image':
        return 'bg-blue-100 text-blue-800';
      case 'after_image':
        return 'bg-green-100 text-green-800';
      case 'before_video':
        return 'bg-purple-100 text-purple-800';
      case 'after_video':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload Service Attachments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { type: 'before_image', label: 'Before Images', icon: ImageIcon },
            { type: 'after_image', label: 'After Images', icon: ImageIcon },
            { type: 'before_video', label: 'Before Videos', icon: Video },
            { type: 'after_video', label: 'After Videos', icon: Video }
          ].map(({ type, label, icon: Icon }) => (
            <div
              key={type}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, type)}
            >
              <Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <h3 className="font-medium mb-2">{label}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag & drop files here or click to browse
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = type.includes('image') 
                    ? FILE_CONSTRAINTS.allowedImageTypes.join(',')
                    : FILE_CONSTRAINTS.allowedVideoTypes.join(',');
                  input.onchange = (e) => handleFileSelect(e as any, type);
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            </div>
          ))}
        </div>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Files to Upload ({uploadFiles.length})</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadFiles([])}
                  disabled={uploadFiles.some(f => f.status === 'uploading')}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={uploadAllFiles}
                  disabled={uploadFiles.length === 0 || uploadFiles.some(f => f.status === 'uploading')}
                >
                  Upload All
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {uploadFile.preview && (
                    <img 
                      src={uploadFile.preview} 
                      alt="Preview" 
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{uploadFile.file.name}</span>
                      <Badge className={getTypeColor(uploadFile.type)}>
                        {uploadFile.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      {formatFileSize(uploadFile.file.size)}
                    </div>
                    
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="h-2" />
                    )}
                    
                    {uploadFile.status === 'error' && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {uploadFile.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(uploadFile.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.status === 'uploading'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Constraints Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>File Requirements:</strong><br />
            • Images: Max 10MB, formats: JPEG, PNG, WebP<br />
            • Videos: Max 100MB, formats: MP4, MOV, AVI<br />
            • Maximum {maxFiles} files per type per booking
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
