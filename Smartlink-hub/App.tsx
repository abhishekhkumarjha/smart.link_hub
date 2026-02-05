
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import PublicHub from './pages/PublicHub';
import Analytics from './pages/Analytics';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/edit/:hubId" element={<Editor />} />
          <Route path="/analytics/:hubId" element={<Analytics />} />
          <Route path="/hub/:slug" element={<PublicHub />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
