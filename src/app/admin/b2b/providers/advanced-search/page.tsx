'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Users,
  Filter,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
  phone: string;
  rating: number;
  city: string;
  state: string;
  distance_km?: number;
  current_bookings?: number;
  available_slots?: number;
  availability_status?: string;
  metrics?: {
    total_completed_orders: number;
    average_rating: number;
    response_time: string;
    completion_rate: number;
  };
}

interface SearchFilters {
  // Location filters
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  distance_km: number;
  
  // Service filters
  category_id: string;
  subcategory_id: string;
  segment_id: string;
  
  // Availability filters
  service_date: string;
  service_time: string;
  
  // Quality filters
  min_rating: number;
  max_rating: number;
  
  // Workload filters
  max_daily_bookings: number;
  exclude_overloaded: boolean;
  
  // Pagination
  page: number;
  limit: number;
  
  // Sorting
  sort_by: string;
  sort_order: string;
}

export default function AdvancedProviderSearchPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    distance_km: 50,
    category_id: '',
    subcategory_id: '',
    segment_id: '',
    service_date: '',
    service_time: '',
    min_rating: 0,
    max_rating: 5,
    max_daily_bookings: 4,
    exclude_overloaded: true,
    page: 1,
    limit: 20,
    sort_by: 'rating',
    sort_order: 'DESC'
  });

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/b2b/providers/advanced-search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data.data.providers);
        setSearchResults(data.data);
        
        toast({
          title: 'Search Completed',
          description: `Found ${data.data.providers.length} providers matching your criteria`
        });
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: 'Failed to search providers'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      state: '',
      pincode: '',
      latitude: '',
      longitude: '',
      distance_km: 50,
      category_id: '',
      subcategory_id: '',
      segment_id: '',
      service_date: '',
      service_time: '',
      min_rating: 0,
      max_rating: 5,
      max_daily_bookings: 4,
      exclude_overloaded: true,
      page: 1,
      limit: 20,
      sort_by: 'rating',
      sort_order: 'DESC'
    });
    setProviders([]);
    setSearchResults(null);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast({
            title: 'Location Updated',
            description: 'Current location has been set for distance-based search'
          });
        },
        (error) => {
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Unable to get current location'
          });
        }
      );
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAvailabilityBadge = (provider: Provider) => {
    if (provider.availability_status === 'available') {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>;
    }
    if (provider.current_bookings !== undefined) {
      const isOverloaded = provider.current_bookings >= filters.max_daily_bookings;
      return (
        <Badge className={isOverloaded ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
          {provider.available_slots} slots left
        </Badge>
      );
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Provider Search</h1>
          <p className="text-muted-foreground">
            Find the perfect service providers with comprehensive filtering
          </p>
        </div>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="location" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
              <TabsTrigger value="workload">Workload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="location" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    placeholder="Enter city name"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    placeholder="Enter state name"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={filters.pincode}
                    onChange={(e) => handleFilterChange('pincode', e.target.value)}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={filters.latitude}
                    onChange={(e) => handleFilterChange('latitude', e.target.value)}
                    placeholder="Enter latitude"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={filters.longitude}
                    onChange={(e) => handleFilterChange('longitude', e.target.value)}
                    placeholder="Enter longitude"
                  />
                </div>
                <div>
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={filters.distance_km}
                    onChange={(e) => handleFilterChange('distance_km', parseInt(e.target.value))}
                    placeholder="Search radius"
                  />
                </div>
              </div>
              
              <Button onClick={getCurrentLocation} variant="outline" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Use Current Location
              </Button>
            </TabsContent>
            
            <TabsContent value="service" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category ID</Label>
                  <Input
                    id="category"
                    value={filters.category_id}
                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                    placeholder="Enter category ID"
                  />
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory ID</Label>
                  <Input
                    id="subcategory"
                    value={filters.subcategory_id}
                    onChange={(e) => handleFilterChange('subcategory_id', e.target.value)}
                    placeholder="Enter subcategory ID"
                  />
                </div>
                <div>
                  <Label htmlFor="segment">Segment ID</Label>
                  <Input
                    id="segment"
                    value={filters.segment_id}
                    onChange={(e) => handleFilterChange('segment_id', e.target.value)}
                    placeholder="Enter segment ID"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="availability" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_date">Service Date</Label>
                  <Input
                    id="service_date"
                    type="date"
                    value={filters.service_date}
                    onChange={(e) => handleFilterChange('service_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="service_time">Service Time</Label>
                  <Input
                    id="service_time"
                    type="time"
                    value={filters.service_time}
                    onChange={(e) => handleFilterChange('service_time', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quality" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_rating">Minimum Rating</Label>
                  <Input
                    id="min_rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.min_rating}
                    onChange={(e) => handleFilterChange('min_rating', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_rating">Maximum Rating</Label>
                  <Input
                    id="max_rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.max_rating}
                    onChange={(e) => handleFilterChange('max_rating', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="workload" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_bookings">Max Daily Bookings</Label>
                  <Input
                    id="max_bookings"
                    type="number"
                    value={filters.max_daily_bookings}
                    onChange={(e) => handleFilterChange('max_daily_bookings', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="exclude_overloaded"
                    checked={filters.exclude_overloaded}
                    onChange={(e) => handleFilterChange('exclude_overloaded', e.target.checked)}
                  />
                  <Label htmlFor="exclude_overloaded">Exclude Overloaded Providers</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex gap-4 mt-6">
            <Button onClick={handleSearch} disabled={loading} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {loading ? 'Searching...' : 'Search Providers'}
            </Button>
            <Button onClick={resetFilters} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Found: {searchResults.providers.length} providers</span>
              <span>Filters Applied: {searchResults.search_summary.filters_used}</span>
              {searchResults.search_summary.search_radius_km && (
                <span>Radius: {searchResults.search_summary.search_radius_km}km</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProviders([...selectedProviders, provider.id]);
                          } else {
                            setSelectedProviders(selectedProviders.filter(id => id !== provider.id));
                          }
                        }}
                        className="rounded"
                      />
                      <div>
                        <h3 className="font-semibold">
                          {provider.first_name} {provider.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {provider.company_name || 'Individual Provider'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAvailabilityBadge(provider)}
                      <div className={`flex items-center gap-1 ${getRatingColor(provider.rating)}`}>
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{provider.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{provider.city}, {provider.state}</p>
                        {provider.distance_km && (
                          <p className="text-muted-foreground">{provider.distance_km}km away</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {provider.metrics?.total_completed_orders || 0} orders completed
                        </p>
                        <p className="text-muted-foreground">
                          {provider.metrics?.completion_rate || 0}% completion rate
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          Response: {provider.metrics?.response_time || 'N/A'}
                        </p>
                        {provider.current_bookings !== undefined && (
                          <p className="text-muted-foreground">
                            Current bookings: {provider.current_bookings}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {providers.length === 0 && searchResults && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>No providers found matching your search criteria</p>
                  <p className="text-sm">Try adjusting your filters and search again</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
