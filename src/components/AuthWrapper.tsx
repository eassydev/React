// components/AuthWrapper.tsx

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/admin'); // Redirect if the token exists
    }
  }, [router]);

  return <>{children}</>;
}
