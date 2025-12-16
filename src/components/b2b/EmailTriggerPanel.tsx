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
import { Mail, Send, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { sendTodayScheduleEmails, sendTomorrowScheduleEmails, sendAdminDailySummary } from '@/lib/api';
import { toast } from 'sonner';

interface EmailTriggerPanelProps {
  userRole: string;
}

export default function EmailTriggerPanel({ userRole }: EmailTriggerPanelProps) {
  const [showTodayDialog, setShowTodayDialog] = useState(false);
  const [showTomorrowDialog, setShowTomorrowDialog] = useState(false);
  const [showAdminSummaryDialog, setShowAdminSummaryDialog] = useState(false);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingTomorrow, setLoadingTomorrow] = useState(false);
  const [loadingAdminSummary, setLoadingAdminSummary] = useState(false);

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

  const handleSendAdminSummary = async () => {
    setLoadingAdminSummary(true);
    try {
      const result = await sendAdminDailySummary();

      toast.success('Admin Daily Summary Sent!', {
        description: `Successfully sent to ${result.data?.recipientCount || 0} admin(s)`,
        icon: <CheckCircle className="h-4 w-4" />,
      });

      setShowAdminSummaryDialog(false);
    } catch (error: any) {
      toast.error('Failed to Send Summary', {
        description: error.message || 'An error occurred while sending admin summary',
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoadingAdminSummary(false);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Admin Daily Summary Button */}
            <Button
              onClick={() => setShowAdminSummaryDialog(true)}
              disabled={loadingAdminSummary}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loadingAdminSummary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Send Admin Summary
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Emails are automatically sent daily at 7:00 AM (today's schedule),
              6:00 PM (tomorrow's schedule), and 8:00 AM (admin summary). Use these buttons only for testing or manual triggers.
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

      {/* Admin Daily Summary Confirmation Dialog */}
      <AlertDialog open={showAdminSummaryDialog} onOpenChange={setShowAdminSummaryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Admin Daily Summary Email?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a comprehensive daily operations summary email to all super admins and managers.
              The summary includes completed orders, rescheduled orders, today's schedule, tomorrow's schedule,
              and pending orders. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingAdminSummary}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendAdminSummary}
              disabled={loadingAdminSummary}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loadingAdminSummary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Summary'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

