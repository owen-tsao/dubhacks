import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DecisionTree } from '../components/DecisionTree';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Decision, Branch, CreateBranchRequest, SimulateRequest, DecisionTree as DecisionTreeType } from '../types';
import { apiClient } from '../api';
import { formatDate } from '../utils';
import { ArrowLeft, BarChart3, TreePine, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const DecisionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);
  const [tree, setTree] = useState<DecisionTreeType | null>(null);
  const [showCreateSubDecision, setShowCreateSubDecision] = useState(false);
  const [subDecisionTitle, setSubDecisionTitle] = useState('');
  const [subDecisionDescription, setSubDecisionDescription] = useState('');

  useEffect(() => {
    if (id) {
      loadDecision();
    }
  }, [id]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'tree') {
      setActiveTab('tree');
    }
  }, [searchParams]);

  const loadDecision = async () => {
    try {
      setIsLoading(true);
      console.log('Loading decision with ID:', id);
      const decisionResponse = await apiClient.getDecision(id!);
      console.log('Decision response:', decisionResponse);
      setDecision(decisionResponse.decision);
      
      // Filter to show only the original decision branches (limit to 2 for Tree View)
      // This prevents showing branches created during Interactive Flow simulations
      // The Interactive Flow creates additional branches when users make choices,
      // Filter to show only the original 2 branches (not the ones created during interactive flow)
      const allBranches = decisionResponse.branches;
      
      // Sort branches by creation time and take the first 2 (original branches)
      // This ensures we always show the original decision options, not the ones created during interactive flow
      const sortedBranches = allBranches.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      });
      
      // Take only the first 2 branches (original decision options)
      // This prevents showing branches created during Interactive Flow simulations
      const originalBranches = sortedBranches.slice(0, 2);
      
      // Additional safety: if we still have more than 2, take the first 2 by index
      const finalBranches = originalBranches.length > 2 ? originalBranches.slice(0, 2) : originalBranches;
      
      console.log(`Filtering branches: ${allBranches.length} total, showing ${finalBranches.length} original (oldest first)`);
      console.log('All branches:', allBranches);
      console.log('Final branches:', finalBranches);
      setBranches(finalBranches);
      
      // TODO: Implement decision tree functionality
      setTree([]);
    } catch (error) {
      console.error('Error loading decision:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load decision');
      navigate('/decisions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBranch = async (data: CreateBranchRequest) => {
    try {
      setIsCreating(true);
      await apiClient.createBranch(id!, data);
      toast.success('Branch created successfully!');
      loadDecision(); // Reload to get updated branches
    } catch (error) {
      console.error('Error creating branch:', error);
      toast.error('Failed to create branch');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSimulate = async (branchId: string, personaStyle: 'analytical' | 'empathetic') => {
    try {
      setIsSimulating(branchId);
      setSelectedBranch(branchId);
      const response = await apiClient.simulateBranch({
        branchId,
        personaStyle,
        async: false,
      });
      setSimulationData(response);
      toast.success('Simulation completed!');
    } catch (error) {
      console.error('Error simulating branch:', error);
      toast.error('Failed to simulate branch');
    } finally {
      setIsSimulating(null);
    }
  };

  const handleSendMessage = (text: string) => {
    // For now, just add a user message to the simulation
    if (simulationData) {
      const newMessage = {
        messageId: Date.now().toString(),
        sender: 'user' as const,
        text,
        createdAt: new Date().toISOString(),
      };
      setSimulationData({
        ...simulationData,
        messages: [...simulationData.messages, newMessage],
      });
    }
  };

  const handleResolveDecision = async (decisionId: string, branchId: string) => {
    try {
      const postConfidence = 4; // Default value
      await apiClient.resolveDecision(decisionId, {
        decisionId,
        finalBranchId: branchId,
        postConfidence,
        createSubDecision: false,
      });
      toast.success('Decision resolved successfully!');
      await loadDecision(); // Refresh the data
    } catch (error) {
      console.error('Error resolving decision:', error);
      toast.error('Failed to resolve decision');
    }
  };

  const handleCreateSubDecision = async (parentDecisionId: string, parentBranchId: string) => {
    if (!subDecisionTitle.trim()) {
      toast.error('Please enter a title for the sub-decision');
      return;
    }

    try {
      await apiClient.resolveDecision(parentDecisionId, {
        decisionId: parentDecisionId,
        finalBranchId: parentBranchId,
        postConfidence: 4,
        createSubDecision: true,
        subDecisionTitle: subDecisionTitle,
        subDecisionDescription: subDecisionDescription,
      });
      
      toast.success('Sub-decision created successfully!');
      setShowCreateSubDecision(false);
      setSubDecisionTitle('');
      setSubDecisionDescription('');
      await loadDecision(); // Refresh the data
    } catch (error) {
      console.error('Error creating sub-decision:', error);
      toast.error('Failed to create sub-decision');
    }
  };

  const handleSelectDecision = (decisionId: string) => {
    navigate(`/decisions/${decisionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Loading decision...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">Decision not found</h1>
            <Button onClick={() => navigate('/decisions')}>Back to Decisions</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/decisions')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">{decision.title}</h1>
              <p className="text-secondary-600 mt-1">
                Created {formatDate(decision.createdAt)} • Pre-confidence: {decision.preConfidence}/5
              </p>
            </div>
          </div>
          
          {branches.length >= 2 && decision.state === 'ACTIVE' && (
            <Button
              onClick={() => navigate(`/decisions/${id}/compare`)}
              size="lg"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Compare Branches
            </Button>
          )}
        </div>


        {/* Decision Tree Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Decision Tree</h2>
          <p className="text-secondary-600">
            Explore your decision paths and get AI-powered insights
          </p>
        </div>

        {/* Create Sub-Decision Modal */}
        {showCreateSubDecision && (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold text-secondary-900">Create Sub-Decision</h3>
              <p className="text-secondary-600">Create a new decision stemming from your current choice</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Sub-Decision Title
                  </label>
                  <input
                    type="text"
                    value={subDecisionTitle}
                    onChange={(e) => setSubDecisionTitle(e.target.value)}
                    placeholder="e.g., Which major should I pursue at Stanford?"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={subDecisionDescription}
                    onChange={(e) => setSubDecisionDescription(e.target.value)}
                    placeholder="Describe what this sub-decision is about..."
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      const selectedBranch = branches.find(b => b.branchId === decision.parentBranchId);
                      if (selectedBranch) {
                        handleCreateSubDecision(decision.decisionId, selectedBranch.branchId);
                      }
                    }}
                    disabled={!subDecisionTitle.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Sub-Decision
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateSubDecision(false);
                      setSubDecisionTitle('');
                      setSubDecisionDescription('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Decision Tree Content */}
        <div className="space-y-6">
          {/* Tree Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">Decision Tree</h3>
              <p className="text-secondary-600">
                Visualize your decision hierarchy and create sub-decisions
              </p>
            </div>
            {decision?.state === 'COMMITTED' && (
              <Button
                onClick={() => setShowCreateSubDecision(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Sub-Decision
              </Button>
            )}
          </div>

          {/* Interactive Decision Tree */}
          <DecisionTree
            decision={decision!}
            branches={branches}
            onBranchSelect={(branchId) => {
              const branch = branches.find(b => b.branchId === branchId);
              if (branch) {
                toast.success(`Selected branch: ${branch.name}`);
              }
            }}
            onSimulateBranch={handleSimulate}
            onCreateBranch={handleCreateBranch}
          />
        </div>
      </div>
    </div>
  );
};