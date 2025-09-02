'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronUp, 
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { FAQItem } from '@/lib/api';

// Import React-Quill dynamically for client-side rendering
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Simplified Quill modules for FAQ answers
const faqQuillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const faqQuillFormats = [
  'bold', 'italic', 'underline',
  'list', 'bullet',
  'link'
];

interface FAQEditorProps {
  faqItems: FAQItem[];
  onChange: (faqItems: FAQItem[]) => void;
}

const FAQEditor: React.FC<FAQEditorProps> = ({ faqItems, onChange }) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

  // Add new FAQ item
  const addFAQItem = () => {
    const newItem: FAQItem = {
      question: '',
      answer: '',
      sort_order: faqItems.length,
      is_active: true,
    };
    const updatedItems = [...faqItems, newItem];
    onChange(updatedItems);
    
    // Expand the new item
    setExpandedItems(prev => new Set([...prev, faqItems.length]));
  };

  // Remove FAQ item
  const removeFAQItem = (index: number) => {
    const updatedItems = faqItems.filter((_, i) => i !== index);
    // Update sort orders
    const reorderedItems = updatedItems.map((item, i) => ({
      ...item,
      sort_order: i,
    }));
    onChange(reorderedItems);
    
    // Remove from expanded items
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  // Update FAQ item
  const updateFAQItem = (index: number, field: keyof FAQItem, value: any) => {
    const updatedItems = faqItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updatedItems);
  };

  // Move FAQ item up/down
  const moveFAQItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === faqItems.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedItems = [...faqItems];
    
    // Swap items
    [updatedItems[index], updatedItems[newIndex]] = [updatedItems[newIndex], updatedItems[index]];
    
    // Update sort orders
    updatedItems[index].sort_order = index;
    updatedItems[newIndex].sort_order = newIndex;
    
    onChange(updatedItems);
  };

  // Toggle expanded state
  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">FAQ Questions & Answers</h3>
        </div>
        <Button onClick={addFAQItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {faqItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQ items yet</h3>
            <p className="text-gray-600 mb-4">
              Add frequently asked questions to help your customers find answers quickly.
            </p>
            <Button onClick={addFAQItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isExpanded = expandedItems.has(index);
            
            return (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFAQItem(index, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFAQItem(index, 'down')}
                          disabled={index === faqItems.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          FAQ #{index + 1}
                        </span>
                        <Switch
                          checked={item.is_active ?? true}
                          onCheckedChange={(checked) => updateFAQItem(index, 'is_active', checked)}
                          size="sm"
                        />
                        <span className="text-xs text-gray-500">
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(index)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFAQItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${index}`}>Question *</Label>
                      <Input
                        id={`question-${index}`}
                        placeholder="Enter your FAQ question..."
                        value={item.question}
                        onChange={(e) => updateFAQItem(index, 'question', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`answer-${index}`}>Answer *</Label>
                      <div className="border border-gray-300 rounded-md">
                        <ReactQuill
                          theme="snow"
                          value={item.answer}
                          onChange={(value) => updateFAQItem(index, 'answer', value)}
                          modules={faqQuillModules}
                          formats={faqQuillFormats}
                          placeholder="Enter the answer to this question..."
                          style={{ minHeight: '120px' }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        You can format the answer with bold, italic, lists, and links.
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
      
      {faqItems.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={addFAQItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Another FAQ
          </Button>
        </div>
      )}
    </div>
  );
};

export default FAQEditor;
