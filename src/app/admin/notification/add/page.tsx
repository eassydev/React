"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ReactSelect from "react-select";
import {
  createNotification,
  fetchAllCategories,
  fetchSubCategoriesByCategoryId,
  fetchAllProvidersWithoupagination,
  fetchAllUsersWithouPagination,
  getAllNotifications,
  Notification,
} from "@/lib/api";

const AddNotificationForm: React.FC = () => {
  const [notification, setNotification] = useState<Notification>({
    title: "",
    message: "",
    redirect_screen: "",
    type: "customer",
    is_active: true,
    send_to_all: true,
    category_id: undefined,
    subcategory_id: undefined,
    notification_type_id: undefined,
    recipients: [],
    inner_image: null,
    outer_image: null,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [notificationTypes, setNotificationTypes] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch Notification Types
  useEffect(() => {
    const loadNotificationTypes = async () => {
      try {
        const data = await getAllNotifications();
        setNotificationTypes(data || []);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load notification types." });
      }
    };
    loadNotificationTypes();
  }, [toast]);

  // Fetch Categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchAllCategories();
        setCategories(data || []);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load categories." });
      }
    };
    loadCategories();
  }, [toast]);

  // Fetch Subcategories on Category Change
  useEffect(() => {
    if (notification.category_id) {
      const loadSubcategories = async () => {
        try {
          const data = await fetchSubCategoriesByCategoryId(notification.category_id!);
          setSubcategories(data || []);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load subcategories." });
        }
      };
      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [notification.category_id, toast]);

  // Fetch Recipients
  useEffect(() => {
    const loadRecipients = async () => {
      if (!notification.send_to_all) {
        try {
          let data: any[] = [];
          if (notification.type === "provider") {
            data = await fetchAllProvidersWithoupagination();
          } else if (notification.type === "customer") {
            data = await fetchAllUsersWithouPagination();
          }
          setRecipients(data || []);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load recipients." });
        }
      } else {
        setRecipients([]);
      }
    };
    loadRecipients();
  }, [notification.type, notification.send_to_all, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotification({ ...notification, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setNotification({ ...notification, [e.target.name]: file });
  };

  const handleMultiSelect = (selectedOptions: any) => {
    const selectedRecipients = selectedOptions.map((option: any) => ({
      id: option.value,
      name: option.label,
    }));
    setNotification({ ...notification, recipients: selectedRecipients });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createNotification(notification);
      toast({
        variant: "success",
        title: "Success",
        description: "Notification created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create notification.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Add Notification</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <Input
                name="title"
                placeholder="Title"
                value={notification.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Message</label>
              <Input
                name="message"
                placeholder="Message"
                value={notification.message}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Redirect Screen</label>
              <Input
                name="redirect_screen"
                placeholder="Redirect Screen"
                value={notification.redirect_screen}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Notification Type</label>
              <Select
                onValueChange={(value) =>
                  setNotification({ ...notification, notification_type_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Notification Type" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Category</label>
              <Select
                onValueChange={(value) =>
                  setNotification({ ...notification, category_id: value, subcategory_id: undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {notification.category_id && (
              <div>
                <label className="block text-sm font-medium">Subcategory</label>
                <Select
                  onValueChange={(value) =>
                    setNotification({ ...notification, subcategory_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Type</label>
              <Select
                value={notification.type}
                onValueChange={(value) =>
                  setNotification({ ...notification, type: value as "customer" | "provider" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Notification Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium">Send to All</label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={notification.send_to_all}
                  onCheckedChange={(checked) =>
                    setNotification({ ...notification, send_to_all: checked })
                  }
                />
                <span>Send to All</span>
              </div>
            </div>

            {!notification.send_to_all && recipients.length > 0 && (
              <div>
                <label className="block text-sm font-medium">Recipients</label>
                <ReactSelect
                  isMulti
                  options={recipients.map((recipient) => ({
                    value: recipient.id,
                    label: recipient.first_name,
                  }))}
                  onChange={handleMultiSelect}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Inner Image</label>
              <Input type="file" name="inner_image" onChange={handleFileChange} />
            </div>

            <div>
              <label className="block text-sm font-medium">Outer Image</label>
              <Input type="file" name="outer_image" onChange={handleFileChange} />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create Notification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNotificationForm;
