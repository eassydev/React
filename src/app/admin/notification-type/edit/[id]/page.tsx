"use client";

import React, { useState, useEffect, FormEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { getNotificationById, updateNotificationType, NotificationType } from "@/lib/api";

// Dynamically import React-Quill for client-side rendering
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

const EditNotificationTypeForm: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<"timer" | "image" | "carousel" | "normal" | "sound">("normal");
  const [image_url, setImageUrl] = useState<File | string | null>(null);
  const [sound_url, setSoundUrl] = useState<File | string | null>(null);
  const [carousel_images, setCarouselImages] = useState<(File | { image_url: string })[]>([]);
  const [carouselPreviews, setCarouselPreviews] = useState<string[]>([]);
  const [timer_duration, setTimerDuration] = useState<number | null>(null);
   const [action_type, setActionType] = useState<"internal_link" | "external_link" | "order_related" | "promo">("internal_link");
 
  const [action_data, setActionData] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Extract NotificationType ID from URL
  const notificationTypeId = pathname?.split("/").pop();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (notificationTypeId) {
          const notificationType = await getNotificationById(notificationTypeId);

          setTitle(notificationType.title);
          setMessage(notificationType.message);
          setType(notificationType.type);
          setImageUrl(notificationType.image_url || null);
          setSoundUrl(notificationType.sound_url || null);
          setCarouselImages(notificationType.carousel_data || []);
          setCarouselPreviews(
            notificationType.carousel_data?.map((item) =>
              typeof item === "object" && "image_url" in item ? item.image_url : ""
            ) || []
          );
          console.log(notificationType.carousel_data,"carouselPreviews")
          setTimerDuration(notificationType.timer_duration || null);
          setActionType(notificationType.action_type || null);
          setActionData(notificationType.action_data || null);
          setIsActive(notificationType.isActive);
        }
      } catch (error: any) {
        toast({
          variant: "error",
          title: "Error",
          description: error.message || "Failed to fetch notification type details.",
        });
      }
    };

    fetchData();
  }, [notificationTypeId, toast]);

  // Handle file input changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageUrl(e.target.files[0]);
    }
  };

  const handleSoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSoundUrl(e.target.files[0]);
    }
  };

  const handleCarouselImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setCarouselImages(files);
      setCarouselPreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title || !message) {
      toast({
        variant: "error",
        title: "Validation Error",
        description: "Title and message are required.",
      });
      setIsSubmitting(false);
      return;
    }

    // Construct updated NotificationType object
    const updatedNotification: NotificationType = {
      title,
      message,
      type,
      image_url,
      sound_url,
      carousel_data:carousel_images,
      timer_duration: timer_duration || null,
      action_type,
      action_data,
      isActive,
    };

    try {
      await updateNotificationType(notificationTypeId as string, updatedNotification);

      toast({
        variant: "success",
        title: "Success",
        description: "Notification updated successfully!",
      });

      router.push("/admin/notification-type");
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error",
        description: error.message || "Failed to update notification.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
        <p className="text-gray-500">Edit notification type details</p>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Edit Notification Type</CardTitle>
            <CardDescription>Update the details below to edit the notification type entry.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Title Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title"
                  required
                />
              </div>

              {/* Message Field (React Quill) */}
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <ReactQuill
                  value={message}
                  onChange={setMessage}
                  theme="snow"
                  modules={quillModules}
                  placeholder="Enter notification message"
                />
              </div>

              {/* Type Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType["type"])}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="timer">Timer</option>
                  <option value="image">Image</option>
                  <option value="carousel">Carousel</option>
                  <option value="normal">Normal</option>
                  <option value="sound">Sound</option>
                </select>
              </div>

              {/* Timer Duration */}
              {type === "timer" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Timer Duration (in seconds)</label>
                  <Input
                    type="number"
                    value={timer_duration || ""}
                    onChange={(e) => setTimerDuration(Number(e.target.value))}
                    placeholder="Enter timer duration"
                  />
                </div>
              )}

              {/* Image Upload */}
              {type === "image" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Image</label>
                  <Input type="file" accept="image/*" onChange={handleImageChange} />
                  {typeof image_url === "string" && <img src={image_url} alt="Preview" className="mt-2 max-h-32 rounded-md" />}
                </div>
              )}

              {/* Sound Upload */}
              {type === "sound" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Sound</label>
                  <Input type="file" accept="audio/*" onChange={handleSoundChange} />
                  {typeof sound_url === "string" && <audio controls src={sound_url} className="mt-2 w-full" />}
                </div>
              )}

              {/* Carousel Images */}
              {type === "carousel" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Carousel Images</label>
                  <Input type="file" accept="image/*" multiple onChange={handleCarouselImagesChange} />
                  <div className="mt-2 flex gap-2">
                    {carouselPreviews.map((preview, index) => (
                      <img key={index} src={preview} alt={`Carousel ${index}`} className="max-h-32 rounded-md" />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Type */}
              <div>
                <label className="text-sm font-medium text-gray-700">Action Type</label>
                <select
                  value={action_type || ""}
                  onChange={(e) => setActionType(e.target.value as NotificationType["action_type"])}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">None</option>
                  <option value="internal_link">Internal Link</option>
                  <option value="external_link">External Link</option>
                  <option value="order_related">Order Related</option>
                  <option value="promo">Promotions</option>
                </select>
              </div>

              {/* Action Data */}
              {action_type && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Action Data</label>
                  <Input
                    value={action_data || ""}
                    onChange={(e) => setActionData(e.target.value)}
                    placeholder="Enter action URL or data"
                  />
                </div>
              )}

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-700">Active</span>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditNotificationTypeForm;
