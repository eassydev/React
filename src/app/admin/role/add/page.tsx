"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { fetchAllPermission, createRole, Role,Permission } from "@/lib/api";



// Grouped Permissions Interface
interface GroupedPermissions {
  [groupName: string]: Permission[];
}

const RoleAddForm: React.FC = () => {
  const [roleName, setRoleName] = useState<string>("");
  const [permissions, setPermissions] = useState<GroupedPermissions>({});
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    loadPermissions();
  }, []);

  // Fetch and group permissions dynamically
  const loadPermissions = async () => {
    try {
      const response = await fetchAllPermission(); // Fetch API data

      const groupedPermissions = Object.keys(response).reduce((acc, key) => {
        const permissionsArray = response[key];
        console.log(key)
        if (Array.isArray(permissionsArray)) {
          acc[key] = permissionsArray; // Use dynamic key as group name
        }
        return acc;
      }, {} as GroupedPermissions);

      setPermissions(groupedPermissions); // Set grouped permissions
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load permissions.",
      });
    }
  };

  // Toggle permission selection
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const updated = new Set(prev);
      if (updated.has(permissionId)) {
        updated.delete(permissionId);
      } else {
        updated.add(permissionId);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!roleName || selectedPermissions.size === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Role name and at least one permission are required.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const roleData: Role = {
        role_name: roleName,
        active: true,
        permissions: Array.from(selectedPermissions).map((id) => ({ id })),
      };

      await createRole(roleData);

      toast({
        variant: "success",
        title: "Success",
        description: "Role created successfully.",
      });

      setRoleName("");
      setSelectedPermissions(new Set());
    } catch (error:any) {
      console.error("Error creating role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Add Role</h1>
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Create New Role</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role Name</label>
                <Input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Enter role name"
                  required
                />
              </div>

              {/* Permission List Grouped */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Permissions</label>
                {Object.entries(permissions).map(([groupName, groupPermissions]) => (
                  <div key={groupName} className="mb-4">
                    <h3 className="text-md font-semibold mb-2 capitalize">{groupName}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {groupPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={String(permission.id)}
                            checked={selectedPermissions.has(String(permission.id))}
                            onCheckedChange={() => togglePermission(String(permission.id))}
                          />
                          <label htmlFor={String(permission.id)} className="text-sm text-gray-700">
                            {permission.route}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
                    <span>Create Role</span>
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

export default RoleAddForm;
