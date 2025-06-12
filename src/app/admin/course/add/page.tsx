"use client";

import React, { useState, useEffect, FormEvent } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Save, Loader2, FileText, Globe2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createCourse, Course ,fetchAllCategories,Category} from "@/lib/api";
import { Switch } from "@/components/ui/switch";


const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

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

const AddCourseForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [moduleType, setModuleType] = useState<"beginner" | "advanced">("beginner");
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title || !description  || !duration || !mediaFile) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "All fields are required.",
      });
      return;
    }

    const courseData: Course = {
      title,
      description,
      category_id: selectedCategoryId,
      video_url: mediaFile,
      length_in_minutes:duration,
      module_type:moduleType,
              is_active: isActive,

    };

    try {
      setIsSubmitting(true);
      await createCourse(courseData);
      toast({
        variant: "success",
        title: "Success",
        description: "Course created successfully.",
      });
      router.push("/admin/course");
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: `${error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <form onSubmit={onSubmit} className="space-y-6">
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
              <CardDescription>Fill in the details to add a new course</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Course Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div className="space-y-2" style={{ height: "270px" }}>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-5 text-blue-500" />
                  <span>Description</span>
                </label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  modules={quillModules}
                  style={{ height: "200px" }}
                />
              </div>

              {/* Category Selector */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Globe2 className="w-4 h-4 text-blue-500" />
                  <span>Select Category</span>
                </label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={(value) => setSelectedCategoryId(value)}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) =>
                      category?.id && category?.name ? (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ) : null
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
                <Input
                  type="number"
                  value={duration ?? ""}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  placeholder="Enter duration"
                  required
                />
              </div>

              {/* <div>
                <label className="text-sm font-medium text-gray-700">Media Type</label>
                <Select
                  value={mediaType}
                  onValueChange={(value: "image" | "video") => setMediaType(value)}
                >
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Select Media Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              <div>
                <label className="text-sm font-medium text-gray-700">Media File</label>
                <Input
                  type="file"
                  accept={"video/*" }
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setMediaFile(e.target.files[0]);
                    }
                  }}
                  required
                />
              </div>

               <div className="flex items-center space-x-2">
                              <Switch checked={isActive} onCheckedChange={setIsActive} className="bg-primary" />
                              <span>Active</span>
                            </div>
              

            <div>
  <label className="text-sm font-medium text-gray-700">Module Type</label>
  <Select
    value={moduleType}
    onValueChange={(value: "beginner" | "advanced") => setModuleType(value)}
  >
    <SelectTrigger className="bg-white border-gray-200">
      <SelectValue placeholder="Select Module Type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="beginner">Beginner</SelectItem>
      <SelectItem value="advanced">Advanced</SelectItem>
    </SelectContent>
  </Select>
</div>

            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Course
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddCourseForm;
