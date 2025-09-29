'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createQuestion, fetchChecklistCategories } from '@/lib/api';

interface Category {
  id: string;
  name: string;
}

export default function AddQuestion() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    question_text: '',
    type: 'both' as 'pre' | 'post' | 'both'
  });

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const fetchCategoriesData = async () => {
    try {
      const categoriesData = await fetchChecklistCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id || !formData.question_text.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await createQuestion({
        question_text: formData.question_text,
        category_id: formData.category_id,
        type: formData.type as 'pre' | 'post' | 'both',
      });

      router.push('/admin/checklist/questions');
    } catch (error: any) {
      console.error('Error creating question:', error);
      alert(error.message || 'Error creating question');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/admin/checklist/questions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Question</h1>
            <p className="text-gray-600 mt-1">Create a new checklist question</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category_id">Category *</Label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="question_text">Question Text *</Label>
                <Textarea
                  id="question_text"
                  name="question_text"
                  value={formData.question_text}
                  onChange={handleInputChange}
                  placeholder="Enter the question text..."
                  required
                  rows={4}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  Write a clear and specific question that providers can answer with yes/no/na.
                </p>
              </div>

              {/* Question Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Question Type *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pre">Pre-Service</option>
                  <option value="post">Post-Service</option>
                  <option value="both">Both Pre & Post Service</option>
                </select>
                <div className="text-sm text-gray-500">
                  <p><strong>Pre-Service:</strong> Questions asked before service delivery</p>
                  <p><strong>Post-Service:</strong> Questions asked after service completion</p>
                  <p><strong>Both:</strong> Questions applicable to both pre and post service</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link href="/admin/checklist/questions">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Question
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tips for Writing Good Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900">Be Specific</h4>
                <p>Write clear, specific questions that can be answered definitively.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Use Simple Language</h4>
                <p>Avoid technical jargon and use language that all providers can understand.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Focus on Actions</h4>
                <p>Ask about specific actions or conditions that can be verified.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Examples</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>"Did you verify the customer's identity before starting the service?"</li>
                  <li>"Were all safety equipment properly worn during the service?"</li>
                  <li>"Did you clean up the work area after completing the service?"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
