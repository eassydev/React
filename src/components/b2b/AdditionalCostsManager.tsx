'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface AdditionalCost {
  id: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  added_at: string;
  approved_at?: string;
  addedBy?: {
    id: string;
    full_name?: string;
    username?: string;
    email: string;
  };
}

interface AdditionalCostsManagerProps {
  entityId: string; // order or quotation ID (encrypted)
  entityType: 'order' | 'quotation';
  readonly?: boolean;
  onTotalChange?: (total: number) => void;
}

export const AdditionalCostsManager: React.FC<AdditionalCostsManagerProps> = ({
  entityId,
  entityType,
  readonly = false,
  onTotalChange
}) => {
  const [costs, setCosts] = useState<AdditionalCost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    notes: ''
  });

  // Fetch additional costs
  const fetchCosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get token from localStorage (check both token and adminToken)
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const endpoint = entityType === 'order'
        ? `/admin-api/b2b/orders/${entityId}/additional-costs`
        : `/admin-api/b2b/quotations/${entityId}/additional-costs`;

      const response = await fetch(endpoint, {
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch additional costs');
      }

      const data = await response.json();
      setCosts(data.data || []);
      
      // Calculate and notify parent of total
      if (onTotalChange) {
        const total = calculateApprovedTotal(data.data || []);
        onTotalChange(total);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, [entityId, entityType]);

  // Calculate total of approved costs
  const calculateApprovedTotal = (costsList: AdditionalCost[]) => {
    return costsList
      .filter(cost => cost.status === 'approved')
      .reduce((sum, cost) => sum + parseFloat(cost.total_amount.toString()), 0);
  };

  // Calculate total amount for form
  const calculateTotal = () => {
    return formData.quantity * formData.unit_price;
  };

  // Handle add/edit
  const handleSave = async () => {
    setError(null);
    try {
      // Get token from localStorage (check both token and adminToken)
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const totalAmount = calculateTotal();
      
      const payload = {
        ...formData,
        total_amount: totalAmount
      };

      let endpoint, method;
      if (editingId) {
        // Update existing
        endpoint = `/admin-api/b2b/additional-costs/${editingId}`;
        method = 'PUT';
      } else {
        // Create new
        endpoint = entityType === 'order'
          ? `/admin-api/b2b/orders/${entityId}/additional-costs`
          : `/admin-api/b2b/quotations/${entityId}/additional-costs`;
        method = 'POST';
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save additional cost');
      }

      // Reset form and refresh
      setFormData({
        item_name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        notes: ''
      });
      setEditingId(null);
      setShowAddForm(false);
      await fetchCosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this additional cost?')) {
      return;
    }

    setError(null);
    try {
      // Get token from localStorage (check both token and adminToken)
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const response = await fetch(`/admin-api/b2b/additional-costs/${id}`, {
        method: 'DELETE',
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete additional cost');
      }

      await fetchCosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle edit
  const handleEdit = (cost: AdditionalCost) => {
    setFormData({
      item_name: cost.item_name,
      description: cost.description || '',
      quantity: cost.quantity,
      unit_price: cost.unit_price,
      notes: cost.notes || ''
    });
    setEditingId(cost.id);
    setShowAddForm(true);
  };

  // Cancel edit/add
  const handleCancel = () => {
    setFormData({
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      notes: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  // Handle status change (approve/reject)
  const handleStatusChange = async (costId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setError(null);

      // Get token from localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

      const endpoint = `/admin-api/b2b/additional-costs/${costId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'admin-auth-token': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newStatus === 'approved' ? 'approve' : 'reject'} additional cost`);
      }

      // Refresh the list
      await fetchCosts();

      // Show success message (optional)
      console.log(`✅ Additional cost ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (err: any) {
      setError(err.message);
      console.error('Error changing status:', err);
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const approvedTotal = calculateApprovedTotal(costs);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Additional Costs
          </CardTitle>
          {!readonly && (
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              variant={showAddForm ? "outline" : "default"}
            >
              {showAddForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              {showAddForm ? 'Cancel' : 'Add Cost'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Add/Edit Form */}
        {showAddForm && !readonly && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4">
              {editingId ? 'Edit Additional Cost' : 'Add Additional Cost'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Item Name *</Label>
                <Input
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  placeholder="e.g., Copper Wire Replacement"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about this cost"
                  rows={2}
                />
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label>Unit Price (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes (optional)"
                  rows={2}
                />
              </div>
              <div className="col-span-2 bg-blue-50 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {formData.quantity} × ₹{formData.unit_price.toFixed(2)} = ₹{calculateTotal().toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={!formData.item_name || formData.unit_price <= 0}>
                <Save className="w-4 h-4 mr-1" />
                {editingId ? 'Update' : 'Add'}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Costs List */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : costs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No additional costs added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {costs.map((cost) => (
              <div key={cost.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{cost.item_name}</h4>
                      {getStatusBadge(cost.status)}
                    </div>
                    {cost.description && (
                      <p className="text-sm text-gray-600 mb-2">{cost.description}</p>
                    )}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <span className="ml-2 font-medium">{cost.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Unit Price:</span>
                        <span className="ml-2 font-medium">₹{parseFloat(cost.unit_price.toString()).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-2 font-bold text-blue-600">₹{parseFloat(cost.total_amount.toString()).toFixed(2)}</span>
                      </div>
                    </div>
                    {cost.notes && (
                      <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                        <strong>Notes:</strong> {cost.notes}
                      </div>
                    )}
                    {cost.addedBy && (
                      <div className="mt-2 text-xs text-gray-500">
                        Added by {cost.addedBy.full_name || cost.addedBy.username || 'Admin'} on {new Date(cost.added_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {!readonly && (
                    <div className="flex flex-col gap-2 ml-4">
                      {/* Approval/Rejection Buttons (only for pending costs) */}
                      {cost.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(cost.id, 'approved')}
                            title="Approve this cost"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(cost.id, 'rejected')}
                            title="Reject this cost"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {/* Edit/Delete Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(cost)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(cost.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total Summary */}
        {costs.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Total Additional Costs (Approved Only)
                </p>
                <p className="text-xs text-gray-500">
                  {costs.filter(c => c.status === 'approved').length} approved item(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ₹{approvedTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

