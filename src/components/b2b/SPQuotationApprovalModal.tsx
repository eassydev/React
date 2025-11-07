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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface SPQuotationApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (approvalNotes: string, sendToClient: boolean) => Promise<void>;
  quotationNumber?: string;
}

export const SPQuotationApprovalModal: React.FC<SPQuotationApprovalModalProps> = ({
  open,
  onClose,
  onConfirm,
  quotationNumber,
}) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [sendToClient, setSendToClient] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(approvalNotes, sendToClient);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setApprovalNotes('');
    setSendToClient(false);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approve SP Quotation</DialogTitle>
          <DialogDescription>
            {quotationNumber 
              ? `Approve quotation ${quotationNumber} created by service provider.`
              : 'Approve this quotation created by service provider.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Approval Notes */}
          <div className="space-y-2">
            <Label htmlFor="approval-notes">
              Approval Notes <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="approval-notes"
              placeholder="Add any notes or comments about this approval..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Send to Client Checkbox */}
          <div className="flex items-start space-x-3 rounded-md border p-4">
            <Checkbox
              id="send-to-client"
              checked={sendToClient}
              onCheckedChange={(checked) => setSendToClient(checked as boolean)}
              disabled={loading}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="send-to-client"
                className="text-sm font-medium cursor-pointer"
              >
                Send to client immediately
              </Label>
              <p className="text-sm text-muted-foreground">
                If checked, the quotation will be sent to the client via email/WhatsApp after approval.
              </p>
            </div>
          </div>
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
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              'Approve Quotation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

