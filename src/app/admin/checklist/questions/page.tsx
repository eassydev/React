'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  FileText,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import {
  fetchQuestions,
  deleteQuestion,
  fetchChecklistCategories,
  Question
} from '@/lib/api';

// Using Question interface from api.tsx

export default function QuestionsManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategoriesData();
    fetchQuestionsData();
  }, [currentPage, searchTerm, filterCategory, filterType]);

  const fetchCategoriesData = async () => {
    try {
      const categoriesData = await fetchChecklistCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchQuestionsData = async () => {
    try {
      setLoading(true);

      const questionsData = await fetchQuestions(
        currentPage,
        10,
        filterCategory || undefined,
        filterType || undefined,
        searchTerm || undefined
      );

      setQuestions(questionsData.questions);
      setTotalPages(questionsData.totalPages);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await deleteQuestion(questionId);
      fetchQuestionsData(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting question:', error);
      alert(error.message || 'Error deleting question');
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      pre: 'bg-blue-100 text-blue-800',
      post: 'bg-green-100 text-green-800',
      both: 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/admin/checklist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Checklists
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Questions Management</h1>
              <p className="text-gray-600 mt-1">Manage checklist questions and categories</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href="/admin/checklist/questions/bulk">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </Link>
            <Link href="/admin/checklist/questions/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="pre">Pre-Service</option>
                  <option value="post">Post-Service</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No questions found</p>
                <Link href="/admin/checklist/questions/add">
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Question
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Question</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((question) => (
                      <tr key={question.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 max-w-md">
                            {question.question_text}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{question.category?.name || 'Uncategorized'}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {getTypeBadge(question.type)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(question.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Link href={`/admin/checklist/questions/edit/${question.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
