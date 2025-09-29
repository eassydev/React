'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchChecklistById, type ChecklistDetail as ApiChecklistDetail } from '@/lib/api';

interface ChecklistQuestion {
  id: string;
  question_id: string;
  question_text: string;
  question_type: string;
  answer: 'yes' | 'no' | 'na' | 'pending';
  remarks?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  category_id: string;
  category_name: string;
  questions: ChecklistQuestion[];
}

interface Provider {
  id: string;
  company_name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface ChecklistStats {
  totalQuestions: number;
  answeredQuestions: number;
  pendingQuestions: number;
  completionPercentage: number;
  isCompleted: boolean;
  categoriesCount: number;
}

interface ChecklistDetail {
  id: string;
  checklist_type: string;
  created_at: string;
  updated_at: string;
  provider: Provider;
  categories: Record<string, Category>;
  stats: ChecklistStats;
}

export default function ChecklistDetail() {
  const params = useParams();
  const checklistId = params.id as string;
  const [checklist, setChecklist] = useState<ApiChecklistDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checklistId) {
      fetchChecklist();
    }
  }, [checklistId]);

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const data = await fetchChecklistById(checklistId);

      // Transform the data to group questions by category
      const transformedData = {
        ...data,
        categories: {}
      };

      // Group questions by category
      if (data.checklistQuestions && Array.isArray(data.checklistQuestions)) {
        const categoriesMap: Record<string, Category> = {};

        data.checklistQuestions.forEach((cq: any) => {
          const categoryName = cq.question?.category?.name || 'Uncategorized';
          const categoryId = cq.question?.category?.id || 'uncategorized';

          if (!categoriesMap[categoryName]) {
            categoriesMap[categoryName] = {
              category_id: categoryId,
              category_name: categoryName,
              questions: []
            };
          }

          categoriesMap[categoryName].questions.push({
            id: cq.id,
            question_id: cq.question?.id || '',
            question_text: cq.question?.question_text || '',
            question_type: cq.question?.type || '',
            answer: cq.answer || 'pending',
            remarks: cq.remarks || '',
            created_at: cq.created_at || '',
            updated_at: cq.updated_at || ''
          });
        });

        transformedData.categories = categoriesMap;

        // Add categories count to stats
        if (transformedData.stats) {
          transformedData.stats.categoriesCount = Object.keys(categoriesMap).length;
        }
      }

      setChecklist(transformedData);
    } catch (error) {
      console.error('Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnswerBadge = (answer: string) => {
    switch (answer) {
      case 'yes':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Yes</Badge>;
      case 'no':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />No</Badge>;
      case 'na':
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />N/A</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Checklist Not Found</h2>
            <p className="text-gray-600 mb-6">The checklist you're looking for doesn't exist or has been removed.</p>
            <Link href="/admin/checklist">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Checklists
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/admin/checklist">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Checklists
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checklist Details</h1>
            <p className="text-gray-600 mt-1">View checklist responses and completion status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider Info & Stats */}
          <div className="space-y-6">
            {/* Provider Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Provider Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{checklist.provider.company_name}</h3>
                  <p className="text-gray-600">{checklist.provider.first_name} {checklist.provider.last_name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {checklist.provider.email}
                  </div>
                  {checklist.provider.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {checklist.provider.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Checklist Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {checklist.stats.completionPercentage}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${checklist.stats.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{checklist.stats.answeredQuestions}</div>
                    <div className="text-sm text-gray-600">Answered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{checklist.stats.pendingQuestions}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline">{checklist.checklist_type}</Badge>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{formatDate(checklist.created_at)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Categories:</span>
                    <span className="text-gray-900">{checklist.stats.categoriesCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions by Category */}
          <div className="lg:col-span-2 space-y-6">
            {checklist.categories && Object.keys(checklist.categories).length > 0 ? (
              Object.entries(checklist.categories).map(([categoryName, category]) => (
              <Card key={categoryName}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{categoryName}</span>
                    <Badge variant="outline">{category.questions.length} questions</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.questions.map((question) => (
                      <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <p className="font-medium text-gray-900 flex-1 mr-4">
                            {question.question_text}
                          </p>
                          {getAnswerBadge(question.answer)}
                        </div>
                        
                        {question.remarks && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Remarks:</strong> {question.remarks}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                          <span>Type: {question.question_type}</span>
                          {question.answer !== 'pending' && (
                            <span>Answered: {formatDate(question.updated_at)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No questions found for this checklist.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
