import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SPQuotationRejectionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (rejectionReason: string) => Promise<void>;
  quotationNumber?: string;
}

export const SPQuotationRejectionModal: React.FC<SPQuotationRejectionModalProps> = ({
  open,
  onClose,
  onConfirm,
  quotationNumber,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    // Validate rejection reason
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setError('Please provide a detailed rejection reason (at least 10 characters)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onConfirm(rejectionReason.trim());
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRejectionReason('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Reject SP Quotation</DialogTitle>
          <DialogDescription>
            {quotationNumber 
              ? `Reject quotation ${quotationNumber} created by service provider.`
              : 'Reject this quotation created by service provider.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please provide a detailed reason for rejecting this quotation. This will be shared with the service provider."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setError(''); // Clear error on change
              }}
              rows={5}
              disabled={loading}
              className={error ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters required. Be specific about what needs to be changed.
            </p>
          </div>

          {/* Warning Message */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The service provider will be notified about this rejection and can resubmit the quotation after making changes.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant="destructive"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              'Reject Quotation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

