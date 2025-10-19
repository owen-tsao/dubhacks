import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { DecisionList } from './pages/DecisionList';
import { DecisionView } from './pages/DecisionView';
import { ComparisonView } from './pages/ComparisonView';
import { Demo } from './pages/Demo';
import { About } from './pages/About';
import { Notes } from './pages/Notes';
import { Contact } from './pages/Contact';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/decisions" element={<DecisionList />} />
      <Route path="/decisions/:id" element={<DecisionView />} />
      <Route path="/decisions/:id/compare" element={<ComparisonView />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/about" element={<About />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
};
