'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { updateQuestion, fetchChecklistCategories, fetchQuestionById } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  service_type?: string;
}

interface Question {
  id: string;
  question_text: string;
  type: 'pre' | 'post' | 'both';
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
}

const EditQuestionPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    type: 'both' as 'pre' | 'post' | 'both',
    category_id: '',
  });

  useEffect(() => {
    fetchCategoriesData();
    if (params.id) {
      fetchQuestionData();
    }
  }, [params.id]);

  const fetchCategoriesData = async () => {
    try {
      const categoriesData = await fetchChecklistCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
        variant: 'destructive',
      });
    }
  };

  const fetchQuestionData = async () => {
    try {
      const questionData = await fetchQuestionById(params.id as string);
      setFormData({
        question_text: questionData.question_text,
        type: questionData.type,
        category_id: questionData.category?.id || '',
      });
    } catch (error) {
      console.error('Error fetching question:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch question details',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question_text.trim()) {
      toast({
        title: 'Error',
        description: 'Question text is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: 'Error',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await updateQuestion(params.id as string, formData);
      
      toast({
        title: 'Success',
        description: 'Question updated successfully',
      });
      
      router.push('/admin/checklist/questions');
    } catch (error: any) {
      console.error('Error updating question:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update question',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/checklist/questions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Questions
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Question</h1>
          <p className="text-gray-600">Update the question details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text *</Label>
              <Textarea
                id="question_text"
                placeholder="Enter the question text..."
                value={formData.question_text}
                onChange={(e) => handleInputChange('question_text', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange('category_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Question Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'pre' | 'post' | 'both') => handleInputChange('type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre">Pre-Service</SelectItem>
                  <SelectItem value="post">Post-Service</SelectItem>
                  <SelectItem value="both">Both (Pre & Post)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Updating...' : 'Update Question'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/checklist/questions')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditQuestionPage;
