import React from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { GitMerge, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface ComparisonDiffProps {
  generatedDiff: {
    tradeoffs: string[];
    mergeConflicts: string[];
    recommendedMerge: string;
    confidenceImpact: string;
  };
  branches: Array<{ branchId: string; name: string; description: string }>;
  onCommit: (finalBranchId: string) => void;
  isCommitting?: boolean;
}

export const ComparisonDiff: React.FC<ComparisonDiffProps> = ({
  generatedDiff,
  branches,
  onCommit,
  isCommitting,
}) => {
  const [selectedBranch, setSelectedBranch] = React.useState<string>('');
  const [postConfidence, setPostConfidence] = React.useState<number>(3);

  React.useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].branchId);
    }
  }, [branches, selectedBranch]);

  const handleCommit = () => {
    if (selectedBranch) {
      onCommit(selectedBranch);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <GitMerge className="w-5 h-5 mr-2" />
            Decision Comparison & Merge
          </h3>
          <p className="text-secondary-600">
            Review the analysis and commit to your final decision
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tradeoffs */}
            <div>
              <h4 className="font-semibold text-secondary-700 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Key Tradeoffs
              </h4>
              <div className="space-y-2">
                {generatedDiff.tradeoffs.map((tradeoff, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-secondary-700">{tradeoff}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Merge Conflicts */}
            {generatedDiff.mergeConflicts.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Potential Conflicts
                </h4>
                <div className="space-y-2">
                  {generatedDiff.mergeConflicts.map((conflict, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-red-700">{conflict}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Merge */}
            <div>
              <h4 className="font-semibold text-secondary-700 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                AI Recommendation
              </h4>
              <div className="bg-secondary-50 p-4 rounded-lg">
                <p className="text-sm text-secondary-700">{generatedDiff.recommendedMerge}</p>
              </div>
            </div>

            {/* Confidence Impact */}
            <div>
              <h4 className="font-semibold text-secondary-700 mb-3">Confidence Impact</h4>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-primary-700">{generatedDiff.confidenceImpact}</p>
              </div>
            </div>

            {/* Branch Selection */}
            <div>
              <h4 className="font-semibold text-secondary-700 mb-3">Select Final Branch</h4>
              <div className="space-y-3">
                {branches.map((branch) => (
                  <label
                    key={branch.branchId}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedBranch === branch.branchId
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedBranch"
                      value={branch.branchId}
                      checked={selectedBranch === branch.branchId}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-secondary-900">{branch.name}</h5>
                      {branch.description && (
                        <p className="text-sm text-secondary-600 mt-1">{branch.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Post-Confidence Rating */}
            <div>
              <h4 className="font-semibold text-secondary-700 mb-3">Post-Decision Confidence</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-secondary-600">1</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={postConfidence}
                    onChange={(e) => setPostConfidence(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-secondary-600">5</span>
                </div>
                <div className="flex justify-between text-xs text-secondary-500">
                  <span>Not confident</span>
                  <span>Very confident</span>
                </div>
                <p className="text-sm text-secondary-600">
                  Your confidence level: {postConfidence}/5
                </p>
              </div>
            </div>

            {/* Commit Button */}
            <div className="pt-4">
              <Button
                onClick={handleCommit}
                disabled={!selectedBranch || isCommitting}
                size="lg"
                className="w-full"
              >
                {isCommitting ? 'Committing Decision...' : 'Commit Decision'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};