"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { 
  fetchWolooAttributeById,
  fetchWolooAttributeOptions,
  createWolooAttributeOption,
  updateWolooAttributeOption,
  deleteWolooAttributeOption,
  WolooAttribute,
  WolooAttributeOption
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import Link from "next/link";
import { AlertDialog, AlertDialogTrigger, AlertDialogTitle, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface EditingOption {
  id?: string;
  name: string;
  price_modifier?: number;
  weight?: number;
  active: boolean;
  isNew?: boolean;
}

const ManageAttributeOptions = () => {
  const router = useRouter();
  const params = useParams();
  const attributeId = params.id as string;
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [attribute, setAttribute] = useState<WolooAttribute | null>(null);
  const [options, setOptions] = useState<WolooAttributeOption[]>([]);
  const [editingOption, setEditingOption] = useState<EditingOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch attribute details and options
      const [attributeResponse, optionsResponse] = await Promise.all([
        fetchWolooAttributeById(attributeId),
        fetchWolooAttributeOptions(attributeId)
      ]);
      
      setAttribute(attributeResponse.data);
      setOptions(optionsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch attribute data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [attributeId, toast]);

  const handleAddOption = () => {
    setEditingOption({
      name: "",
      price_modifier: 0,
      weight: 0,
      active: true,
      isNew: true
    });
  };

  const handleEditOption = (option: WolooAttributeOption) => {
    setEditingOption({
      id: option.id,
      name: option.name || "",
      price_modifier: option.price_modifier || 0,
      weight: option.weight || 0,
      active: option.active !== false,
      isNew: false
    });
  };

  const handleCancelEdit = () => {
    setEditingOption(null);
  };

  const handleSaveOption = async () => {
    if (!editingOption) return;

    if (!editingOption.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Option name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingOption.isNew) {
        // Create new option
        await createWolooAttributeOption(attributeId, {
          name: editingOption.name,
          price_modifier: editingOption.price_modifier || 0,
          weight: editingOption.weight || 0,
          active: editingOption.active,
          attribute_id: attributeId
        });
        toast({
          title: "Success",
          description: "Option created successfully.",
        });
      } else {
        // Update existing option
        await updateWolooAttributeOption(attributeId, editingOption.id!, {
          name: editingOption.name,
          price_modifier: editingOption.price_modifier || 0,
          weight: editingOption.weight || 0,
          active: editingOption.active,
          attribute_id: attributeId
        });
        toast({
          title: "Success",
          description: "Option updated successfully.",
        });
      }

      setEditingOption(null);
      fetchData(); // Refresh the options list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save option.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOption = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteWolooAttributeOption(attributeId, deleteTargetId);
      toast({
        title: "Success",
        description: "Option deleted successfully.",
      });
      setIsDialogOpen(false);
      setDeleteTargetId(null);
      fetchData(); // Refresh the options list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete option.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Link href="/admin/woloo/attributes">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Manage Attribute Options</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading attribute data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Link href="/admin/woloo/attributes">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Manage Attribute Options</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Attribute not found.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Link href="/admin/woloo/attributes">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Manage Options: {attribute.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attribute Info */}
        <Card>
          <CardHeader>
            <CardTitle>Attribute Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-sm font-medium">Name:</Label>
              <p className="text-sm text-gray-600">{attribute.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Type:</Label>
              <p className="text-sm text-gray-600 capitalize">{attribute.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status:</Label>
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                attribute.active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}>
                {attribute.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <Label className="text-sm font-medium">Required:</Label>
              <p className="text-sm text-gray-600">{attribute.required ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Options Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attribute Options</CardTitle>
              <Button onClick={handleAddOption} disabled={!!editingOption}>
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Attribute Type: {attribute.type === 'single' ? 'Single Selection' : 'Multiple Selection'}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {attribute.type === 'single'
                    ? 'Users can select only ONE option from the list (like radio buttons or dropdown)'
                    : 'Users can select MULTIPLE options from the list (like checkboxes)'
                  }
                </p>
              </div>
                  {/* Add/Edit Form */}
                  {editingOption && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-medium mb-4">
                        {editingOption.isNew ? 'Add New Option' : 'Edit Option'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="option-name">Option Name *</Label>
                          <Input
                            id="option-name"
                            value={editingOption.name}
                            onChange={(e) => setEditingOption(prev => prev ? {...prev, name: e.target.value} : null)}
                            placeholder="Enter option name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="option-price">Price Modifier</Label>
                          <Input
                            id="option-price"
                            type="number"
                            step="0.01"
                            value={editingOption.price_modifier || 0}
                            onChange={(e) => setEditingOption(prev => prev ? {...prev, price_modifier: parseFloat(e.target.value) || 0} : null)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="option-weight">Weight (for ordering)</Label>
                          <Input
                            id="option-weight"
                            type="number"
                            value={editingOption.weight || 0}
                            onChange={(e) => setEditingOption(prev => prev ? {...prev, weight: parseInt(e.target.value) || 0} : null)}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="option-active">Status</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="option-active"
                              checked={editingOption.active}
                              onCheckedChange={(checked) => setEditingOption(prev => prev ? {...prev, active: checked} : null)}
                            />
                            <Label htmlFor="option-active">Active</Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={handleCancelEdit}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={handleSaveOption} disabled={isSubmitting}>
                          <Save className="w-4 h-4 mr-2" />
                          {isSubmitting ? 'Saving...' : 'Save Option'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Options Table */}
                  {options.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No options found for this attribute.</p>
                      <p>Click "Add Option" to create the first option.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Price Modifier</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {options.map((option) => (
                          <TableRow key={option.id}>
                            <TableCell>{option.name}</TableCell>
                            <TableCell>
                              {option.price_modifier ? `₹${option.price_modifier}` : '₹0.00'}
                            </TableCell>
                            <TableCell>{option.weight || 0}</TableCell>
                            <TableCell>
                              <span className={`inline-block px-2 py-1 rounded text-xs ${
                                option.active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                              }`}>
                                {option.active ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditOption(option)}
                                  disabled={!!editingOption}
                                >
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </Button>
                                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeleteTargetId(option.id || null)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        <VisuallyHidden>Confirm Delete</VisuallyHidden>
                                      </AlertDialogTitle>
                                      <p className="text-xl font-bold">
                                        Are you sure you want to delete option: {option.name}?
                                      </p>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <Button variant="secondary" onClick={handleDeleteOption}>
                                        Yes, Delete
                                      </Button>
                                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                      </Button>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageAttributeOptions;
