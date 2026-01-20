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
import { Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { 
    getAllVideoCategories, 
    getAllVideosViaCategory, 
    getProviderAnsweredDetailStats,
    downloadProviderStats,
    exportProviderStats
} from '@/lib/api';
import Image from 'next/image';

// --- Interfaces based on User Request ---

interface CategoryData {
    category_id: string;
    category: {
        id: string;
        image: string;
        name: string;
        slug: string;
    };
}

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
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [videos, setVideos] = useState<ItemData[]>([]);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [providerStats, setProviderStats] = useState<ProviderStat[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [downloading, setDownloading] = useState(false); // For specific video
    const [globalDownloading, setGlobalDownloading] = useState(false); // For global stats

    // --- Effects ---

    useEffect(() => {
        fetchCategories();
    }, []);

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


    // --- API Handlers ---

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const data = await getAllVideoCategories();
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

    // --- Handlers ---

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setSelectedVideoId(null); // Reset selection
        setProviderStats([]);
    };

    const handleVideoClick = (videoId: string) => {
        setSelectedVideoId(videoId);
    };

    const handleBackToCategories = () => {
        setSelectedCategoryId(null);
        setSelectedVideoId(null);
        setProviderStats([]);
    };

    const handleBackToVideos = () => {
        setSelectedVideoId(null);
        setProviderStats([]);
    };

    const handleDownload = async () => {
        if (!selectedVideoId) return;
        setDownloading(true);
        try {
            await downloadProviderStats(selectedVideoId, searchQuery);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloading(false);
        }
    };

    const handleGlobalDownload = async () => {
        setGlobalDownloading(true);
        try {
            await exportProviderStats();
        } catch (error) {
            console.error('Global download failed:', error);
        } finally {
            setGlobalDownloading(false);
        }
    };

    // --- Render ---

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Video Learning Statistics</h1>
                <Button onClick={handleGlobalDownload} disabled={globalDownloading}>
                    {globalDownloading ? 'Downloading...' : 'Download Global Stats'}
                </Button>
            </div>

            {/* View: Categories List */}
            {!selectedCategoryId && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loadingCategories ? (
                        <p>Loading categories...</p>
                    ) : (
                        categories.map((item) => (
                            <Card 
                                key={item.category_id} 
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleCategoryClick(item.category.id)}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {item.category.name}
                                    </CardTitle>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                 
                                    <div className="text-xs text-muted-foreground">{item.category.slug}</div>
                                    {/* Display image if needed */}
                                      <div className="relative w-48 h-28 overflow-hidden rounded-lg ">
                                        <Image src={item.category.image} alt={item.category.name} fill className="object-contain" sizes="192px" />
                                      </div>

                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* View: Videos List */}
            {selectedCategoryId && !selectedVideoId && (
                <Card>
                    <CardHeader className="flex flex-row items-center space-x-4">
                        <Button variant="outline" size="icon" onClick={handleBackToCategories}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <CardTitle>Select Video</CardTitle>
                            <p className="text-sm text-muted-foreground">Category ID: {selectedCategoryId}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingVideos ? (
                            <p>Loading videos...</p>
                        ) : videos.length === 0 ? (
                             <p>No videos found for this category.</p>
                        ) : (
                            <div className="grid gap-4">
                                {videos.map((video) => (
                                    <div 
                                        key={video.id} 
                                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-slate-50"
                                        onClick={() => handleVideoClick(video.id)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-10 bg-slate-200 rounded overflow-hidden">
                                                 <video src={video.video_url} className="w-full h-full object-cover" /> 
                                            </div>
                                            <div>
                                                <p className="font-medium">{video.title}</p>
                                                <p className="text-xs text-muted-foreground">{video.provider_type} | Seq: {video.sequence_number}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* View: Provider Stats */}
            {selectedVideoId && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                         <div className="flex items-center space-x-4">
                            <Button variant="outline" size="icon" onClick={handleBackToVideos}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <CardTitle>Provider Statistics</CardTitle>
                                <p className="text-sm text-muted-foreground">Video ID: {selectedVideoId}</p>
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
                                {downloading ? 'Download' : 'Download'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         {loadingStats ? (
                            <p>Loading stats...</p>
                        ) : providerStats.length === 0 ? (
                             <p>No statistics found.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Provider Name</TableHead>
                                        <TableHead>Phone</TableHead>
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
                                            <TableCell className="text-right">{stat.total_answers}</TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">{stat.correct_answers}</TableCell>
                                            <TableCell className="text-right text-red-600 font-medium">{stat.wrong_answers}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}