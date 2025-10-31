'use client';

import React, { useState, useEffect, FormEvent } from 'react';
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
import { Save, Loader2, FileImage, Eye, Upload, Check, X, Clock, CreditCard, Plus } from 'lucide-react';
import {
  fetchProviderById,
  updateProvider,
  Provider,
  fetchProviderBankDetails,
  ProviderBankDetail,
  getProviderDocuments,
  uploadProviderDocuments,
  updateProviderDocumentStatus,
  ProviderDocument
} from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const EditProviderForm: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
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
  const [existingImage, setExistingImage] = useState<string>('');

  const [postalCode, setPostalCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gstError, setGstError] = useState('');
  const [panError, setPanError] = useState('');
  const [documents, setDocuments] = useState<ProviderDocument[]>([]);
  const [newAadharFront, setNewAadharFront] = useState<File | null>(null);
  const [newAadharBack, setNewAadharBack] = useState<File | null>(null);
  const [newPanCard, setNewPanCard] = useState<File | null>(null);
  const [newGstCertificate, setNewGstCertificate] = useState<File | null>(null);

  // Bank account state
  const [bankAccounts, setBankAccounts] = useState<ProviderBankDetail[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState<boolean>(false);

  // Document numbers for upload
  const [aadharDocNumber, setAadharDocNumber] = useState<string>('');
  const [panDocNumber, setPanDocNumber] = useState<string>('');
  const [gstDocNumber, setGstDocNumber] = useState<string>('');

  // Update document numbers when provider data is loaded
  useEffect(() => {
    if (panNumber) {
      setPanDocNumber(panNumber);
    }
    if (gstNumber) {
      setGstDocNumber(gstNumber);
    }
  }, [panNumber, gstNumber]);

  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  // Function to fetch provider documents
  const fetchProviderDocuments = async (providerId: string) => {
    try {
      const docs = await getProviderDocuments(providerId);
      setDocuments(docs || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Function to update document status
  const updateDocumentStatus = async (documentId: string, status: 'approved' | 'rejected') => {
    try {
      await updateProviderDocumentStatus(documentId, status);
      toast({
        title: 'Success',
        description: `Document ${status} successfully.`,
      });
      await fetchProviderDocuments(id as string);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${status} document.`,
      });
    }
  };

  // Function to upload new documents
  const uploadDocuments = async () => {
    try {
      const documents: {
        adhaarCardFront?: File;
        adhaarCardBack?: File;
        panCard?: File;
        gstCertificate?: File;
      } = {};

      const documentNumbers: {
        adhaarCardFront_document_number?: string;
        adhaarCardBack_document_number?: string;
        panCard_document_number?: string;
        gstCertificate_document_number?: string;
      } = {};

      if (newAadharFront) {
        documents.adhaarCardFront = newAadharFront;
        documentNumbers.adhaarCardFront_document_number = aadharDocNumber;
      }
      if (newAadharBack) {
        documents.adhaarCardBack = newAadharBack;
        documentNumbers.adhaarCardBack_document_number = aadharDocNumber;
      }
      if (newPanCard) {
        documents.panCard = newPanCard;
        documentNumbers.panCard_document_number = panDocNumber;
      }
      if (newGstCertificate) {
        documents.gstCertificate = newGstCertificate;
        documentNumbers.gstCertificate_document_number = gstDocNumber;
      }

      await uploadProviderDocuments(id as string, documents, documentNumbers);

      toast({
        title: 'Success',
        description: 'Documents uploaded successfully.',
      });

      // Reset file inputs and document numbers
      setNewAadharFront(null);
      setNewAadharBack(null);
      setNewPanCard(null);
      setNewGstCertificate(null);
      setAadharDocNumber('');
      setPanDocNumber('');
      setGstDocNumber('');

      // Refresh documents
      await fetchProviderDocuments(id as string);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload documents.',
      });
    }
  };

  // Function to fetch bank accounts
  const fetchBankAccounts = async (providerId: string) => {
    try {
      setBankAccountsLoading(true);
      const { data } = await fetchProviderBankDetails(providerId, 1, 10);
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setBankAccounts([]);
    } finally {
      setBankAccountsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProviderData = async () => {
      setIsLoading(true);
      try {
        const providerData = await fetchProviderById(id as string);
        console.log('🔍 Provider Data Fetched:', providerData);
        console.log('🔍 GST Number:', providerData.gst_number);
        console.log('🔍 PAN Number:', providerData.pan_number);

        setFirstName(providerData.first_name || '');
        setLastName(providerData.last_name || '');
        setGender(providerData.gender || 'male');
        setEmail(providerData.email || '');
        setPhone(providerData.phone || '');
        setCompanyName(providerData.company_name || '');
        setGstNumber(providerData.gst_number || '');
        setPanNumber(providerData.pan_number || '');
        setLinkedAccountId(providerData.linked_account_id || '');
        if (typeof providerData.image === 'string') {
          setExistingImage(providerData.image); // Set existing image URL
        } else {
          setExistingImage(''); // Handle unexpected values gracefully
        }
        setIsActive(providerData.active === 1);
        setRating(providerData.rating?.toString() || '0.0');
        setCommission(providerData.commission?.toString() || '0.0');
        setCountry(providerData.country || '');
        setState(providerData.state || '');
        setCity(providerData.city || '');
        setPostalCode(providerData.postal_code || '');
        // ✅ B2B PROVIDER FIELDS
        setProviderType(providerData.provider_type || 'b2c');
        setB2bApproved(providerData.b2b_approved === 1);

        // Fetch provider documents and bank accounts
        await fetchProviderDocuments(id as string);
        await fetchBankAccounts(id as string);
      } catch (error) {
        console.error('❌ Error fetching provider data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to load provider data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderData();
  }, [id, toast]);

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

    // Check for GST/PAN validation errors
    if (gstError || panError) {
      toast({
        variant: 'error',
        title: 'Validation Error',
        description: 'Please fix the GST/PAN number format errors before submitting.',
      });
      setIsSubmitting(false);
      return;
    }

    const updatedProvider: Provider = {
      first_name: firstName,
      last_name: lastName,
      gender,
      email,
      image,
      phone,
      company_name: companyName,
      gst_number: gstNumber,
      pan_number: panNumber,
      linked_account_id: linkedAccountId,
      active: isActive ? 1 : 0, // ✅ FIX: Correct the backwards logic
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

    console.log('🚀 Updating provider with data:', {
      first_name: firstName,
      last_name: lastName,
      linked_account_id: linkedAccountId,
      gst_number: gstNumber,
      pan_number: panNumber,
      image: image ? 'File selected' : 'No file'
    });

    try {
      await updateProvider(id as string, updatedProvider);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Provider updated successfully.',
      });
      // router.push("/admin/provider");
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update provider.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-12xl mx-auto space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Edit Provider</h1>
          <p className="text-gray-500">Update provider details</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <div>
                <CardTitle className="text-xl text-gray-800">Edit Provider</CardTitle>
                <CardDescription className="text-gray-500">
                  Modify the details below to update provider information
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading provider data...</span>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                  className="w-full border p-2 rounded"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

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
                <label className="text-sm font-medium text-gray-700">
                  GST Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  value={gstNumber}
                  onChange={(e) => validateGST(e.target.value)}
                  placeholder="Enter GST number (optional)"
                />
                {gstError && <p className="text-sm text-red-500">{gstError}</p>}
                <p className="text-xs text-gray-500">Leave empty if not applicable. GST certificate can be uploaded in Documents section below.</p>
              </div>

              {/* PAN Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  PAN Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  value={panNumber}
                  onChange={(e) => validatePAN(e.target.value)}
                  placeholder="Enter PAN number (optional)"
                />
                {panError && <p className="text-sm text-red-500">{panError}</p>}
                <p className="text-xs text-gray-500">Leave empty if not applicable. PAN card can be uploaded in Documents section below.</p>
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter country"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">State</label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter state"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileImage className="w-4 h-5 text-blue-500" />
                  <span>Image</span>
                </label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {existingImage && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">Current Image:</span>
                    <img
                      src={existingImage}
                      alt="Existing Onboarding"
                      className="mt-2 max-h-32 rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Postal Code</label>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>

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

              <div className="flex items-center space-x-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} className="bg-primary" />
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </form>
            )}
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
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Bank Account Section */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Bank Accounts</CardTitle>
                  <CardDescription>
                    Manage provider bank account details for payments
                  </CardDescription>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/provider/${id}/account`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Accounts
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {bankAccountsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading bank accounts...</span>
              </div>
            ) : bankAccounts.length > 0 ? (
              <div className="space-y-4">
                {bankAccounts.slice(0, 3).map((account, index) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{account.account_holder_name}</h4>
                        {account.primary && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Primary
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          account.status === 'verified' ? 'bg-green-100 text-green-800' :
                          account.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {account.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {account.account_number?.replace(/(.{4})/g, '$1 ').trim()} • {account.ifsc_code}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{account.account_type} Account</p>
                    </div>
                  </div>
                ))}
                {bankAccounts.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    And {bankAccounts.length - 3} more account(s)...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No bank accounts added yet</p>
                <Button asChild variant="outline">
                  <Link href={`/admin/provider/${id}/account/add`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bank Account
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="border-b border-gray-100 pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <FileImage className="w-6 h-6 text-primary" />
              <span>Provider Documents</span>
            </CardTitle>
            <CardDescription>
              View and manage provider documents (Aadhar, PAN, GST certificates)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Aadhar Card Front */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Aadhar Card Front</label>
                {(() => {
                  const aadharFrontDoc = documents.find((doc) => doc.document_type === 'adhaarCardFront');
                  return aadharFrontDoc ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        {getStatusBadge(aadharFrontDoc.status)}
                        <span className="text-xs text-gray-500">
                          {aadharFrontDoc.document_number}
                        </span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Current
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Aadhar Card Front</DialogTitle>
                          </DialogHeader>
                          <img
                            src={aadharFrontDoc.document_url}
                            alt="Aadhar Front"
                            className="w-full h-auto rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png';
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      {aadharFrontDoc.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => updateDocumentStatus(aadharFrontDoc.id, 'approved')}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => updateDocumentStatus(aadharFrontDoc.id, 'rejected')}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      <Input
                        type="text"
                        placeholder="Aadhar Number"
                        value={aadharDocNumber}
                        onChange={(e) => setAadharDocNumber(e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewAadharFront(e.target.files?.[0] || null)}
                        className="text-sm"
                        placeholder="Upload new Aadhar front"
                      />
                      {newAadharFront && (
                        <p className="text-xs text-green-600">
                          New file selected: {newAadharFront.name}
                        </p>
                      )}
                    </div>
                  ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">No document uploaded</p>
                    <Input
                      type="text"
                      placeholder="Aadhar Number"
                      value={aadharDocNumber}
                      onChange={(e) => setAadharDocNumber(e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewAadharFront(e.target.files?.[0] || null)}
                      className="text-sm"
                      placeholder="Upload Aadhar front"
                    />
                    {newAadharFront && (
                      <p className="text-xs text-green-600">File selected: {newAadharFront.name}</p>
                    )}
                  </div>
                  );
                })()}
              </div>

              {/* Aadhar Card Back */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Aadhar Card Back</label>
                {documents.find((doc) => doc.document_type === 'adhaarCardBack') ? (
                  <div className="space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Current
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Aadhar Card Back</DialogTitle>
                        </DialogHeader>
                        <img
                          src={
                            documents.find((doc) => doc.document_type === 'adhaarCardBack')
                              ?.document_url
                          }
                          alt="Aadhar Back"
                          className="w-full h-auto rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewAadharBack(e.target.files?.[0] || null)}
                      className="text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">No document uploaded</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewAadharBack(e.target.files?.[0] || null)}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              {/* PAN Card */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">PAN Card</label>
                {(() => {
                  const panCardDoc = documents.find((doc) => doc.document_type === 'panCard');
                  return panCardDoc ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        {getStatusBadge(panCardDoc.status)}
                        <span className="text-xs text-gray-500">
                          {panCardDoc.document_number}
                        </span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Current
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>PAN Card</DialogTitle>
                          </DialogHeader>
                          <img
                            src={panCardDoc.document_url}
                            alt="PAN Card"
                            className="w-full h-auto rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                      {panCardDoc.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => updateDocumentStatus(panCardDoc.id, 'approved')}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => updateDocumentStatus(panCardDoc.id, 'rejected')}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    <Input
                      type="text"
                      placeholder="PAN Number"
                      value={panDocNumber}
                      onChange={(e) => setPanDocNumber(e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewPanCard(e.target.files?.[0] || null)}
                      className="text-sm"
                    />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">No document uploaded</p>
                      <Input
                        type="text"
                        placeholder="PAN Number"
                        value={panDocNumber}
                        onChange={(e) => setPanDocNumber(e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewPanCard(e.target.files?.[0] || null)}
                        className="text-sm"
                      />
                    </div>
                  );
                })()}
              </div>

              {/* GST Certificate */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">GST Certificate</label>
                {(() => {
                  const gstCertDoc = documents.find((doc) => doc.document_type === 'gstCertificate');
                  return gstCertDoc ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        {getStatusBadge(gstCertDoc.status)}
                        <span className="text-xs text-gray-500">
                          {gstCertDoc.document_number}
                        </span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Current
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>GST Certificate</DialogTitle>
                          </DialogHeader>
                          <img
                            src={gstCertDoc.document_url}
                            alt="GST Certificate"
                            className="w-full h-auto rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                      {gstCertDoc.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => updateDocumentStatus(gstCertDoc.id, 'approved')}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => updateDocumentStatus(gstCertDoc.id, 'rejected')}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      <Input
                        type="text"
                        placeholder="GST Number"
                        value={gstDocNumber}
                        onChange={(e) => setGstDocNumber(e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewGstCertificate(e.target.files?.[0] || null)}
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">No document uploaded</p>
                      <Input
                        type="text"
                        placeholder="GST Number"
                        value={gstDocNumber}
                        onChange={(e) => setGstDocNumber(e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewGstCertificate(e.target.files?.[0] || null)}
                        className="text-sm"
                      />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Upload Documents Button */}
            {(newAadharFront || newAadharBack || newPanCard || newGstCertificate) && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Button
                  onClick={uploadDocuments}
                  className="w-full bg-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? 'Uploading...' : 'Upload New Documents'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProviderForm;
