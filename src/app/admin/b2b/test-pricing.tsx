'use client';

import React from 'react';
import { calculateB2BPricing, getB2BPricingRules } from '@/lib/api';

export default function TestPricingComponent() {
  const testPricing = async () => {
    console.log('🧪 Testing pricing functions...');
    console.log('calculateB2BPricing:', typeof calculateB2BPricing);
    console.log('getB2BPricingRules:', typeof getB2BPricingRules);
    
    try {
      const result = await calculateB2BPricing({
        client_scenario: 'mobile_furniture_store',
        service_area_sqft: 100,
        service_type: 'deep_cleaning',
        quantity: 1
      });
      console.log('✅ Pricing result:', result);
    } catch (error) {
      console.error('❌ Pricing error:', error);
    }
  };

  return (
    <div className="p-4">
      <h1>Test Pricing Functions</h1>
      <button 
        onClick={testPricing}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Pricing API
      </button>
    </div>
  );
}
