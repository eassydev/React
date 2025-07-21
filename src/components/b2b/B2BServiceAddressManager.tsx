'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Building, Store, Warehouse, Home } from 'lucide-react';

interface B2BServiceAddress {
  id: string;
  address_type: string;
  store_name: string;
  store_code: string;
  contact_person: string;
  contact_phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  pincode: string;
  is_primary: boolean;
  is_active: boolean;
}

interface B2BServiceAddressManagerProps {
  customerId: string;
  onSelect: (address: B2BServiceAddress) => void;
  selectedAddress?: B2BServiceAddress | null;
}

export const B2BServiceAddressManager: React.FC<B2BServiceAddressManagerProps> = ({
  customerId,
  onSelect,
  selectedAddress
}) => {
  const [addresses, setAddresses] = useState<B2BServiceAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_type: 'store',
    store_name: '',
    store_code: '',
    contact_person: '',
    contact_phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    is_primary: false,
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      // API call to fetch service addresses for customer
      const response = await fetch(`/api/admin/b2b/customers/${customerId}/addresses`, {
        headers: {
          'admin-auth-token': localStorage.getItem('admin-token') || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching service addresses:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchAddresses();
    }
  }, [customerId]);

  const handleAddAddress = async () => {
    try {
      const response = await fetch(`/api/admin/b2b/customers/${customerId}/addresses`, {
        method: 'POST',
        headers: {
          'admin-auth-token': localStorage.getItem('admin-token') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress),
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(prev => [...prev, data.data]);
        setShowAddDialog(false);
        setNewAddress({
          address_type: 'store',
          store_name: '',
          store_code: '',
          contact_person: '',
          contact_phone: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          pincode: '',
          is_primary: false,
        });
      }
    } catch (error) {
      console.error('Error adding service address:', error);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'store': return <Store className="h-4 w-4" />;
      case 'branch': return <Building className="h-4 w-4" />;
      case 'warehouse': return <Warehouse className="h-4 w-4" />;
      case 'office': return <Home className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'store': return 'Store';
      case 'branch': return 'Branch';
      case 'warehouse': return 'Warehouse';
      case 'office': return 'Office';
      case 'service_location': return 'Service Location';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Service Address *</Label>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Service Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Address Type *</Label>
                  <Select 
                    value={newAddress.address_type} 
                    onValueChange={(value) => setNewAddress(prev => ({ ...prev, address_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="store">Store</SelectItem>
                      <SelectItem value="branch">Branch</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="service_location">Service Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Store/Branch Name</Label>
                  <Input
                    value={newAddress.store_name}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, store_name: e.target.value }))}
                    placeholder="e.g., Mobile World Pune"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Store/Branch Code</Label>
                  <Input
                    value={newAddress.store_code}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, store_code: e.target.value }))}
                    placeholder="e.g., MW-PUN-001"
                  />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={newAddress.contact_person}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, contact_person: e.target.value }))}
                    placeholder="Local contact person"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={newAddress.contact_phone}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="Local contact phone"
                  />
                </div>
                <div>
                  <Label>Pincode *</Label>
                  <Input
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Address Line 1 *</Label>
                <Input
                  value={newAddress.address_line_1}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                  placeholder="Building, Street, Area"
                  required
                />
              </div>

              <div>
                <Label>Address Line 2</Label>
                <Input
                  value={newAddress.address_line_2}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                  placeholder="Landmark, Additional details"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddAddress}>
                  Add Address
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Address Selection */}
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading addresses...</div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`cursor-pointer transition-colors ${
                selectedAddress?.id === address.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(address)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getAddressTypeIcon(address.address_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {address.store_name || `${getAddressTypeLabel(address.address_type)} Address`}
                      </h4>
                      {address.store_code && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {address.store_code}
                        </span>
                      )}
                      {address.is_primary && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {address.address_line_1}
                      {address.address_line_2 && `, ${address.address_line_2}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {address.city}, {address.state} - {address.pincode}
                    </div>
                    {address.contact_person && (
                      <div className="text-xs text-gray-500 mt-1">
                        Contact: {address.contact_person}
                        {address.contact_phone && ` - ${address.contact_phone}`}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No service addresses found</p>
            <Button type="button" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Address
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
