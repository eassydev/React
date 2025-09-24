'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronDown, User, Star, MapPin, Check } from 'lucide-react';
import { searchProvidersForAssignment, ProviderSearchResult } from '@/lib/api';

interface ProviderSearchDropdownProps {
  value?: string;
  onChange: (providerId: string, provider: ProviderSearchResult | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export const ProviderSearchDropdown: React.FC<ProviderSearchDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'Search and select provider...',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [providers, setProviders] = useState<ProviderSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderSearchResult | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  const searchProviders = useCallback(async (query: string, pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await searchProvidersForAssignment(query, pageNum, 20);
      
      if (response.success) {
        if (append) {
          setProviders(prev => [...prev, ...response.data.providers]);
        } else {
          setProviders(response.data.providers);
        }
        setHasMore(response.data.pagination.has_next);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to search providers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProviders(searchTerm, 1, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchProviders]);

  // Load initial providers
  useEffect(() => {
    if (isOpen && providers.length === 0) {
      searchProviders('', 1, false);
    }
  }, [isOpen, providers.length, searchProviders]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find selected provider by value
  useEffect(() => {
    if (value && providers.length > 0) {
      const provider = providers.find(p => p.value === value);
      if (provider) {
        setSelectedProvider(provider);
      }
    } else if (!value) {
      setSelectedProvider(null);
    }
  }, [value, providers]);

  const handleSelect = (provider: ProviderSearchResult) => {
    setSelectedProvider(provider);
    onChange(provider.value, provider);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedProvider(null);
    onChange('', null);
    setSearchTerm('');
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      searchProviders(searchTerm, page + 1, true);
    }
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Provider Display / Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}
          ${required && !selectedProvider ? 'border-red-300' : 'border-gray-300'}
          flex items-center justify-between min-h-[42px]
        `}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {selectedProvider ? (
            <>
              <div className="flex-shrink-0">
                {selectedProvider.profile_image ? (
                  <img
                    src={selectedProvider.profile_image}
                    alt={selectedProvider.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {selectedProvider.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {selectedProvider.location && (
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {selectedProvider.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {selectedProvider.rating && selectedProvider.rating > 0 && (
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs text-gray-600 ml-1">
                      {Number(selectedProvider.rating).toFixed(1)}
                    </span>
                  </div>
                )}
                {selectedProvider.is_verified && (
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-2 h-2 text-green-600" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search providers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Provider List */}
          <div className="max-h-64 overflow-y-auto">
            {loading && providers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching providers...
              </div>
            ) : providers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? `No providers found for "${searchTerm}"` : 'No providers available'}
              </div>
            ) : (
              <>
                {/* Clear Selection Option */}
                {selectedProvider && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 text-red-600"
                  >
                    Clear Selection
                  </button>
                )}

                {/* Provider Options */}
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleSelect(provider)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                      flex items-center space-x-3
                      ${value === provider.value ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                    `}
                  >
                    <div className="flex-shrink-0">
                      {provider.profile_image ? (
                        <img
                          src={provider.profile_image}
                          alt={provider.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {provider.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {provider.email}
                      </div>
                      {provider.location && (
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {provider.location}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {provider.rating && provider.rating > 0 && (
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {Number(provider.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                      {provider.is_verified && (
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}

                {/* Load More */}
                {hasMore && (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full px-4 py-2 text-center text-blue-600 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 border-t border-gray-100"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                        Loading more...
                      </div>
                    ) : (
                      'Load more providers'
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
