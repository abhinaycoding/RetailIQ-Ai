import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadDemoRetailData } from '../services/retailData';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'My Store',
    currency: 'GBP',
    currencySymbol: '£',
    timezone: 'UTC'
  });

  const loadInitialDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loadDemoRetailData();
      if (res.success) {
        setData(res);
      } else {
        setError(res.error || 'Failed to load demo dataset.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialDemo();
  }, []);

  const resetToDemo = () => {
    return loadInitialDemo();
  };

  const applyCustomDataset = (processedResult, fileName) => {
    setData({
      success: true,
      source: 'custom',
      datasetName: fileName || 'Imported Transactions CSV',
      importedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customers: processedResult.customers,
      segments: processedResult.segments,
      models: data?.models || [], // preserve existing benchmark model details as reference
      salesTimeline: processedResult.salesTimeline,
      summary: processedResult.summary
    });
    setError(null);
  };

  const updateStoreSettings = (newSettings) => {
    setStoreSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <DataContext.Provider
      value={{
        ...data,
        activeData: data,
        loading,
        error,
        resetToDemo,
        applyCustomDataset,
        storeSettings,
        updateStoreSettings
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
