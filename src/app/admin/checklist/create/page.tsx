'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Users, FileText, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchAllProvidersWithoutpagination,
  fetchQuestions,
  createChecklist,
  ChecklistProvider,
  Question as ApiQuestion,
  Provider as ApiProvider
} from '@/lib/api';

export default function CreateChecklist() {
  const router = useRouter();
  const [providers, setProviders] = useState<ChecklistProvider[]>([]);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchProviders, setSearchProviders] = useState('');
  const [searchQuestions, setSearchQuestions] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [checklistType, setChecklistType] = useState('both');

  useEffect(() => {
    fetchProvidersData();
    fetchQuestionsData();
  }, []);

  const fetchProvidersData = async () => {
    try {
      const providersData = await fetchAllProvidersWithoutpagination();
      console.log('🔍 Providers data received:', providersData);
      console.log('🔍 Number of providers:', providersData.length);
      console.log('🔍 First provider:', providersData[0]);

      // Transform Provider to ChecklistProvider format
      const checklistProviders: ChecklistProvider[] = providersData.map(provider => ({
        id: provider.id || '',
        company_name: provider.company_name || '',
        phone: provider.phone,
        email: provider.email,
        first_name: provider.first_name,
        last_name: provider.last_name,
      }));
      setProviders(checklistProviders);
      console.log('🔍 Transformed providers:', checklistProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchQuestionsData = async () => {
    try {
      const questionsData = await fetchQuestions(1, 100);
      setQuestions(questionsData.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProviders.length === 0) {
      alert('Please select at least one provider');
      return;
    }

    if (selectedQuestions.length === 0) {
      alert('Please select at least one question');
      return;
    }

    setLoading(true);

    try {
      await createChecklist({
        checklist_type: checklistType,
        user_ids: selectedProviders,
        questions_id: selectedQuestions,
      });

      router.push('/admin/checklist');
    } catch (error: any) {
      console.error('Error creating checklist:', error);
      alert(error.message || 'Error creating checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredProviders = providers.filter(provider =>
    provider.company_name?.toLowerCase().includes(searchProviders.toLowerCase()) ||
    provider.phone?.toLowerCase().includes(searchProviders.toLowerCase()) ||
    `${provider.first_name} ${provider.last_name}`.toLowerCase().includes(searchProviders.toLowerCase())
  );

  const filteredQuestions = questions.filter(question =>
    question.question_text.toLowerCase().includes(searchQuestions.toLowerCase()) ||
    question.category.name.toLowerCase().includes(searchQuestions.toLowerCase())
  );

  const groupedQuestions = filteredQuestions.reduce((acc, question) => {
    const categoryName = question.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(question);
    return acc;
  }, {} as Record<string, ApiQuestion[]>);

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
            <h1 className="text-3xl font-bold text-gray-900">Create Checklist</h1>
            <p className="text-gray-600 mt-1">Assign checklist questions to providers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Checklist Type */}
          <Card>
            <CardHeader>
              <CardTitle>Checklist Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="checklist_type">Checklist Type</Label>
                <select
                  id="checklist_type"
                  value={checklistType}
                  onChange={(e) => setChecklistType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pre">Pre-Service</option>
                  <option value="post">Post-Service</option>
                  <option value="both">Both Pre & Post Service</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Provider Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Select Providers ({selectedProviders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search providers..."
                      value={searchProviders}
                      onChange={(e) => setSearchProviders(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredProviders.map((provider) => (
                      <div key={provider.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          checked={selectedProviders.includes(provider.id)}
                          onCheckedChange={() => handleProviderToggle(provider.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{provider.company_name}</p>
                          <p className="text-sm text-gray-500">{`${provider.first_name} ${provider.last_name}`.trim()}</p>
                          <p className="text-xs text-gray-400">{provider.phone} • {provider.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredProviders.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No providers found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Select Questions ({selectedQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search questions..."
                      value={searchQuestions}
                      onChange={(e) => setSearchQuestions(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {Object.entries(groupedQuestions).map(([categoryName, categoryQuestions]) => (
                      <div key={categoryName} className="space-y-2">
                        <h4 className="font-medium text-gray-900 text-sm border-b pb-1">
                          {categoryName}
                        </h4>
                        {categoryQuestions.map((question) => (
                          <div key={question.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={() => handleQuestionToggle(question.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{question.question_text}</p>
                              <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {question.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  {Object.keys(groupedQuestions).length === 0 && (
                    <p className="text-center text-gray-500 py-4">No questions found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>Selected: {selectedProviders.length} providers, {selectedQuestions.length} questions</p>
                  <p>This will create {selectedProviders.length} checklist(s) with {selectedQuestions.length} questions each.</p>
                </div>
                <div className="flex space-x-4">
                  <Link href="/admin/checklist">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading || selectedProviders.length === 0 || selectedQuestions.length === 0}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Checklist
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
