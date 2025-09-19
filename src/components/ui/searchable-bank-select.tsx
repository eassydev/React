'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { fetchAllBanks } from '@/lib/api';
import CustomAddBankModal from '@/components/ui/custom-add-bank-modal';
import { Search, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface Bank {
  id: string;
  name: string;
}

interface SearchableBankSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const SearchableBankSelect: React.FC<SearchableBankSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select Bank",
  required = false
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load banks on component mount
  useEffect(() => {
    loadBanks();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Update selected bank when value changes
  useEffect(() => {
    if (value && banks.length > 0) {
      const bank = banks.find(b => b.id === value);
      setSelectedBank(bank || null);
    } else {
      setSelectedBank(null);
    }
  }, [value, banks]);

  // Filter banks based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBanks(banks);
    } else {
      const filtered = banks.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBanks(filtered);
    }
  }, [searchTerm, banks]);

  const loadBanks = async (search?: string) => {
    try {
      setIsLoading(true);
      const bankData = await fetchAllBanks(search);
      const formattedBanks = bankData
        .filter((bank) => bank.id)
        .map((bank) => ({
          id: bank.id!.toString(),
          name: bank.name,
        }));
      setBanks(formattedBanks);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load banks.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankSelect = (bank: Bank) => {
    console.log('Selecting bank:', bank); // Debug log
    setSelectedBank(bank);
    onValueChange(bank.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleBankAdded = async (newBank: Bank) => {
    console.log('New bank added:', newBank); // Debug log

    // Reload banks from server to ensure we have the latest data
    try {
      await loadBanks();
    } catch (error) {
      console.error('Error reloading banks:', error);
    }

    // Add the new bank to the list (in case server reload failed)
    setBanks(prev => {
      // Check if bank already exists to avoid duplicates
      const exists = prev.some(bank => bank.id === newBank.id);
      if (exists) {
        console.log('Bank already exists in list'); // Debug log
        return prev;
      }
      // Add new bank and sort alphabetically
      const updatedBanks = [...prev, newBank].sort((a, b) => a.name.localeCompare(b.name));
      console.log('Updated banks list:', updatedBanks); // Debug log
      return updatedBanks;
    });

    // Clear search term to show all banks including the new one
    setSearchTerm('');

    // Select the newly created bank and show it in dropdown
    setSelectedBank(newBank);
    onValueChange(newBank.id);

    // Show success message
    toast({
      variant: 'default',
      title: 'Bank Added & Selected',
      description: `${newBank.name} has been added and selected.`,
    });

    // Briefly reopen dropdown to show the new bank was added
    setTimeout(() => {
      setIsOpen(true);
      setTimeout(() => setIsOpen(false), 2000); // Close after 2 seconds
    }, 100);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Select Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedBank ? 'text-black' : 'text-gray-500'}>
          {selectedBank ? selectedBank.name : placeholder}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg border-gray-200">
          <CardContent className="p-0">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search banks..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 border-gray-200"
                  autoFocus
                />
              </div>
            </div>

            {/* Bank List */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading banks...</div>
              ) : filteredBanks.length > 0 ? (
                filteredBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                    onClick={() => handleBankSelect(bank)}
                  >
                    <span className="text-sm text-gray-900">{bank.name}</span>
                    {selectedBank?.id === bank.id && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No banks found matching your search.' : 'No banks available.'}
                </div>
              )}
            </div>

            {/* Add New Bank Button */}
            <div className="p-3 border-t border-gray-100">
              <CustomAddBankModal onBankAdded={handleBankAdded} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchableBankSelect;
