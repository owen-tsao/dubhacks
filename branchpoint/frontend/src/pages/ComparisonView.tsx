import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ComparisonDiff } from '../components/ComparisonDiff';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Decision, Branch } from '../types';
import { apiClient } from '../api';
import { ArrowLeft, BarChart3, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ComparisonView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommitting, setIsCommitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadComparison();
    }
  }, [id]);

  const loadComparison = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.generateComparison(id!);
      setComparisonData(response);
      setBranches(response.branches);
      
      // Also load the decision details
      const decisionResponse = await apiClient.getDecision(id!);
      setDecision(decisionResponse.decision);
    } catch (error) {
      console.error('Error loading comparison:', error);
      toast.error('Failed to load comparison');
      navigate(`/decisions/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async (finalBranchId: string) => {
    try {
      setIsCommitting(true);
      const postConfidence = 4; // Default value, in real app this would come from the form
      const response = await apiClient.commitDecision(id!, {
        finalBranchId,
        postConfidence,
      });
      
      toast.success('Decision committed successfully!');
      navigate(`/decisions/${id}`, { 
        state: { 
          committed: true, 
          confidenceDelta: response.confidenceDelta 
        } 
      });
    } catch (error) {
      console.error('Error committing decision:', error);
      toast.error('Failed to commit decision');
    } finally {
      setIsCommitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Generating comparison...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!comparisonData || !decision) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">Comparison not available</h1>
            <p className="text-secondary-600 mb-6">
              Make sure you have at least 2 simulated branches before comparing.
            </p>
            <Button onClick={() => navigate(`/decisions/${id}`)}>
              Back to Decision
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/decisions/${id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Decision
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3" />
                Decision Comparison
              </h1>
              <p className="text-secondary-600 mt-1">
                {decision.title}
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-900">Ready to Compare</h3>
                <p className="text-green-700 text-sm">
                  AI has analyzed your branches and generated a comprehensive comparison
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Results */}
        <ComparisonDiff
          generatedDiff={comparisonData.generatedDiff}
          branches={branches}
          onCommit={handleCommit}
          isCommitting={isCommitting}
        />

        {/* Additional Info */}
        <Card className="mt-8">
          <CardHeader>
            <h3 className="text-lg font-semibold text-secondary-900">About This Analysis</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-secondary-600">
              <p>
                This comparison was generated using AI to analyze the tradeoffs, potential conflicts, 
                and recommendations between your decision branches. The analysis considers:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Time investment and opportunity costs</li>
                <li>Risk vs. stability factors</li>
                <li>Personal growth and fulfillment potential</li>
                <li>Financial implications</li>
                <li>Impact on relationships and lifestyle</li>
              </ul>
              <p>
                Remember: This is a tool to help you think through your decision. 
                The final choice is always yours to make.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};