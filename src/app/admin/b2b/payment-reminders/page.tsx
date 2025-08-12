'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Send,
  Calendar,
  DollarSign,
  Building2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OverdueInvoice {
  id: string;
  invoice_number: string;
  booking: {
    order_number: string;
    service_name: string;
    customer: {
      company_name: string;
      contact_person: string;
      email: string;
    };
  };
  total_amount: number;
  due_date: string;
  payment_status: string;
  days_overdue: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  last_reminder_sent: string | null;
}

interface ReminderHistory {
  invoice_id: string;
  invoice_number: string;
  company_name: string;
  total_amount: number;
  due_date: string;
  payment_status: string;
  reminders: Array<{
    type: string;
    sent_at: string;
    sent_by: string;
  }>;
}

export default function PaymentRemindersPage() {
  const [overdueInvoices, setOverdueInvoices] = useState<OverdueInvoice[]>([]);
  const [reminderHistory, setReminderHistory] = useState<ReminderHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [summary, setSummary] = useState({
    total_overdue: 0,
    total_amount_overdue: 0,
    by_urgency: { critical: 0, high: 0, medium: 0, low: 0 }
  });

  useEffect(() => {
    fetchOverdueInvoices();
    fetchReminderHistory();
  }, []);

  const fetchOverdueInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/b2b/invoices/overdue', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOverdueInvoices(data.data.overdue_invoices);
        setSummary(data.data.summary);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch overdue invoices'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReminderHistory = async () => {
    try {
      const response = await fetch('/api/admin/b2b/invoices/reminder-history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReminderHistory(data.data.reminder_history);
      }
    } catch (error) {
      console.error('Failed to fetch reminder history:', error);
    }
  };

  const sendManualReminder = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/b2b/invoices/${invoiceId}/send-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          reminder_type: 'manual_reminder'
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payment reminder sent successfully'
        });
        fetchOverdueInvoices();
        fetchReminderHistory();
      } else {
        throw new Error('Failed to send reminder');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send payment reminder'
      });
    }
  };

  const sendBulkReminders = async () => {
    if (selectedInvoices.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select invoices to send reminders'
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/b2b/invoices/bulk-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          invoice_ids: selectedInvoices,
          reminder_type: 'bulk_manual_reminder'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `Bulk reminders sent: ${data.data.successful_sends} successful, ${data.data.failed_sends} failed`
        });
        setSelectedInvoices([]);
        fetchOverdueInvoices();
        fetchReminderHistory();
      } else {
        throw new Error('Failed to send bulk reminders');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send bulk reminders'
      });
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Reminders</h1>
          <p className="text-muted-foreground">
            Manage B2B invoice payment reminders and track overdue payments
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_overdue}</div>
            <p className="text-xs text-muted-foreground">invoices</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Overdue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total_amount_overdue)}</div>
            <p className="text-xs text-muted-foreground">total outstanding</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.by_urgency.critical}</div>
            <p className="text-xs text-muted-foreground">30+ days overdue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.by_urgency.high}</div>
            <p className="text-xs text-muted-foreground">15-29 days overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overdue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overdue">Overdue Invoices</TabsTrigger>
          <TabsTrigger value="history">Reminder History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Overdue Invoices</CardTitle>
                <div className="flex gap-2">
                  {selectedInvoices.length > 0 && (
                    <Button onClick={sendBulkReminders} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Bulk Reminders ({selectedInvoices.length})
                    </Button>
                  )}
                  <Button onClick={fetchOverdueInvoices} variant="outline">
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueInvoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices([...selectedInvoices, invoice.id]);
                            } else {
                              setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                            }
                          }}
                          className="rounded"
                        />
                        <div>
                          <h3 className="font-semibold">{invoice.invoice_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            Order: {invoice.booking.order_number}
                          </p>
                        </div>
                      </div>
                      <Badge className={getUrgencyColor(invoice.urgency_level)}>
                        {invoice.urgency_level.toUpperCase()} - {invoice.days_overdue} days
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invoice.booking.customer.company_name}</p>
                          <p className="text-muted-foreground">{invoice.booking.customer.contact_person}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                          <p className="text-muted-foreground">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">
                            {invoice.last_reminder_sent ? 
                              `Last: ${new Date(invoice.last_reminder_sent).toLocaleDateString()}` : 
                              'No reminders sent'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => sendManualReminder(invoice.id)}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                ))}
                
                {overdueInvoices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No overdue invoices found!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reminder History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminderHistory.map((history) => (
                  <div key={history.invoice_id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{history.invoice_number}</h3>
                        <p className="text-sm text-muted-foreground">{history.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(history.total_amount)} • Due: {new Date(history.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={history.payment_status === 'paid' ? 'default' : 'destructive'}>
                        {history.payment_status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Reminders Sent:</h4>
                      {history.reminders.map((reminder, index) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span className="capitalize">{reminder.type.replace(/_/g, ' ')}</span>
                          <span className="text-muted-foreground">
                            {new Date(reminder.sent_at).toLocaleString()} • {reminder.sent_by}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {reminderHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4" />
                    <p>No reminder history found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
