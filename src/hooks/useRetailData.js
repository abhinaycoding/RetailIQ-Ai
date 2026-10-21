import { useState, useEffect } from 'react';
import { loadRetailIQData } from '../services/retailData';

/**
 * Custom React hook to consume RetailIQ data across all views
 */
export const useRetailData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadRetailIQData();
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to load dataset.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading dataset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    ...data,
    loading,
    error,
    refetch: fetchData
  };
};
