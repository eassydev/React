'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { getCategoryPackageById } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface CategoryPackage {
  id: string;
  name: string;
  description?: string;
  image?: string;
  package_type: 'regular' | 'amc';
  is_active: number;
  packages_count?: number;
  created_at?: number;
  updated_at?: number;
}

const ViewCategoryPackage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [categoryPackage, setCategoryPackage] = useState<CategoryPackage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      fetchCategoryPackage();
    }
  }, [id]);

  const fetchCategoryPackage = async () => {
    setLoading(true);
    try {
      const data = await getCategoryPackageById(id);
      setCategoryPackage(data);
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to fetch category package',
      });
      router.push('/admin/category-package');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  if (!categoryPackage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">View Category Package</h1>
          </div>
          <Link href={`/admin/category-package/${id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-xl text-gray-800">Category Package Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Image */}
            {categoryPackage.image && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Image</label>
                <div>
                  <img
                    src={categoryPackage.image}
                    alt={categoryPackage.name}
                    className="w-48 h-48 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-lg text-gray-900">{categoryPackage.name}</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="text-gray-900">{categoryPackage.description || 'No description'}</p>
            </div>

            {/* Package Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Package Type</label>
              <div>
                <span className={`px-3 py-1 rounded text-sm ${
                  categoryPackage.package_type === 'amc' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {categoryPackage.package_type.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div>
                <span className={`px-3 py-1 rounded text-sm ${
                  categoryPackage.is_active === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {categoryPackage.is_active === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Package Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Number of Packages</label>
              <p className="text-lg font-semibold text-gray-900">{categoryPackage.packages_count || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewCategoryPackage;

