/**
 * Simple Monthly Report Download Button
 * Compact version for embedding in dashboards or tables
 */

import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

interface MonthlyReportButtonProps {
    year?: number;
    month?: number;
    customerId?: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const MonthlyReportButton: React.FC<MonthlyReportButtonProps> = ({
    year,
    month,
    customerId,
    variant = 'primary',
    size = 'md',
    className = ''
}) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadReport = async () => {
        try {
            setIsDownloading(true);

            // Build query parameters
            const params = new URLSearchParams();
            if (year) params.append('year', year.toString());
            if (month) params.append('month', month.toString());
            if (customerId) params.append('customer_id', customerId);

            // Get auth token
            const token = localStorage.getItem('admin-auth-token') || sessionStorage.getItem('admin-auth-token');

            if (!token) {
                alert('Authentication required. Please log in again.');
                return;
            }

            // Make API request
            const response = await fetch(
                `/admin-api/b2b/analytics/export/monthly-report?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'admin-auth-token': token
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Export failed');
            }

            // Get the blob
            const blob = await response.blob();

            if (blob.size === 0) {
                alert('No data available for the selected period');
                return;
            }

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Generate filename
            const monthName = month ? new Date(2000, month - 1).toLocaleString('default', { month: 'long' }) : 'All';
            const yearStr = year || new Date().getFullYear();
            a.download = `B2B_Monthly_Report_${monthName}_${yearStr}.xlsx`;

            // Trigger download
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err: any) {
            console.error('Download failed:', err);
            alert(err.message || 'Failed to download report');
        } finally {
            setIsDownloading(false);
        }
    };

    // Variant styles
    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
    };

    // Size styles
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    return (
        <button
            onClick={downloadReport}
            disabled={isDownloading}
            className={`
        inline-flex items-center gap-2 rounded-lg font-medium
        transition-all duration-200 active:scale-95
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
            title="Download Monthly Report"
        >
            {isDownloading ? (
                <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Downloading...</span>
                </>
            ) : (
                <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Monthly Report</span>
                </>
            )}
        </button>
    );
};

export default MonthlyReportButton;

/**
 * Usage Examples:
 * 
 * // Download all months for current year
 * <MonthlyReportButton />
 * 
 * // Download specific month
 * <MonthlyReportButton year={2025} month={11} />
 * 
 * // Download for specific customer
 * <MonthlyReportButton customerId="customer123" />
 * 
 * // Different variants and sizes
 * <MonthlyReportButton variant="outline" size="sm" />
 * <MonthlyReportButton variant="secondary" size="lg" />
 */
