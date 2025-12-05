import { useCallback } from 'react';

export const useToast = () => {
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  }, []);

  return { showToast };
};
