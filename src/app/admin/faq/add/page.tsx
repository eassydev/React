"use client";

import React, { useState, FormEvent } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, FileText } from "lucide-react";
import { createFAQ, FAQ } from "@/lib/api"; // Import the API function and FAQ interface

// Import React-Quill dynamically for client-side rendering
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

// Quill modules configuration
const quillModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const AddFAQForm: React.FC = () => {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();

  // Handle form submission
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!question || !answer) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "All fields are required.",
      });
      setIsSubmitting(false);
      return;
    }

    // Construct the FAQ object
    const newFAQ: FAQ = {
      question,
      answer,
      status: isActive ? "active" : "inactive",
    };

    try {
      await createFAQ(newFAQ); // Submit the FAQ object to the API
      toast({
        variant: "success",
        title: "Success",
        description: "FAQ created successfully.",
      });

      // Reset form fields after successful submission
      setQuestion("");
      setAnswer("");
      setIsActive(true);
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to create FAQ.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">FAQs Management</h1>
          <p className="text-gray-500">Create FAQ</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New FAQ</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new FAQ
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Question Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Question</label>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter FAQ question"
                  required
                />
              </div>

              {/* Answer Field with React-Quill */}
              <div className="space-y-2" style={{ height: "270px" }}>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-5 text-blue-500" />
                  <span>Answer</span>
                </label>
                <ReactQuill
                  value={answer}
                  onChange={setAnswer}
                  theme="snow"
                  modules={quillModules}
                  style={{ height: "200px" }}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} className="bg-primary" />
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 mt-6">
            <div className="flex space-x-3 pt-6">
              <Button className="w-100 flex-1 h-11 bg-primary" disabled={isSubmitting} onClick={onSubmit}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save FAQ</span>
                  </div>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AddFAQForm;
