'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Target,
    CheckCircle2,
    Clock,
    TrendingUp,
    Download,
    ChevronDown,
    ChevronRight,
    Filter,
    Calendar as CalendarIcon,
    Search,
    Plus,
    RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    fetchTargets,
    formatTargetPeriod,
    formatTargetAmount,
    formatNumber,
    formatDateToYYYYMMDD,
    getStatusBadgeColor,
    getAchievementColor,
    getAchievementBadgeColor,
    filterTargetsBySearch,
    type TargetListItem,
    type FetchTargetsParams,
} from '@/lib/targetsApi';

export default function GoalTrackingPage() {
    const { toast } = useToast();

    // State management
    const [targets, setTargets] = useState<TargetListItem[]>([]);
    const [filteredTargets, setFilteredTargets] = useState<TargetListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Summary stats
    const [summary, setSummary] = useState({
        totalTargets: 0,
        totalAchieved: 0,
        totalInProgress: 0,
        totalPending: 0,
        overallAchievementPercentage: 0,
    });

    // Available departments (extracted from data)
    const [departments, setDepartments] = useState<string[]>([]);

    // Load targets data
    useEffect(() => {
        loadTargets();
    }, [currentPage, pageSize, statusFilter, departmentFilter, startDate, endDate]);

    // Apply client-side search filter
    useEffect(() => {
        const filtered = filterTargetsBySearch(targets, searchTerm);
        setFilteredTargets(filtered);
    }, [targets, searchTerm]);

    const loadTargets = async () => {
        setLoading(true);

        const params: FetchTargetsParams = {
            page: currentPage,
            limit: pageSize,
        };

        if (statusFilter !== 'all') {
            params.status = statusFilter as any;
        }

        if (departmentFilter !== 'all') {
            params.department = departmentFilter;
        }

        if (startDate) {
            params.startDate = formatDateToYYYYMMDD(startDate);
        }

        if (endDate) {
            params.endDate = formatDateToYYYYMMDD(endDate);
        }

        try {
            const response = await fetchTargets(params);

            if (response.success) {
                setTargets(response.data.targets);
                setFilteredTargets(response.data.targets);
                setSummary(response.data.summary);
                setTotalPages(response.data.pagination.totalPages);
                setTotalRecords(response.data.pagination.totalRecords);

                // Extract unique departments
                const uniqueDepts = Array.from(
                    new Set(
                        response.data.targets
                            .map(t => t.assignedTo.department)
                            .filter((d): d is string => !!d)
                    )
                );
                setDepartments(uniqueDepts);
            } else {
                toast({
                    title: 'Error',
                    description: response.error?.message || 'Failed to load goal tracking data',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Export to CSV
        const headers = ['Title', 'Assigned To', 'Employee ID', 'Department', 'Target', 'Actual', 'Achievement %', 'Status', 'Period'];
        const rows = filteredTargets.map(target => [
            target.title,
            target.assignedTo.name,
            target.assignedTo.employeeId,
            target.assignedTo.department || '',
            formatTargetAmount(target.target.amount, target.target.unit),
            formatTargetAmount(target.actual.totalAmount, target.target.unit),
            `${target.achievement.percentage.toFixed(1)}%`,
            target.achievement.status,
            formatTargetPeriod(target.target.periodStart, target.target.periodEnd),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `goal-tracking-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        toast({
            title: 'Export Successful',
            description: `Exported ${filteredTargets.length} targets to CSV`,
        });
    };

    const toggleRowExpansion = (recordId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(recordId)) {
            newExpanded.delete(recordId);
        } else {
            newExpanded.add(recordId);
        }
        setExpandedRows(newExpanded);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDepartmentFilter('all');
        setStartDate(undefined);
        setEndDate(undefined);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Targets vs Actual</h1>
                            <p className="text-muted-foreground">Track and manage performance targets</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button onClick={loadTargets} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={handleExport} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Target
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
                            <Target className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary.totalTargets}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Achieved</CardTitle>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{summary.totalAchieved}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Clock className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">{summary.totalInProgress}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Achievement</CardTitle>
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${getAchievementColor(summary.overallAchievementPercentage)}`}>
                                {summary.overallAchievementPercentage.toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-5 w-5" />
                            <CardTitle>Filters</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? startDate.toLocaleDateString() : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? endDate.toLocaleDateString() : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, title..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Achieved">Achieved</SelectItem>
                                        <SelectItem value="Exceeded">Exceeded</SelectItem>
                                        <SelectItem value="Not Achieved">Not Achieved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Department Filter */}
                            {departments.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Department</label>
                                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All departments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {departments.map(dept => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Clear Filters Button */}
                            <div className="space-y-2 flex items-end">
                                <Button variant="ghost" onClick={clearFilters} className="w-full">
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Targets ({totalRecords})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : filteredTargets.length === 0 ? (
                            <div className="text-center py-12">
                                <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No targets found</h3>
                                <p className="text-gray-500">Try adjusting your filters or create a new target</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[40px]"></TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Assigned To</TableHead>
                                                <TableHead>Target</TableHead>
                                                <TableHead>Actual</TableHead>
                                                <TableHead>Achievement</TableHead>
                                                <TableHead>Period</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTargets.map((target) => (
                                                <React.Fragment key={target.recordId}>
                                                    <TableRow className="cursor-pointer hover:bg-gray-50">
                                                        <TableCell onClick={() => toggleRowExpansion(target.recordId)}>
                                                            {expandedRows.has(target.recordId) ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{target.title}</TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{target.assignedTo.name}</div>
                                                                <div className="text-xs text-gray-500">{target.assignedTo.employeeId}</div>
                                                                {target.assignedTo.department && (
                                                                    <div className="text-xs text-gray-500">{target.assignedTo.department}</div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{formatTargetAmount(target.target.amount, target.target.unit)}</TableCell>
                                                        <TableCell>{formatTargetAmount(target.actual.totalAmount, target.target.unit)}</TableCell>
                                                        <TableCell>
                                                            <Badge className={getAchievementBadgeColor(target.achievement.percentage)}>
                                                                {target.achievement.percentage.toFixed(1)}%
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {formatTargetPeriod(target.target.periodStart, target.target.periodEnd)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusBadgeColor(target.achievement.status)}>
                                                                {target.achievement.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Button variant="ghost" size="sm">Update</Button>
                                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                                Delete
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* Expanded Row Content */}
                                                    {expandedRows.has(target.recordId) && (
                                                        <TableRow>
                                                            <TableCell colSpan={9} className="bg-gray-50">
                                                                <div className="py-4 px-6">
                                                                    <h4 className="font-semibold mb-3">Daily Breakdown</h4>
                                                                    {Object.keys(target.actual.dailyBreakdown).length > 0 ? (
                                                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                                            {Object.entries(target.actual.dailyBreakdown).map(([date, amount]) => (
                                                                                <div key={date} className="bg-white p-3 rounded-lg border">
                                                                                    <div className="text-xs text-gray-500 mb-1">{new Date(date).toLocaleDateString()}</div>
                                                                                    <div className="font-semibold">{formatTargetAmount(amount, target.target.unit)}</div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500">No daily breakdown available</p>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-500">
                                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="text-sm">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
