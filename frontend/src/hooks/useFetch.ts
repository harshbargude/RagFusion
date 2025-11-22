import { useState, useEffect } from 'react';
import apiClient from '../api/client';

interface UseFetchOptions {
  skip?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (options.skip) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<T>(url);
      setData(response.data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, options.skip]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

