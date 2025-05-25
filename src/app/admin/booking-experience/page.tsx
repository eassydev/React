"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Virtuoso } from "react-virtuoso";
import {
  Search,
  Download,
  Star,
  Calendar,
  User,
  Package,
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  fetchBookingFeedback,
  exportBookingFeedback,
  BookingFeedback,
  BookingFeedbackResponse
} from '@/lib/api';

const BookingExperiencePage: React.FC = () => {
  const { toast } = useToast();

  // State management
  const [feedback, setFeedback] = useState<BookingFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch feedback
  const fetchFeedbackData = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        rating: ratingFilter,
        startDate,
        endDate,
      };

      const response: BookingFeedbackResponse = await fetchBookingFeedback(page, pageSize, filters);

      setFeedback(response.data);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: `Failed to fetch booking feedback: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFeedbackData(1);
  }, [pageSize, ratingFilter]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchFeedbackData(1);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Date filter effect
  useEffect(() => {
    if (startDate || endDate) {
      fetchFeedbackData(1);
    }
  }, [startDate, endDate]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchFeedbackData(page);
  };

  // Delete functionality removed as per user request

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportBookingFeedback(startDate, endDate);
      toast({
        variant: "success",
        title: "Success",
        description: "Booking feedback exported successfully.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: `Failed to export booking feedback: ${error}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setRatingFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  // Render feedback item
  const renderFeedbackItem = (index: number, feedbackItem: BookingFeedback) => {
    const user = feedbackItem.user;
    const booking = feedbackItem.booking;

    return (
      <div key={feedbackItem.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
          {/* Customer Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-medium text-sm">
                  {user ? `${user.first_name} ${user.last_name}` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-500">{user?.mobile}</p>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <div>
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">{booking?.order_id || 'N/A'}</span>
            </div>
            <p className="text-xs text-gray-500">{feedbackItem.category?.name}</p>
            <p className="text-xs text-gray-500">{feedbackItem.subcategory?.name}</p>
          </div>

          {/* Rating */}
          <div>
            {renderStarRating(feedbackItem.rating)}
          </div>

          {/* Provider & Service Info */}
          <div className="text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Provider: {feedbackItem.provider ? `${feedbackItem.provider.first_name} ${feedbackItem.provider.last_name}` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs ${
                feedbackItem.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {feedbackItem.status}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{feedbackItem.created_at_formatted}</span>
            </div>
          </div>

          {/* Actions - Removed as per user request */}
          <div className="flex space-x-2">
            <span className="text-xs text-gray-500">ID: {feedbackItem.sampleid}</span>
          </div>
        </div>

        {/* Comment */}
        {feedbackItem.comment && (
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-700">
              <strong>Comment:</strong> {feedbackItem.comment}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Booking Feedback</CardTitle>
              <CardDescription>
                Manage and view customer booking feedback and ratings
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                variant="outline"
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <div className="flex space-x-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={() => fetchFeedbackData(1)}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing {feedback.length} of {totalItems} booking feedback
            </p>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No booking feedback found</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Virtuoso
                style={{ height: '600px' }}
                totalCount={feedback.length}
                itemContent={(index) => renderFeedbackItem(index, feedback[index])}
              />
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingExperiencePage;
