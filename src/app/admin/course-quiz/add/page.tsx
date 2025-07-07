'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  fetchAllCategories,
  fetchCoursesByCategory,
  createCourseQuiz,
  CourseQuiz,
  CourseQuizQuestion,
} from '@/lib/api';
import { Plus, Trash, Save, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const CourseQuizAddForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [categoryId, setCategoryId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<CourseQuizQuestion[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await fetchAllCategories();
        setCategories(categoryData);
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load categories.',
        });
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      const loadCategoriesCourse = async () => {
        try {
          const courseData = await fetchCoursesByCategory(categoryId);
          setCourses(courseData);
        } catch (error) {
          toast({
            variant: 'error',
            title: 'Error',
            description: 'Failed to load categories.',
          });
        }
      };
      loadCategoriesCourse();
    } else {
      setCourses([]);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      fetchCoursesByCategory(categoryId).then((res) => {
        setCourses(res || []);
      });
    } else {
      setCourses([]);
    }
  }, [categoryId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        option_1: '',
        option_2: '',
        option_3: '',
        option_4: '',
        correct_answer: 'option_1',
      },
    ]);
  };

  const updateQuestion = (index: number, key: keyof CourseQuizQuestion, value: any) => {
    const updated = [...questions];
    updated[index][key] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!categoryId || !courseId || !title || questions.length === 0) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description:
          'All fields including category, course, title, and at least one question are required.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CourseQuiz = {
        category_id: categoryId,
        course_id: courseId,
        quiz_text: title,
        is_active: isActive,
        questions,
      };

      await createCourseQuiz(payload);

      toast({
        variant: 'success',
        title: 'Quiz Created',
        description: 'Your course quiz has been added successfully.',
      });
      router.push('/admin/course-quiz');
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Error',
        description: `${err}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-6">
            <CardHeader>
              <CardTitle>Create Course Quiz</CardTitle>
              <CardDescription>Select category, course, and add questions</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700">Select Category</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course */}
              <div>
                <label className="text-sm font-medium text-gray-700">Select Course</label>
                <Select value={courseId} onValueChange={setCourseId} disabled={!categoryId}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700">Quiz Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} className="bg-primary" />
                <span>Active</span>
              </div>
              {/* Questions */}
              {questions.map((q, index) => (
                <div key={index} className="p-4 border rounded-md bg-gray-50 space-y-4 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      Question {index + 1}
                    </label>
                    <Trash
                      className="w-4 h-4 text-red-500 cursor-pointer"
                      onClick={() => removeQuestion(index)}
                    />
                  </div>

                  <Input
                    placeholder="Enter question text"
                    value={q.question_text}
                    onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                    required
                  />

                  {['option_1', 'option_2', 'option_3', 'option_4'].map((optKey) => (
                    <div key={optKey} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        value={optKey}
                        checked={q.correct_answer === optKey}
                        onChange={() =>
                          updateQuestion(
                            index,
                            'correct_answer',
                            optKey as CourseQuizQuestion['correct_answer']
                          )
                        }
                      />
                      <Input
                        placeholder={`Enter ${optKey.replace('_', ' ')}`}
                        value={q[optKey as keyof CourseQuizQuestion] as string}
                        onChange={(e) =>
                          updateQuestion(index, optKey as keyof CourseQuizQuestion, e.target.value)
                        }
                        required
                      />
                    </div>
                  ))}
                </div>
              ))}

              <Button type="button" variant="secondary" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Quiz
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CourseQuizAddForm;
