'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, ArrowLeft, Users, CheckCircle, XCircle, PlayCircle, Eye } from 'lucide-react';
import { 
    getProviderTrainingStats,
    ProviderTrainingStatCategory,
    getAllVideosViaCategory, 
    getProviderAnsweredDetailStats,
    downloadProviderStats,
    exportProviderStats,
    getCategoryProviderStats,
    downloadCategoryProviderStats,
    CategoryProviderStat,
    downloadProviderTrainingStats
} from '@/lib/api';
import Image from 'next/image';

interface ItemData { // This represents the "video" or "subcategory" item
    id: string;
    category_id: string;
    subcategory_id: string;
    video_url: string;
    sequence_number: string;
    module: string;
    title: string;
    is_active: boolean;
    provider_type: string;
    createdAt: string;
    updatedAt: string;
}

interface ProviderStat {
    provider_id: string;
    full_name: string;
    email: string;
    unique_code: string;
    phone: string;
    total_answers: number;
    correct_answers: number;
    wrong_answers: number;
}

export default function StatisticsPage() {
    // --- State ---
    const [categories, setCategories] = useState<ProviderTrainingStatCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [videos, setVideos] = useState<ItemData[]>([]);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [providerStats, setProviderStats] = useState<ProviderStat[]>([]);
    
    // New State for Category Provider Stats (Drill-down from Completed Count)
    const [showingCategoryCompletedStats, setShowingCategoryCompletedStats] = useState<string | null>(null);
    const [categoryProviderStats, setCategoryProviderStats] = useState<CategoryProviderStat[]>([]);

    const [searchQuery, setSearchQuery] = useState('');

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [downloading, setDownloading] = useState(false); // For specific video or category stats
    const [globalDownloading, setGlobalDownloading] = useState(false); // For global stats

    // Date Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // --- Effects ---

    useEffect(() => {
        fetchCategories();
    }, [startDate, endDate]);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchVideos(selectedCategoryId);
        } else {
            setVideos([]);
        }
    }, [selectedCategoryId]);

    useEffect(() => {
        if (selectedVideoId) {
            fetchProviderStats(selectedVideoId, searchQuery);
        } else {
            setProviderStats([]);
        }
    }, [selectedVideoId, searchQuery]);

    // Effect for fetching Category Provider Stats
    useEffect(() => {
        if (showingCategoryCompletedStats) {
            fetchCategoryProviderStats(showingCategoryCompletedStats, searchQuery);
        } else {
            setCategoryProviderStats([]);
        }
    }, [showingCategoryCompletedStats, searchQuery]);


    // --- API Handlers ---

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const data = await getProviderTrainingStats(startDate, endDate);
            if (data.status) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchVideos = async (categoryId: string) => {
        setLoadingVideos(true);
        try {
            const data = await getAllVideosViaCategory(categoryId);
            if (data.status) {
                setVideos(data.data);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoadingVideos(false);
        }
    };

    const fetchProviderStats = async (videoId: string, search: string = '') => {
        setLoadingStats(true);
        try {
            const data = await getProviderAnsweredDetailStats(videoId, search);
            if (data.status) {
                setProviderStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching provider stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchCategoryProviderStats = async (categoryId: string, search: string = '') => {
        setLoadingStats(true);
        try {
            const data = await getCategoryProviderStats(categoryId, search);
            if (data.status) {
                setCategoryProviderStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching category provider stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    // --- Handlers ---

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setSelectedVideoId(null); // Reset selection
        setProviderStats([]);
        setShowingCategoryCompletedStats(null); // Ensure this is closed
    };

    const handleCompletedClick = (categoryId: string) => {
        setShowingCategoryCompletedStats(categoryId);
        setSelectedCategoryId(null); // Close normal category view if open (though likely coming from list)
        setSearchQuery(''); // Reset search for new view
    };

    const handleVideoClick = (videoId: string) => {
        setSelectedVideoId(videoId);
    };

    const handleBackToCategories = () => {
        setSelectedCategoryId(null);
        setSelectedVideoId(null);
        setProviderStats([]);
        setShowingCategoryCompletedStats(null);
        setSearchQuery('');
    };
    
    const handleBackToVideos = () => {
        setSelectedVideoId(null);
        setProviderStats([]);
        setSearchQuery('');
    };

    const handleDownload = async () => {
        // Download for Video Provider Stats
        if (selectedVideoId) {
            setDownloading(true);
            try {
                await downloadProviderStats(selectedVideoId, searchQuery);
            } catch (error) {
                console.error('Download failed:', error);
            } finally {
                setDownloading(false);
            }
            return;
        }

        // Download for Category Provider Stats
        if (showingCategoryCompletedStats) {
             setDownloading(true);
             try {
                 await downloadCategoryProviderStats(showingCategoryCompletedStats, searchQuery);
             } catch (error) {
                 console.error('Download failed:', error);
             } finally {
                 setDownloading(false);
             }
             return;
        }
    };

    const handleGlobalDownload = async () => {
        setGlobalDownloading(true);
        try {
            await downloadProviderTrainingStats(startDate, endDate);
        } catch (error) {
            console.error('Global download failed:', error);
        } finally {
            setGlobalDownloading(false);
        }
    };

    // --- Render ---

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Video Learning Statistics</h1>
                
                {!showingCategoryCompletedStats && !selectedVideoId && (
                     <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <div className="flex items-center gap-2">
                             <Input 
                                type="date"
                                placeholder="Start Date"
                                className="w-auto"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-muted-foreground">-</span>
                             <Input 
                                type="date"
                                placeholder="End Date"
                                className="w-auto"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleGlobalDownload} disabled={globalDownloading}>
                            {globalDownloading ? 'Downloading...' : 'Download Report'}
                        </Button>
                     </div>
                )}
            </div>

            {/* View: Categories List (Tabular) */}
            {!selectedCategoryId && !showingCategoryCompletedStats && (
                <Card>
                    <CardHeader>
                        <CardTitle>Training Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingCategories ? (
                            <p className="p-4 text-center text-muted-foreground">Loading categories...</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Category</TableHead>
                                        <TableHead className="text-right">AMC Order</TableHead>
                                        <TableHead className="text-right">Total Providers</TableHead>
                                        <TableHead className="text-right">Completed</TableHead>
                                        <TableHead className="text-right">Videos</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((item) => (
                                        <TableRow 
                                            key={item.category_id} 
                                            className="cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => handleCategoryClick(item.category_id)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative w-12 h-12 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                                                        <Image 
                                                            src={item.category_image} 
                                                            alt={item.category_name} 
                                                            fill 
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    </div>
                                                    <span className="font-medium">{item.category_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">{item.Amc_training_Order}</TableCell>
                                            <TableCell className="text-right font-medium">{item.total_providers}</TableCell>
                                            <TableCell className="text-right">
                                                <div 
                                                    className="flex items-center justify-end text-green-600 hover:text-green-800 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCompletedClick(item.category_id);
                                                    }}
                                                >
                                                    <span className="font-bold mr-2 hover:underline cursor-pointer" title="View details">
                                                        {item.training_providers_completed}
                                                    </span>
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end">
                                                    <span className="font-bold mr-2">{item.active_videos_count}</span>
                                                    <PlayCircle className="h-4 w-4 text-primary/50" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* View: Category Provider Stats (Drill-down from Completed) */}
            {showingCategoryCompletedStats && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                         <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" onClick={handleBackToCategories}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <CardTitle>Completed Providers</CardTitle>
                                <p className="text-sm text-muted-foreground">Category ID: {showingCategoryCompletedStats}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search provider..." 
                                    className="pl-8" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleDownload} disabled={downloading} size="sm">
                                {downloading ? 'Downloading...' : 'Download Excel'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         {loadingStats ? (
                            <p className="p-4 text-center text-muted-foreground">Loading stats...</p>
                        ) : categoryProviderStats.length === 0 ? (
                             <p className="text-muted-foreground text-center py-8">No providers found.</p>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Provider ID</TableHead>
                                            <TableHead>Provider Name</TableHead>
                                            <TableHead>Unique Code</TableHead>
                                            <TableHead>Parent Name</TableHead>
                                            <TableHead className="text-right">Videos Completed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categoryProviderStats.map((stat) => (
                                            <TableRow key={stat.sp_id}>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {stat.sp_id}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {stat.sp_name}
                                                </TableCell>
                                                <TableCell>{stat.sp_unique_code}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {stat.sp_parent_name || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-green-600">
                                                    {stat.videos_completed}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* View: Videos List (Tabular) */}
            {selectedCategoryId && !selectedVideoId && (
                <Card>
                    <CardHeader className="flex flex-row items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={handleBackToCategories}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <CardTitle>Select Video</CardTitle>
                            <p className="text-sm text-muted-foreground">Category ID: {selectedCategoryId}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingVideos ? (
                            <p className="p-4 text-center text-muted-foreground">Loading videos...</p>
                        ) : videos.length === 0 ? (
                             <p className="p-4 text-center text-muted-foreground">No videos found for this category.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[400px]">Video</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Sequence</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {videos.map((video) => (
                                        <TableRow 
                                            key={video.id} 
                                            className="cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => handleVideoClick(video.id)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-16 h-10 bg-slate-200 rounded overflow-hidden relative flex-shrink-0">
                                                        <video src={video.video_url} className="w-full h-full object-cover" /> 
                                                    </div>
                                                    <span className="font-medium line-clamp-2">{video.title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="bg-slate-100 px-2.5 py-1 rounded-full text-xs font-medium uppercase min-w-[80px] text-center inline-block">
                                                    {video.provider_type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground font-mono">#{video.sequence_number}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 ml-auto">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* View: Provider Stats (Video Specific) */}
            {selectedVideoId && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                         <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" onClick={handleBackToVideos}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <CardTitle>Provider Statistics</CardTitle>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search provider..." 
                                    className="pl-8" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleDownload} disabled={downloading} size="sm">
                                {downloading ? 'Downloading...' : 'Download Report'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         {loadingStats ? (
                            <p className="p-4 text-center text-muted-foreground">Loading stats...</p>
                        ) : providerStats.length === 0 ? (
                             <p className="text-muted-foreground text-center py-8">No statistics found for this video.</p>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Provider Name</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Unique Code</TableHead>
                                            <TableHead className="text-right">Total Answers</TableHead>
                                            <TableHead className="text-right text-green-600">Correct</TableHead>
                                            <TableHead className="text-right text-red-600">Wrong</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {providerStats.map((stat) => (
                                            <TableRow key={stat.provider_id}>
                                                <TableCell className="font-medium">
                                                    <div>{stat.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">{stat.email}</div>
                                                </TableCell>
                                                <TableCell>{stat.phone}</TableCell>
                                                <TableCell>{stat.unique_code}</TableCell>
                                                <TableCell className="text-right font-medium">{stat.total_answers}</TableCell>
                                                <TableCell className="text-right text-green-600 font-bold">{stat.correct_answers}</TableCell>
                                                <TableCell className="text-right text-red-600 font-bold">{stat.wrong_answers}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}