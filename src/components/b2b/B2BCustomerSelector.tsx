'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Building2, User, Phone, Mail } from 'lucide-react';
import { fetchB2BCustomers } from '@/lib/api';

interface B2BCustomer {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
}

interface B2BCustomerSelectorProps {
  onSelect: (customer: B2BCustomer) => void;
  selectedCustomer?: B2BCustomer | null;
  showChangeButton?: boolean; // ✅ Add prop to control change button visibility
}

export const B2BCustomerSelector: React.FC<B2BCustomerSelectorProps> = ({
  onSelect,
  selectedCustomer,
  showChangeButton = true // ✅ Default to true for backward compatibility
}) => {
  const [customers, setCustomers] = useState<B2BCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchCustomers = async (search = '') => {
    try {
      setLoading(true);
      const data = await fetchB2BCustomers(1, 50, 'active', search);
      
      if (data && data.data && data.data.customers) {
        setCustomers(data.data.customers);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching B2B customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchCustomers(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleCustomerSelect = (customer: B2BCustomer) => {
    onSelect(customer);
    setShowDropdown(false);
    setSearchTerm(customer.company_name);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="customer-search">Select B2B Customer *</Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="customer-search"
              type="text"
              placeholder="Search by company name, contact person, or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="pl-10"
            />
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading customers...
                </div>
              ) : customers.length > 0 ? (
                <div className="p-1">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex cursor-pointer items-start space-x-3 rounded-sm px-3 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <Building2 className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {customer.company_name}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{customer.contact_person}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {customer.city}, {customer.state} - {customer.pincode}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'No customers found matching your search' : 'No customers available'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Customer Display */}
      {selectedCustomer && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{selectedCustomer.company_name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{selectedCustomer.contact_person}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="text-gray-500">
                    {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}
                  </div>
                </div>
                {/* ✅ Conditionally show change button */}
                {showChangeButton && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setShowDropdown(true);
                      }}
                    >
                      Change Customer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};
