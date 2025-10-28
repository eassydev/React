'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { sendTodayScheduleEmails, sendTomorrowScheduleEmails } from '@/lib/api';
import { toast } from 'sonner';

interface EmailTriggerPanelProps {
  userRole: string;
}

export default function EmailTriggerPanel({ userRole }: EmailTriggerPanelProps) {
  const [showTodayDialog, setShowTodayDialog] = useState(false);
  const [showTomorrowDialog, setShowTomorrowDialog] = useState(false);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingTomorrow, setLoadingTomorrow] = useState(false);

  // Only show for super_admin and manager
  if (userRole !== 'super_admin' && userRole !== 'manager') {
    return null;
  }

  const handleSendTodayEmails = async () => {
    setLoadingToday(true);
    try {
      const result = await sendTodayScheduleEmails();
      
      toast.success('Today\'s Schedule Emails Sent!', {
        description: `Successfully sent ${result.data?.emailsSent || 0} emails`,
        icon: <CheckCircle className="h-4 w-4" />,
      });
      
      setShowTodayDialog(false);
    } catch (error: any) {
      toast.error('Failed to Send Emails', {
        description: error.message || 'An error occurred while sending emails',
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoadingToday(false);
    }
  };

  const handleSendTomorrowEmails = async () => {
    setLoadingTomorrow(true);
    try {
      const result = await sendTomorrowScheduleEmails();
      
      toast.success('Tomorrow\'s Schedule Emails Sent!', {
        description: `Successfully sent ${result.data?.emailsSent || 0} emails`,
        icon: <CheckCircle className="h-4 w-4" />,
      });
      
      setShowTomorrowDialog(false);
    } catch (error: any) {
      toast.error('Failed to Send Emails', {
        description: error.message || 'An error occurred while sending emails',
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoadingTomorrow(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-[#FFA301]" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>
            Manually trigger daily schedule email notifications to SPOCs and Service Providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Today's Schedule Button */}
            <Button
              onClick={() => setShowTodayDialog(true)}
              disabled={loadingToday}
              className="bg-[#FFA301] hover:bg-[#e69301] text-white"
            >
              {loadingToday ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Today's Schedule
                </>
              )}
            </Button>

            {/* Tomorrow's Schedule Button */}
            <Button
              onClick={() => setShowTomorrowDialog(true)}
              disabled={loadingTomorrow}
              className="bg-[#FFA301] hover:bg-[#e69301] text-white"
            >
              {loadingTomorrow ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Tomorrow's Schedule
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Emails are automatically sent daily at 7:00 AM (today's schedule) 
              and 6:00 PM (tomorrow's schedule). Use these buttons only for testing or manual triggers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule Confirmation Dialog */}
      <AlertDialog open={showTodayDialog} onOpenChange={setShowTodayDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Today's Schedule Emails?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send email notifications to all SPOCs and Service Providers 
              with orders scheduled for today. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingToday}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendTodayEmails}
              disabled={loadingToday}
              className="bg-[#FFA301] hover:bg-[#e69301]"
            >
              {loadingToday ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Emails'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tomorrow's Schedule Confirmation Dialog */}
      <AlertDialog open={showTomorrowDialog} onOpenChange={setShowTomorrowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Tomorrow's Schedule Emails?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send email notifications to all SPOCs and Service Providers 
              with orders scheduled for tomorrow. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingTomorrow}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendTomorrowEmails}
              disabled={loadingTomorrow}
              className="bg-[#FFA301] hover:bg-[#e69301]"
            >
              {loadingTomorrow ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Emails'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

