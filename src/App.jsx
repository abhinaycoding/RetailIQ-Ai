import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AppLayout } from './components/layout/AppLayout';
import { Overview } from './pages/Overview';
import { Customers } from './pages/Customers';
import { CustomerSegments } from './pages/CustomerSegments';
import { SalesAnalytics } from './pages/SalesAnalytics';
import { MarketingOpportunities } from './pages/MarketingOpportunities';
import { ImportData } from './pages/ImportData';
import { Settings } from './pages/Settings';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/segments" element={<CustomerSegments />} />
            <Route path="/sales" element={<SalesAnalytics />} />
            <Route path="/marketing" element={<MarketingOpportunities />} />
            <Route path="/import" element={<ImportData />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
