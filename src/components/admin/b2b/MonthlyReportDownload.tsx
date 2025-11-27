/**
 * B2B Monthly Report Download Component
 * Allows users to download comprehensive monthly reports with filters
 */

import React, { useState } from 'react';
import { Download, Calendar, Filter, FileSpreadsheet } from 'lucide-react';

interface MonthlyReportDownloadProps {
    customerId?: string; // Optional: Pre-filter by customer
    className?: string;
}

const MonthlyReportDownload: React.FC<MonthlyReportDownloadProps> = ({
    customerId,
    className = ''
}) => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState<number>(currentYear);
    const [month, setMonth] = useState<string>(''); // Empty = all months
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string>('');

    // Month options
    const months = [
        { value: '', label: 'All Months' },
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    // Year options (last 5 years + current + next year)
    const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

    const downloadReport = async () => {
        try {
            setIsDownloading(true);
            setError('');

            // Build query parameters
            const params = new URLSearchParams();
            params.append('year', year.toString());
            if (month) params.append('month', month);
            if (customerId) params.append('customer_id', customerId);

            // Get auth token
            const token = localStorage.getItem('admin-auth-token') || sessionStorage.getItem('admin-auth-token');

            if (!token) {
                throw new Error('Authentication required. Please log in again.');
            }

            // Make API request
            const response = await fetch(
                `/admin-api/b2b/analytics/export/monthly-report?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'admin-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Export failed: ${response.statusText}`);
            }

            // Get the blob
            const blob = await response.blob();

            if (blob.size === 0) {
                throw new Error('No data available for the selected period');
            }

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Generate filename
            const monthName = month ? months.find(m => m.value === month)?.label : 'All';
            a.download = `B2B_Monthly_Report_${monthName}_${year}_${new Date().toISOString().split('T')[0]}.xlsx`;

            // Trigger download
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            console.log('✅ Monthly report downloaded successfully');
        } catch (err: any) {
            console.error('❌ Download failed:', err);
            setError(err.message || 'Failed to download report');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Report</h3>
                    <p className="text-sm text-gray-600">
                        Export comprehensive order details by month
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-4 mb-6">
                {/* Year Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Year
                    </label>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isDownloading}
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Month Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Filter className="w-4 h-4 inline mr-1" />
                        Month (Optional)
                    </label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isDownloading}
                    >
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                        Leave as "All Months" to export the entire year
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Download Button */}
            <button
                onClick={downloadReport}
                disabled={isDownloading}
                className={`
          w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium
          transition-all duration-200
          ${isDownloading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                    }
        `}
            >
                {isDownloading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Report...</span>
                    </>
                ) : (
                    <>
                        <Download className="w-5 h-5" />
                        <span>Download Excel Report</span>
                    </>
                )}
            </button>

            {/* Info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Report Includes:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Client Name & Order Description</li>
                    <li>• Order Value & Payment Terms</li>
                    <li>• Order Received, Work Start & Completion Dates</li>
                    <li>• Work Completion Days & Status</li>
                    <li>• Completion Percentage</li>
                    <li>• Invoice Details & Payment Collection</li>
                    <li>• Color-coded by order status</li>
                    <li>• Summary totals for each month</li>
                </ul>
            </div>
        </div>
    );
};

export default MonthlyReportDownload;
