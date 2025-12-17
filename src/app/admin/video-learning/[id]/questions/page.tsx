'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save, Loader2, ArrowLeft, Check, X } from 'lucide-react';
import {
  fetchLearningVideoById,
  fetchVideoQuestions,
  fetchQuestionAnswers,
  createVideoQuestion,
  createVideoAnswer,
  deleteVideoQuestion,
  deleteVideoAnswer,
  VideoQuestion,
  VideoAnswer,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

interface QuestionWithAnswers extends VideoQuestion {
  answers?: VideoAnswer[];
}

interface VideoData {
  id: number;
  title: string;
  questions?: QuestionWithAnswers[];
}

const VideoQuestionsPage: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  
  const videoId = (pathname.split('/')[3]);

  
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState<number | null>(null);

  // New question form
  const [newQuestion, setNewQuestion] = useState({ question_text: '', is_active: true });
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);

  // New answer forms (keyed by question_id)
  const [newAnswers, setNewAnswers] = useState<Record<number, { answer_text: string; is_correct: boolean; is_active: boolean }>>({});
  const [showNewAnswerForm, setShowNewAnswerForm] = useState<number | null>(null);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      // Fetch video details
      const videoResponse = await fetchLearningVideoById(videoId);
      const videoData = videoResponse.data;

      

      // Fetch questions for this video
      try {
        // const questionsResponse = await fetchVideoQuestions(videoId);
        // const questions = questionsResponse.data || [];

        // Fetch answers for each question
        const questionsWithAnswers = await Promise.all(
          videoData?.map(async (question: VideoQuestion) => {
            try {
              const answersResponse = await fetchQuestionAnswers(question.id!);
              return { ...question, answers: answersResponse.data || [] };
            } catch {
              return { ...question, answers: [] };
            }
          })
        );
        console.log(questionsWithAnswers,"pavan")

        setVideo({ ...videoData, questions: questionsWithAnswers });
      } catch {
        // If questions endpoint fails, video might have questions property already
        setVideo(videoData);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch video data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) fetchVideoData();
  }, [videoId]);

  const handleAddQuestion = async () => {
    if (!newQuestion.question_text.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Question text is required' });
      return;
    }
    setSavingQuestion(true);
    try {
      await createVideoQuestion({
        video_id: videoId,
        question_text: newQuestion.question_text,
        is_active: newQuestion.is_active,
      });
      toast({ variant: 'success', title: 'Success', description: 'Question added successfully' });
      setNewQuestion({ question_text: '', is_active: true });
      setShowNewQuestionForm(false);
      fetchVideoData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleAddAnswer = async (questionId: number) => {
    const answerData = newAnswers[questionId];
    if (!answerData?.answer_text.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Answer text is required' });
      return;
    }
    setSavingAnswer(questionId);
    try {
      await createVideoAnswer({
        video_question_id: questionId,
        answer_text: answerData.answer_text,
        is_correct: answerData.is_correct,
        is_active: answerData.is_active,
      });
      toast({ variant: 'success', title: 'Success', description: 'Answer added successfully' });
      setNewAnswers((prev) => ({ ...prev, [questionId]: { answer_text: '', is_correct: false, is_active: true } }));
      setShowNewAnswerForm(null);
      fetchVideoData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setSavingAnswer(null);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deleteVideoQuestion(questionId);
      toast({ variant: 'success', title: 'Success', description: 'Question deleted' });
      fetchVideoData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteAnswer = async (answerId: number) => {
    try {
      await deleteVideoAnswer(answerId);
      toast({ variant: 'success', title: 'Success', description: 'Answer deleted' });
      fetchVideoData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/video-learning">
              <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Questions</h1>
              <p className="text-gray-600">Video: {video?.title}</p>
            </div>
          </div>
          <Button onClick={() => setShowNewQuestionForm(true)} disabled={showNewQuestionForm}>
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
        </div>

        {/* New Question Form */}
        {showNewQuestionForm && (
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6 space-y-4">
              <Input
                placeholder="Enter question text..."
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Active:</span>
                  <Switch checked={newQuestion.is_active} onCheckedChange={(c) => setNewQuestion({ ...newQuestion, is_active: c })} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowNewQuestionForm(false)}>Cancel</Button>
                  <Button onClick={handleAddQuestion} disabled={savingQuestion}>
                    {savingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Question
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        {video?.questions?.map((question, qIndex) => (
          <Card key={question.id} className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">Q{qIndex + 1}: {question.question_text}</CardTitle>
                <CardDescription>
                  {question.is_active ? <span className="text-green-600">Active</span> : <span className="text-red-600">Inactive</span>}
                </CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><h2 className="text-xl font-bold">Delete Question?</h2></AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button variant="destructive" onClick={() => handleDeleteQuestion(question.id!)}>Yes, Delete</Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Answers */}
              {question.answers?.map((answer) => (
                <div key={answer.id} className={`flex items-center justify-between p-3 rounded-lg ${answer.is_correct ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    {answer.is_correct ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-gray-400" />}
                    <span>{answer.answer_text}</span>
                    {!answer.is_active && <span className="text-xs text-red-500">(Inactive)</span>}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm"><Trash2 className="w-3 h-3 text-red-600" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><h2 className="font-bold">Delete Answer?</h2></AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button variant="destructive" onClick={() => handleDeleteAnswer(answer.id!)}>Yes</Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}

              {/* Add Answer Form */}
              {showNewAnswerForm === question.id ? (
                <div className="p-3 bg-blue-50 rounded-lg space-y-3">
                  <Input
                    placeholder="Enter answer text..."
                    value={newAnswers[question.id!]?.answer_text || ''}
                    onChange={(e) => setNewAnswers((prev) => ({
                      ...prev,
                      [question.id!]: { ...prev[question.id!], answer_text: e.target.value }
                    }))}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <Switch
                          checked={newAnswers[question.id!]?.is_correct || false}
                          onCheckedChange={(c) => setNewAnswers((prev) => ({
                            ...prev,
                            [question.id!]: { ...prev[question.id!], is_correct: c }
                          }))}
                        />
                        Correct Answer
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Switch
                          checked={newAnswers[question.id!]?.is_active ?? true}
                          onCheckedChange={(c) => setNewAnswers((prev) => ({
                            ...prev,
                            [question.id!]: { ...prev[question.id!], is_active: c }
                          }))}
                        />
                        Active
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowNewAnswerForm(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => handleAddAnswer(question.id!)} disabled={savingAnswer === question.id}>
                        {savingAnswer === question.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewAnswers((prev) => ({ ...prev, [question.id!]: { answer_text: '', is_correct: false, is_active: true } }));
                    setShowNewAnswerForm(question.id!);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Answer
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {(!video?.questions || video.questions.length === 0) && !showNewQuestionForm && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-gray-500">
              No questions yet. Click "Add Question" to create one.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VideoQuestionsPage;

