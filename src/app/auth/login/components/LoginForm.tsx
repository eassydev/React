'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/lib/auth';
import { tokenUtils } from '@/lib/utils';

const FormSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  password: z.string().min(4, { message: 'Password must be at least 4 characters long' }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false); // Changed to false initially
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenUtils.get();

      if (token) {
        setIsRedirecting(true);
        try {
          // Verify token is still valid by making a test request
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin`, {
            headers: {
              'admin-auth-token': token,
            },
          });

          if (response.ok) {
            // Ensure token is stored in both places
            tokenUtils.set(token);
            router.replace('/admin');
          } else {
            // Token is invalid, remove it
            tokenUtils.remove();
            setIsRedirecting(false);
          }
        } catch (error) {
          // Network error or token invalid
          console.error('Auth check error:', error);
          tokenUtils.remove();
          setIsRedirecting(false);
        }
      }
    };

    checkAuth();
  }, [router]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { username: data.username });
      const response = await login(data.username, data.password);
      console.log('Login response received:', response);

      if (response.token) {
        // Store token using utility function
        tokenUtils.set(response.token);
        console.log('Token stored successfully');

        toast({
          title: 'Login successful',
          description: response.message || 'You are now logged in.',
        });

        console.log('Redirecting to /admin...');
        // Use router.push for better Next.js navigation
        router.push('/admin');
      } else {
        throw new Error('No token received from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'An error occurred during login';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    ); // Show a loader while redirect check happens
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
        method="post"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your username or email"
                  {...field}
                  autoComplete="username"
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Password"
                  {...field}
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <LoaderCircle className="mr-2 size-4 animate-spin" />}
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
}
