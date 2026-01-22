/**
 * Targets API Client
 * 
 * External API integration for goal tracking and target achievement data.
 * API Documentation: EXTERNAL_API_INTEGRATION_GUIDE.md
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TargetAssignee {
    employeeId: string;
    name: string;
    department?: string;
}

export interface TargetDetails {
    amount: number;
    unit: string;
    periodStart: string;
    periodEnd: string;
}

export interface ActualDetails {
    totalAmount: number;
    dailyBreakdown: { [date: string]: number };
    lastUpdated?: string;
}

export interface AchievementDetails {
    percentage: number;
    status: 'Pending' | 'In Progress' | 'Achieved' | 'Not Achieved' | 'Exceeded';
    variance: number;
    isOnTrack: boolean;
}

export interface TargetListItem {
    recordId: string;
    title: string;
    assignedTo: TargetAssignee;
    target: TargetDetails;
    actual: ActualDetails;
    achievement: AchievementDetails;
    createdBy: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TargetsSummary {
    totalTargets: number;
    totalAchieved: number;
    totalInProgress: number;
    totalPending: number;
    totalExceeded: number;
    overallAchievementPercentage: number;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
}

export interface TargetsApiMetadata {
    requestId: string;
    timestamp: string;
    serverTime?: string;
    authMethod?: string;
}

export interface TargetsApiResponse {
    success: boolean;
    data: {
        targets: TargetListItem[];
        summary: TargetsSummary;
        pagination: PaginationInfo;
        metadata: TargetsApiMetadata;
    };
    error?: {
        code: string;
        message: string;
        details?: string;
    };
}

export interface FetchTargetsParams {
    page?: number;
    limit?: number;
    assignedTo?: string;
    department?: string;
    status?: 'Pending' | 'In Progress' | 'Achieved' | 'Not Achieved' | 'Exceeded';
    startDate?: string;
    endDate?: string;
    sortBy?: 'title' | 'targetAmount' | 'totalActual' | 'achievementPercentage' | 'periodStart' | 'periodEnd';
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

// Use internal Next.js API route as proxy (keeps API key secure on server)
const API_PROXY_URL = '/api/targets';

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Fetch targets from the external API
 * @param params Query parameters for filtering, pagination, and sorting
 * @returns Promise with targets data
 */
export async function fetchTargets(params: FetchTargetsParams = {}): Promise<TargetsApiResponse> {
    // Build query string
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params.department) queryParams.append('department', params.department);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Call internal proxy route (API key is handled server-side)
    const url = `${API_PROXY_URL}?${queryParams.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Disable caching for real-time data
        });

        if (!response.ok) {
            // Handle HTTP errors
            const errorData = await response.json().catch(() => null);

            if (response.status === 401) {
                return {
                    success: false,
                    data: {
                        targets: [],
                        summary: getEmptySummary(),
                        pagination: getEmptyPagination(),
                        metadata: { requestId: '', timestamp: new Date().toISOString() },
                    },
                    error: {
                        code: 'AUTH_ERROR',
                        message: errorData?.error?.message || 'Authentication failed. Please check API key configuration.',
                    },
                };
            }

            if (response.status === 429) {
                return {
                    success: false,
                    data: {
                        targets: [],
                        summary: getEmptySummary(),
                        pagination: getEmptyPagination(),
                        metadata: { requestId: '', timestamp: new Date().toISOString() },
                    },
                    error: {
                        code: 'RATE_LIMITED',
                        message: 'Too many requests. Please try again later.',
                    },
                };
            }

            throw new Error(errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data: TargetsApiResponse = await response.json();
        return data;

    } catch (error) {
        console.error('❌ Targets API Error:', error);

        // Network error or other issues
        return {
            success: false,
            data: {
                targets: [],
                summary: getEmptySummary(),
                pagination: getEmptyPagination(),
                metadata: { requestId: '', timestamp: new Date().toISOString() },
            },
            error: {
                code: 'NETWORK_ERROR',
                message: error instanceof Error ? error.message : 'Failed to fetch targets data',
            },
        };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get achievement color based on percentage
 * - Red: < 50%
 * - Yellow: 50-89%
 * - Green: >= 90%
 */
export function getAchievementColor(percentage: number): string {
    if (percentage < 50) return 'text-red-600';
    if (percentage < 90) return 'text-yellow-600';
    return 'text-green-600';
}

/**
 * Get achievement badge color
 */
export function getAchievementBadgeColor(percentage: number): string {
    if (percentage < 50) return 'bg-red-100 text-red-800';
    if (percentage < 90) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
}

/**
 * Get status badge color
 */
export function getStatusBadgeColor(status: string): string {
    switch (status) {
        case 'Pending':
            return 'bg-gray-100 text-gray-800';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800';
        case 'Achieved':
            return 'bg-green-100 text-green-800';
        case 'Exceeded':
            return 'bg-green-100 text-green-800';
        case 'Not Achieved':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Format target period as date range string
 */
export function formatTargetPeriod(start: string, end: string): string {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
    return num.toLocaleString('en-US');
}

/**
 * Format target amount with unit
 */
export function formatTargetAmount(amount: number, unit: string): string {
    if (unit === 'USD' || unit.startsWith('$')) {
        return `$${formatNumber(amount)}`;
    }
    return `${formatNumber(amount)} ${unit}`;
}

/**
 * Get empty summary object
 */
function getEmptySummary(): TargetsSummary {
    return {
        totalTargets: 0,
        totalAchieved: 0,
        totalInProgress: 0,
        totalPending: 0,
        totalExceeded: 0,
        overallAchievementPercentage: 0,
    };
}

/**
 * Get empty pagination object
 */
function getEmptyPagination(): PaginationInfo {
    return {
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
    };
}

/**
 * Search/filter targets locally based on search term
 * This is a client-side filter for the search functionality
 */
export function filterTargetsBySearch(targets: TargetListItem[], searchTerm: string): TargetListItem[] {
    if (!searchTerm || searchTerm.trim() === '') return targets;

    const term = searchTerm.toLowerCase().trim();

    return targets.filter(target =>
        target.title.toLowerCase().includes(term) ||
        target.assignedTo.name.toLowerCase().includes(term) ||
        target.assignedTo.employeeId.toLowerCase().includes(term) ||
        (target.assignedTo.department && target.assignedTo.department.toLowerCase().includes(term))
    );
}
