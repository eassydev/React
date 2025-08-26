'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image as ImageIcon, 
  Video, 
  Download, 
  Eye, 
  Calendar,
  User,
  FileImage,
  Play,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { fetchB2BBookingAttachments, fetchAttachmentDownloadUrl, ServiceAttachment } from '@/lib/api';

// ServiceAttachment interface is now imported from @/lib/api

interface ServiceAttachmentsProps {
  bookingId: string;
  readonly?: boolean;
  onAttachmentUpdate?: () => void;
}

export const ServiceAttachments: React.FC<ServiceAttachmentsProps> = ({
  bookingId,
  readonly = false,
  onAttachmentUpdate
}) => {
  const [attachments, setAttachments] = useState<ServiceAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttachment, setSelectedAttachment] = useState<ServiceAttachment | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [bookingId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const result = await fetchB2BBookingAttachments(bookingId);
      if (result.success) {
        // Ensure we have a valid array
        const attachmentsArray = Array.isArray(result.data?.attachments) ? result.data.attachments : [];
        console.log('ServiceAttachments: Fetched attachments:', attachmentsArray);
        setAttachments(attachmentsArray);
      } else {
        throw new Error(result.message || 'Failed to fetch attachments');
      }
    } catch (error: any) {
      console.error('ServiceAttachments: Failed to fetch attachments:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load service attachments',
        variant: 'destructive',
      });
      setAttachments([]); // Ensure we always set an array
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment: ServiceAttachment) => {
    try {
      const result = await fetchAttachmentDownloadUrl(attachment.id);
      if (result.success) {
        // Open download URL in new tab
        window.open(result.data.downloadUrl, '_blank');
        toast({
          title: 'Download Started',
          description: `Downloading ${attachment.fileName}`,
        });
      } else {
        throw new Error(result.message || 'Failed to get download URL');
      }
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download attachment',
        variant: 'destructive',
      });
    }
  };

  const handlePreview = (attachment: ServiceAttachment) => {
    setSelectedAttachment(attachment);
    setShowPreview(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttachmentIcon = (type: string, mimeType: string) => {
    if (type.includes('video') || mimeType.startsWith('video/')) {
      return <Video className="h-5 w-5" />;
    }
    return <ImageIcon className="h-5 w-5" />;
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

  const groupAttachmentsByType = (attachments: ServiceAttachment[]) => {
    // Ensure attachments is an array
    if (!Array.isArray(attachments)) {
      console.warn('ServiceAttachments: attachments is not an array:', attachments);
      return {};
    }

    return attachments.reduce((groups, attachment) => {
      const type = attachment.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(attachment);
      return groups;
    }, {} as Record<string, ServiceAttachment[]>);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Service Attachments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure attachments is always an array
  const safeAttachments = Array.isArray(attachments) ? attachments : [];
  const groupedAttachments = groupAttachmentsByType(safeAttachments);
  const hasAttachments = safeAttachments.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Service Attachments ({safeAttachments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasAttachments ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No service attachments have been uploaded for this booking yet.
              </AlertDescription>
            </Alert>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All ({safeAttachments.length})</TabsTrigger>
                <TabsTrigger value="before_image">
                  Before Images ({groupedAttachments.before_image?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="after_image">
                  After Images ({groupedAttachments.after_image?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="before_video">
                  Before Videos ({groupedAttachments.before_video?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="after_video">
                  After Videos ({groupedAttachments.after_video?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <AttachmentGrid
                  attachments={safeAttachments}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                  formatFileSize={formatFileSize}
                  formatDate={formatDate}
                  getAttachmentIcon={getAttachmentIcon}
                  getTypeColor={getTypeColor}
                />
              </TabsContent>

              {Object.entries(groupedAttachments).map(([type, typeAttachments]) => (
                <TabsContent key={type} value={type} className="mt-4">
                  <AttachmentGrid 
                    attachments={typeAttachments}
                    onDownload={handleDownload}
                    onPreview={handlePreview}
                    formatFileSize={formatFileSize}
                    formatDate={formatDate}
                    getAttachmentIcon={getAttachmentIcon}
                    getTypeColor={getTypeColor}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && selectedAttachment && (
        <AttachmentPreviewModal
          attachment={selectedAttachment}
          onClose={() => setShowPreview(false)}
          onDownload={handleDownload}
        />
      )}
    </>
  );
};

// Attachment Grid Component
interface AttachmentGridProps {
  attachments: ServiceAttachment[];
  onDownload: (attachment: ServiceAttachment) => void;
  onPreview: (attachment: ServiceAttachment) => void;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
  getAttachmentIcon: (type: string, mimeType: string) => React.ReactNode;
  getTypeColor: (type: string) => string;
}

const AttachmentGrid: React.FC<AttachmentGridProps> = ({
  attachments,
  onDownload,
  onPreview,
  formatFileSize,
  formatDate,
  getAttachmentIcon,
  getTypeColor
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getAttachmentIcon(attachment.type, attachment.mimeType)}
                <Badge className={getTypeColor(attachment.type)}>
                  {attachment.type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              {attachment.isArchived && (
                <Badge variant="secondary">Archived</Badge>
              )}
            </div>

            <h4 className="font-medium text-sm mb-2 truncate" title={attachment.fileName}>
              {attachment.fileName}
            </h4>

            <div className="text-xs text-gray-500 space-y-1 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(attachment.uploadedAt)}
              </div>
              <div>{formatFileSize(attachment.fileSize)}</div>
              {attachment.uploadedBy && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {attachment.uploadedBy.companyName}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPreview(attachment)}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                onClick={() => onDownload(attachment)}
                className="flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Preview Modal Component
interface AttachmentPreviewModalProps {
  attachment: ServiceAttachment;
  onClose: () => void;
  onDownload: (attachment: ServiceAttachment) => void;
}

const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  attachment,
  onClose,
  onDownload
}) => {
  const isVideo = attachment.type.includes('video') || attachment.mimeType.startsWith('video/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{attachment.fileName}</h3>
          <div className="flex gap-2">
            <Button onClick={() => onDownload(attachment)} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>
        <div className="p-4">
          {isVideo ? (
            <video 
              controls 
              className="max-w-full max-h-[60vh]"
              src={attachment.downloadUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img 
              src={attachment.downloadUrl} 
              alt={attachment.fileName}
              className="max-w-full max-h-[60vh] object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};
