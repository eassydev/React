'use client';

import React, { useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { Save, Loader2, FileText, Image } from 'lucide-react';
import { createDonation, Donation } from '@/lib/api';

// Import React-Quill dynamically for client-side rendering
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const quillModules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const AddDonationForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [accountNo, setAccountNo] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !accountNo || !ifscCode) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Name, account number, and IFSC code are required.',
      });
      setIsSubmitting(false);
      return;
    }

    const newDonation: Donation = {
      name,
      description,
      logo_image: logoImage,
      image,
      account_no: accountNo,
      ifsc_code: ifscCode,
      bank_name: bankName,
      branch_name: branchName,
      is_active: isActive,
    };

    try {
      await createDonation(newDonation);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Donation created successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to create donation.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Donations Management</h1>
          <p className="text-gray-500">Create a donation</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Donation</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to add a donation
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Donation Name"
                required
              />
              <ReactQuill
                value={description}
                onChange={setDescription}
                theme="snow"
                modules={quillModules}
              />
              <Input type="file" onChange={(e) => setLogoImage(e.target.files?.[0] || null)} />
              <Input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              <Input
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="Account No"
                required
              />
              <Input
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="IFSC Code"
                required
              />
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Bank Name"
              />
              <Input
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Branch Name"
              />
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 mt-6">
            <Button className="w-full" disabled={isSubmitting} onClick={onSubmit}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}{' '}
              Save Donation
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AddDonationForm;
