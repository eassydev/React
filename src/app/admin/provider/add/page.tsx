'use client';

import React, { useState, FormEvent } from 'react';
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
import { Save, Loader2, FileImage, Building2 } from 'lucide-react';
import { createProvider, Provider } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

const AddProviderForm: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [gender, setGender] = useState<string>('male');
  const [email, setEmail] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [phone, setPhone] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [panNumber, setPanNumber] = useState<string>('');
  const [linkedAccountId, setLinkedAccountId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [rating, setRating] = useState<string>('0.0');
  const [commission, setCommission] = useState<string>('0.0');
  // ✅ B2B PROVIDER FIELDS
  const [providerType, setProviderType] = useState<'b2c' | 'b2b' | 'hybrid'>('b2c');
  const [b2bApproved, setB2bApproved] = useState<boolean>(false);
  const [country, setCountry] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const { toast } = useToast();

  const [gstError, setGstError] = useState('');
  const [panError, setPanError] = useState('');

  const validateGST = (value: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
    setGstNumber(value); // Allow updating the input value
    if (!gstRegex.test(value) && value !== '') {
      setGstError('Invalid GST number format. Example: 22AAAAA0000A1Z5');
    } else {
      setGstError('');
    }
  };

  const validatePAN = (value: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    setPanNumber(value); // Allow updating the input value
    if (!panRegex.test(value) && value !== '') {
      setPanError('Invalid PAN number format. Example: ABCDE1234F');
    } else {
      setPanError('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!firstName || !phone) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'First Name and Phone are required.',
      });
      setIsSubmitting(false);
      return;
    }
    const validGenders: Array<'male' | 'female' | 'other'> = ['male', 'female', 'other'];
    const newProvider: Provider = {
      first_name: firstName,
      last_name: lastName,
      gender: validGenders.includes(gender as any)
        ? (gender as 'male' | 'female' | 'other')
        : undefined,
      email,
      phone,
      image,
      company_name: companyName,
      gst_number: gstNumber,
      pan_number: panNumber,
      linked_account_id: linkedAccountId,
      active: isActive ? 0 : 1,
      rating: parseFloat(rating),
      commission: parseFloat(commission),
      country,
      state,
      city,
      postal_code: postalCode,
      // ✅ B2B PROVIDER FIELDS
      provider_type: providerType,
      b2b_approved: b2bApproved ? 1 : 0,
    };

    try {
      await createProvider(newProvider);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Provider created successfully.',
      });
      //router.push("/admin/provider");
    } catch (error: any) {
      console.log();
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to create provider.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Provider Management</h1>
          <p className="text-gray-500">Create a new provider</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">New Provider</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in the details below to create a new provider
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input
                  type="number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Image Upload Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileImage className="w-4 h-5 text-blue-500" />
                  <span>Image</span>
                </label>
                <Input type="file" accept="image/*" onChange={handleImageChange} required />
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              {/* GST Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">GST Number</label>
                <Input
                  value={gstNumber}
                  onChange={(e) => validateGST(e.target.value)}
                  placeholder="Enter GST number"
                />
                {gstError && <p className="text-sm text-red-500">{gstError}</p>}
              </div>

              {/* PAN Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">PAN Number</label>
                <Input
                  value={panNumber}
                  onChange={(e) => validatePAN(e.target.value)}
                  placeholder="Enter PAN number"
                />
                {panError && <p className="text-sm text-red-500">{panError}</p>}
              </div>

              {/* Linked Account ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Razorpay Linked Account ID
                </label>
                <Input
                  value={linkedAccountId}
                  onChange={(e) => setLinkedAccountId(e.target.value)}
                  placeholder="Enter Razorpay linked account ID"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter country"
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">State</label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter state"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Postal Code</label>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rating</label>
                <Input
                  type="number"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="Enter rating"
                />
              </div>

              {/* Commission Rate */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Commission Rate (%)
                  <span className="text-xs text-gray-500 ml-2">
                    Individual commission rate for this provider
                  </span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="Enter commission rate (e.g., 15.5)"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Leave as 0.0 to use default category commission rates.
                  This will override category-specific rates for this provider.
                </p>
              </div>

              {/* ✅ B2B PROVIDER FIELDS */}
              <div className="col-span-2 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">B2B Provider Settings</h3>

                {/* Provider Type */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-gray-700">Provider Type</label>
                  <select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value as 'b2c' | 'b2b' | 'hybrid')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="b2c">B2C Only (Regular Customers)</option>
                    <option value="b2b">B2B Only (Business Clients)</option>
                    <option value="hybrid">Hybrid (Both B2C & B2B)</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    {providerType === 'b2c' && 'Provider will only serve individual customers'}
                    {providerType === 'b2b' && 'Provider will only serve business clients (hidden from customer app)'}
                    {providerType === 'hybrid' && 'Provider can serve both individual customers and business clients'}
                  </p>
                </div>

                {/* B2B Approval */}
                {(providerType === 'b2b' || providerType === 'hybrid') && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      checked={b2bApproved}
                      onCheckedChange={setB2bApproved}
                      className="bg-primary"
                    />
                    <span className="text-sm text-gray-700">Approved for B2B Services</span>
                    <p className="text-xs text-gray-500 ml-2">
                      (Provider can receive B2B orders only when approved)
                    </p>
                  </div>
                )}
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
              <Button
                className="w-100 flex-1 h-11 bg-primary"
                disabled={isSubmitting}
                onClick={onSubmit}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Provider</span>
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

export default AddProviderForm;
