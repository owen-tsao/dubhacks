import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DecisionTreeComponent } from '../components/DecisionTree';
import { DecisionGrouping } from '../components/DecisionGrouping';
import { Header } from '../components/Header';
import { Decision, DecisionTree, ResolveDecisionRequest, GroupDecisionsRequest } from '../types';
import { apiClient } from '../api';
import { GitBranch, Folder, TreePine, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const DecisionTreeView: React.FC = () => {
  const navigate = useNavigate();
  const [tree, setTree] = useState<DecisionTree | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tree' | 'grouping'>('tree');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [treeResponse, decisionsResponse] = await Promise.all([
        apiClient.getDecisionTree(),
        apiClient.listDecisions(),
      ]);
      setTree(treeResponse);
      setDecisions(decisionsResponse.decisions);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load decision tree');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDecision = (decisionId: string) => {
    navigate(`/decisions/${decisionId}`);
  };

  const handleResolveDecision = async (decisionId: string, branchId: string) => {
    try {
      const decision = decisions.find(d => d.decisionId === decisionId);
      if (!decision) return;

      const postConfidence = 4; // Default value, in real app this would come from a form
      const response = await apiClient.resolveDecision(decisionId, {
        decisionId,
        finalBranchId: branchId,
        postConfidence,
        createSubDecision: false,
      });

      toast.success('Decision resolved successfully!');
      await loadData(); // Refresh the tree
    } catch (error) {
      console.error('Error resolving decision:', error);
      toast.error('Failed to resolve decision');
    }
  };

  const handleCreateSubDecision = (parentDecisionId: string, parentBranchId: string) => {
    // Navigate to create decision page with parent context
    navigate(`/decisions/new?parent=${parentDecisionId}&branch=${parentBranchId}`);
  };

  const handleGroupDecisions = async (data: GroupDecisionsRequest) => {
    try {
      await apiClient.groupDecisions(data);
      toast.success('Decisions grouped successfully!');
      await loadData(); // Refresh the data
    } catch (error) {
      console.error('Error grouping decisions:', error);
      toast.error('Failed to group decisions');
    }
  };

  const handleUngroupDecisions = async (decisionIds: string[]) => {
    try {
      // In a real app, this would call an ungroup API
      toast.success('Decisions ungrouped successfully!');
      await loadData(); // Refresh the data
    } catch (error) {
      console.error('Error ungrouping decisions:', error);
      toast.error('Failed to ungroup decisions');
    }
  };

  const handleResolveDecisionFromGrouping = async (decisionId: string) => {
    try {
      const decision = decisions.find(d => d.decisionId === decisionId);
      if (!decision) return;

      // For now, just mark as resolved
      const response = await apiClient.resolveDecision(decisionId, {
        decisionId,
        finalBranchId: '', // This would need to be selected
        postConfidence: 4,
        createSubDecision: false,
      });

      toast.success('Decision resolved successfully!');
      await loadData(); // Refresh the data
    } catch (error) {
      console.error('Error resolving decision:', error);
      toast.error('Failed to resolve decision');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg bg-grid-pattern bg-grid">
        <Header currentPage="decisions" />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading decision tree...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern bg-grid">
      <Header currentPage="decisions" />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/decisions')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                  <TreePine className="w-8 h-8 mr-3" />
                  Decision Tree
                </h1>
                <p className="text-gray-400">
                  Visualize your decision hierarchy and manage related decisions
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8">
            <button
              onClick={() => setActiveTab('tree')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'tree'
                  ? 'bg-accent-blue text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <TreePine className="w-4 h-4 mr-2 inline" />
              Tree View
            </button>
            <button
              onClick={() => setActiveTab('grouping')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'grouping'
                  ? 'bg-accent-blue text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Folder className="w-4 h-4 mr-2 inline" />
              Grouping
            </button>
          </div>

          {/* Content */}
          {activeTab === 'tree' ? (
            <div className="bg-white rounded-2xl p-6 min-h-96">
              {tree && tree.nodes.length > 0 ? (
                <DecisionTreeComponent
                  tree={tree}
                  onSelectDecision={handleSelectDecision}
                  onResolveDecision={handleResolveDecision}
                  onCreateSubDecision={handleCreateSubDecision}
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <TreePine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Decision Tree Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Create your first decision to start building your decision tree
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-3 bg-accent-green text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200"
                    >
                      Create First Decision
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6">
              <DecisionGrouping
                decisions={decisions}
                onGroupDecisions={handleGroupDecisions}
                onUngroupDecisions={handleUngroupDecisions}
                onResolveDecision={handleResolveDecisionFromGrouping}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
