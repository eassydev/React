'use client';
import React, { useState, useEffect, FormEvent } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { fetchAllRatecard, getRatecardBogoById, updateRatecardBogo } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Virtuoso } from 'react-virtuoso';
import { useParams, useRouter } from 'next/navigation';

const EditBogoForm: React.FC = () => {
  const { id } = useParams(); // Get the BogoRateCard ID from the route
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rateCards, setRateCards] = useState<any[]>([]);
  const [rateCardId, setRateCardId] = useState<string>('');
  const [bogoRateCardId, setBogoRateCardId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const { toast } = useToast();
  const [selectedRateCardName, setSelectedRateCardName] = useState<string>('Select an option');
  const [selectedBogoName, setSelectedBogoName] = useState<string>('Select an option');

  // Fetch rate cards and existing BogoRateCard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all rate cards
        const rateCardResponse = await fetchAllRatecard();
        setRateCards(rateCardResponse || []);

        // Fetch the existing BogoRateCard data
        const bogoRateCard = await getRatecardBogoById(id as string);
        if (bogoRateCard) {
          setRateCardId(bogoRateCard.rate_card_id);
          setBogoRateCardId(bogoRateCard.bogo_rate_card_id);
          setIsActive(bogoRateCard.is_active);
          const selectedOption = rateCards.find(
            (option) => option.id?.toString() === bogoRateCard.rate_card_id
          );
          const bogoOption = rateCards.find(
            (option) => option.id?.toString() === bogoRateCard.bogo_rate_card_id
          );

          setSelectedRateCardName(selectedOption.name || 'No Name');
          setSelectedBogoName(bogoOption.name || 'No Name');
        }
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load data.',
        });
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call updateBogoRateCard with the required data
      const response = await updateRatecardBogo(id as string, {
        rate_card_id: rateCardId,
        bogo_rate_card_id: bogoRateCardId,
        is_active: isActive,
      });

      toast({
        variant: 'success',
        title: 'Success',
        description: response.message || 'Bogo updated successfully.',
      });

      // Redirect to the list page after successful update
      router.push('/admin/bogo');
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update Bogo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValueChange = (value: string) => {
    const selectedOption = rateCards.find((option) => option.id?.toString() === value);
    if (selectedOption) {
      setRateCardId(value.toString());
      setSelectedRateCardName(selectedOption.name || 'No Name'); // Handle null/undefined name
    } else {
      setSelectedRateCardName('Select an option');
    }
  };

  const handleValueBogoChange = (value: string) => {
    const selectedOption = rateCards.find((option) => option.id?.toString() === value);
    if (selectedOption) {
      setBogoRateCardId(value.toString());
      setSelectedBogoName(selectedOption.name || 'No Name'); // Handle null/undefined name
    } else {
      setSelectedBogoName('Select an option');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Bogo</CardTitle>
          <CardDescription>Update the rate cards for the Bogo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rate Card Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700">Select Rate Card</label>
              <Select value={rateCardId} onValueChange={handleValueChange}>
                <SelectTrigger className="bg-white border-gray-200">
                  {selectedRateCardName}
                </SelectTrigger>
                <SelectContent>
                  <Virtuoso
                    style={{ height: '200px' }}
                    totalCount={rateCards.length}
                    itemContent={(index: number) => (
                      <SelectItem key={rateCards[index].id} value={rateCards[index].id.toString()}>
                        {rateCards[index].name || 'No Name'} {/* Handle null/undefined name */}
                      </SelectItem>
                    )}
                  />
                </SelectContent>
              </Select>
            </div>

            {/* Bogo Rate Card Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700">Select Bogo Rate Card</label>
              <Select value={bogoRateCardId} onValueChange={handleValueBogoChange}>
                <SelectTrigger className="bg-white border-gray-200">
                  {selectedBogoName}
                </SelectTrigger>
                <SelectContent>
                  <Virtuoso
                    style={{ height: '200px' }}
                    totalCount={rateCards.length}
                    itemContent={(index: number) => (
                      <SelectItem key={rateCards[index].id} value={rateCards[index].id.toString()}>
                        {rateCards[index].name || 'No Name'} {/* Handle null/undefined name */}
                      </SelectItem>
                    )}
                  />
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span>Active</span>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Update Bogo</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
};

export default EditBogoForm;
