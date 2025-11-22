import { useCallback } from 'react';

export const useToast = () => {
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Minimal toast fallback: use alert for now. You can replace with a nicer UI later.
    if (type === 'error') {
      // eslint-disable-next-line no-alert
      alert(`Error: ${message}`);
    } else {
      // eslint-disable-next-line no-alert
      alert(message);
    }
  }, []);

  return { showToast };
};
