import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DecisionCard } from '../components/DecisionCard';
import { CommandLineInput } from '../components/CommandLineInput';
import { Header } from '../components/Header';
import { Decision } from '../types';
import { apiClient } from '../api';
import { formatRelativeTime } from '../utils';
import { GitBranch, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const DecisionList: React.FC = () => {
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.listDecisions();
      setDecisions(response.decisions);
    } catch (error) {
      console.error('Error loading decisions:', error);
      toast.error('Failed to load decisions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDecision = (decisionId: string) => {
    navigate(`/decisions/${decisionId}`);
  };

  const handleCompareDecision = (decisionId: string) => {
    navigate(`/decisions/${decisionId}/compare`);
  };

  const handleViewTree = (decisionId: string) => {
    navigate(`/decisions/${decisionId}?tab=tree`);
  };

  const handleCommandLineSubmit = async (decisionTitle: string, description?: string, confidence?: number) => {
    try {
      setIsCreating(true);
      const result = await apiClient.createDecision({
        title: decisionTitle,
        description: description || '',
        preConfidence: confidence || 3
      });
      toast.success('Decision branch created successfully!');
      await loadDecisions(); // Refresh the list
      // Scroll to the new decision
      setTimeout(() => {
        document.getElementById(`decision-${result.decisionId}`)?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    } catch (error) {
      console.error('Error creating decision:', error);
      toast.error('Failed to create decision. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern bg-grid">
        <Header currentPage="decisions" />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading your decisions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern bg-grid">
      <Header currentPage="decisions" />
      
      {/* Command Line Input */}
      <section className="pt-32 pb-16 px-6" data-terminal>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center space-x-2">
              <GitBranch className="w-6 h-6" />
              <span>Quick Decision Branch</span>
            </h2>
            <p className="text-gray-400">
              Type your decision like a Git command for instant branching
            </p>
          </div>
          <CommandLineInput 
            onSubmit={handleCommandLineSubmit} 
            isLoading={isCreating} 
          />
        </div>
      </section>
      
      <div className="pt-12 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-4">Your Decisions</h1>
              <p className="text-text-secondary text-base">
                Manage and explore your life decision branches
              </p>
            </div>
            <button
              onClick={() => document.querySelector('[data-terminal]')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-accent-green text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Decision</span>
            </button>
          </div>

          {decisions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-accent-blue rounded-3xl flex items-center justify-center mx-auto mb-8">
                <GitBranch className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-4">
                No decisions yet
              </h3>
              <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
                Create your first decision to start exploring different life paths
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-accent-green text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105"
              >
                Create Your First Decision
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {decisions.map((decision, index) => (
                <DecisionCard
                  key={decision.decisionId}
                  decision={decision}
                  index={index}
                  onView={handleViewDecision}
                  onCompare={handleCompareDecision}
                  onViewTree={handleViewTree}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};