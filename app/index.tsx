import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/library');
  }, []);

  return null;
}