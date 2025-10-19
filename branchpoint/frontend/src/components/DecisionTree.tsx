import React, { useState, useEffect } from 'react';
import { Branch, Decision } from '../types';
import { apiClient } from '../api';
import { Brain, ArrowRight, ArrowDown, Plus, Zap, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { InteractiveDecisionFlow } from './InteractiveDecisionFlow';

interface DecisionTreeProps {
  decision: Decision;
  branches: Branch[];
  onBranchSelect?: (branchId: string) => void;
  onSimulateBranch?: (branchId: string, personaStyle: 'analytical' | 'empathetic') => void;
  onCreateBranch?: (data: { name: string; description: string }) => void;
}

interface TreeNode {
  id: string;
  type: 'decision' | 'branch';
  title: string;
  description: string;
  confidence?: number;
  children: TreeNode[];
  x: number;
  y: number;
  isSelected?: boolean;
  isSimulated?: boolean;
  simulationResult?: any;
}

export const DecisionTree: React.FC<DecisionTreeProps> = ({
  decision,
  branches,
  onBranchSelect,
  onSimulateBranch,
  onCreateBranch
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<{nodeId: string, type: 'analytical' | 'empathetic'} | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tree' | 'interactive'>('tree');
  const [isGeneratingBranches, setIsGeneratingBranches] = useState(false);
  const [generatedBranches, setGeneratedBranches] = useState<Branch[]>([]);

  useEffect(() => {
    buildTree();
  }, [decision, branches]);

  useEffect(() => {
    // Rebuild tree when generated branches are created
    if (generatedBranches.length > 0) {
      buildTree();
    }
  }, [generatedBranches]);

  const buildTree = () => {
    const rootNode: TreeNode = {
      id: decision.decisionId,
      type: 'decision',
      title: decision.title,
      description: decision.description,
      confidence: decision.preConfidence,
      children: [],
      x: 0,
      y: 0
    };

    // Add branches as children
    branches.forEach((branch, index) => {
      const branchNode: TreeNode = {
        id: branch.branchId,
        type: 'branch',
        title: branch.name,
        description: branch.description,
        children: [],
        x: (index - (branches.length - 1) / 2) * 200,
        y: 150
      };
      rootNode.children.push(branchNode);
    });

    setTreeData([rootNode]);
  };

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId);
    setSelectedNode(nodeId);
    if (onBranchSelect) {
      onBranchSelect(nodeId);
    }
    
    // Find the branch and show info
    const branch = branches.find(b => b.branchId === nodeId);
    if (branch) {
      toast.success(`Selected: ${branch.name}`);
    } else {
      toast.success(`Selected node: ${nodeId}`);
    }
  };

  const handleSimulate = async (branchId: string, personaStyle: 'analytical' | 'empathetic') => {
    try {
      setIsSimulating({nodeId: branchId, type: personaStyle});
      
      // Find the branch to get its name and description
      const branch = branches.find(b => b.branchId === branchId);
      const branchName = branch?.name || 'Selected Branch';
      const branchDescription = branch?.description || 'A decision branch';
      
      // Check if this is an AI-generated branch by looking at the branch name patterns
      const isAIGenerated = branchName.includes('Yes - Take Action') || 
                           branchName.includes('No - Wait or Decline') ||
                           branchName.includes('Conservative - $') ||
                           branchName.includes('Aggressive - $') ||
                           branchName.includes('Option A -') ||
                           branchName.includes('Option B -') ||
                           branchName.includes('Proceed -') ||
                           branchName.includes('Pause -');
      
      if (isAIGenerated) {
        // Use real API simulation for AI-generated branches too
        console.log('Using real API for AI-generated branch:', branchName);
        
        // Use the decision's userId for the API call
        const response = await apiClient.simulateBranch({
          branchId: branchId,
          personaStyle: personaStyle
        }, decision.userId);
        
        // Extract simulation data from response
        const simulationData = response.simulationOutput;
        
        // Update the node with simulation result
        setTreeData(prev => updateNodeWithSimulation(prev, branchId, simulationData));
        
        // Generate AI suggestion
        generateAISuggestion(branchId, simulationData);
        
        toast.success('Simulation completed!');
      } else {
        // Use real API simulation for manual branches (with debugging)
        console.log('Using real API for manual branch:', branchName);
        const response = await apiClient.simulateBranch({
          branchId: branchId,
          personaStyle: personaStyle
        }, decision.userId);
        
        // Extract simulation data from response
        const simulationData = response.simulationOutput;
        
        // Update the node with simulation result
        setTreeData(prev => updateNodeWithSimulation(prev, branchId, simulationData));
        
        // Generate AI suggestion
        generateAISuggestion(branchId, simulationData);
        
        toast.success('Simulation completed!');
      }
    } catch (error) {
      console.error('Error simulating branch:', error);
      toast.error('Failed to simulate branch');
    } finally {
      setIsSimulating(null);
    }
  };

  const updateNodeWithSimulation = (nodes: TreeNode[], branchId: string, simulation: any): TreeNode[] => {
    return nodes.map(node => {
      if (node.id === branchId) {
        return {
          ...node,
          isSimulated: true,
          simulationResult: simulation
        };
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: updateNodeWithSimulation(node.children, branchId, simulation)
        };
      }
      return node;
    });
  };

  const generateAISuggestion = async (branchId: string, simulation: any) => {
    try {
      // Use the actual simulation data to generate a contextual AI insight
      if (simulation && simulation.summary) {
        // Extract key insights from the simulation
        const confidenceDelta = simulation.confidenceDeltaRecommendation || 0;
        const isPositive = confidenceDelta > 0;
        
        let insight = "";
        if (isPositive) {
          insight = `🎯 AI Insight: ${simulation.summary} This path shows ${Math.abs(confidenceDelta * 100).toFixed(0)}% confidence boost potential.`;
        } else {
          insight = `⚠️ AI Insight: ${simulation.summary} This path may require careful consideration.`;
        }
        
        setAiSuggestion(insight);
      } else {
        // Fallback to generic suggestion if no simulation data
        setAiSuggestion("AI is analyzing your decision path...");
      }
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      setAiSuggestion("AI analysis in progress...");
    }
  };

  const generateMockSimulation = async (decisionTitle: string, branchName: string, branchDescription: string, personaStyle: 'analytical' | 'empathetic' = 'analytical') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const decisionTitleLower = decisionTitle.toLowerCase();
    
    // Generate context-specific responses based on the choice and decision
    let optimisticScenario, challengingScenario, summary, confidenceDelta;
    
    if (decisionTitleLower.includes('invest') && decisionTitleLower.includes('money')) {
      const isConservative = branchName.toLowerCase().includes('conservative') || branchName.includes('1000');
      const isAggressive = branchName.toLowerCase().includes('aggressive') || branchName.includes('10000');
      
      if (isConservative) {
        optimisticScenario = `By choosing the conservative investment approach, you've prioritized financial stability and peace of mind. In the best case, your $1000 investment grows steadily over time, providing a solid foundation for future financial goals without the stress of market volatility. You sleep better at night knowing your money is relatively safe.`;
        challengingScenario = `The main challenge with conservative investing is that your returns may not keep pace with inflation, and you might miss out on significant growth opportunities. You may feel frustrated watching others achieve higher returns, and your money might not grow as quickly as you'd hoped.`;
        summary = `This conservative choice shows financial prudence and risk awareness. It's perfect if you value stability over growth and want to protect your capital.`;
        confidenceDelta = 0.3;
      } else if (isAggressive) {
        optimisticScenario = `By choosing aggressive investing, you're positioning yourself for potentially significant returns. In the best case, your $10,000 investment could grow substantially, potentially doubling or tripling over time. You're taking calculated risks that could pay off handsomely and accelerate your wealth building.`;
        challengingScenario = `The main challenge is dealing with market volatility and potential losses. You might see your investment drop significantly during market downturns, which can be emotionally difficult. You'll need to stay committed during tough times and not panic-sell.`;
        summary = `This aggressive choice shows confidence in your risk tolerance and long-term vision. It's ideal if you can handle volatility and have time to recover from potential losses.`;
        confidenceDelta = 0.1;
      }
    } else if (decisionTitleLower.includes('quit') && decisionTitleLower.includes('job')) {
      const isQuit = branchName.toLowerCase().includes('quit') || branchName.toLowerCase().includes('yes');
      
      if (isQuit) {
        optimisticScenario = `By choosing to quit your job, you're taking control of your career and opening doors to new opportunities. In the best case, you find a better position with higher pay, better work-life balance, or pursue your passion. You feel liberated and excited about the future possibilities.`;
        challengingScenario = `The main challenges include financial uncertainty during the job search, potential gaps in employment, and the stress of finding a new position. You might face rejection and need to be patient while building new connections and skills.`;
        summary = `This bold choice shows courage and self-advocacy. It's perfect if you're ready for change and have a plan for your next steps.`;
        confidenceDelta = 0.4;
      } else {
        optimisticScenario = `By choosing to stay in your current job, you're prioritizing stability and security. In the best case, you can work on improving your current situation, negotiate better terms, or develop new skills while maintaining your income. You avoid the stress of job searching and maintain your routine.`;
        challengingScenario = `The main challenge is that you might feel stuck or unfulfilled, and the same problems that made you consider quitting will likely persist. You might miss out on better opportunities and feel regret later.`;
        summary = `This cautious choice shows practical thinking and risk management. It's ideal if you need more time to plan or have financial constraints.`;
        confidenceDelta = -0.1;
      }
    } else {
      // Generic but still choice-specific responses
      const isPositiveChoice = branchName.toLowerCase().includes('yes') || 
                              branchName.toLowerCase().includes('proceed') || 
                              branchName.toLowerCase().includes('take') ||
                              branchName.toLowerCase().includes('go');
      
      if (isPositiveChoice) {
        optimisticScenario = `By choosing "${branchName}", you're taking a proactive step toward your goals. In the best case, this decision opens up new opportunities, helps you grow personally and professionally, and brings you closer to the life you want to live. You feel empowered and excited about the future.`;
        challengingScenario = `The main challenges with this choice include dealing with uncertainty, potential setbacks, and the need to stay committed when things get difficult. You might face resistance from others or unexpected obstacles that test your resolve.`;
        summary = `This choice demonstrates your willingness to take action and make decisions that align with your values. It shows courage and self-awareness in pursuing what matters to you.`;
        confidenceDelta = 0.4;
      } else {
        optimisticScenario = `By choosing "${branchName}", you're taking a cautious and thoughtful approach. In the best case, this decision protects you from potential risks while still allowing for growth and opportunity. You feel secure and confident in your measured approach.`;
        challengingScenario = `The main challenges with this choice include potential missed opportunities and the risk of being too conservative. You might wonder if you're being overly cautious and whether you're limiting your potential for growth.`;
        summary = `This choice demonstrates careful consideration and risk management. It shows wisdom in taking a measured approach and prioritizing stability over rapid change.`;
        confidenceDelta = 0.2;
      }
    }
    
    return {
      questions: [
        "What specific challenges might you face with this choice?",
        "How will this decision impact your daily life and relationships?",
        "What opportunities might this open up for you in the next 6 months?"
      ],
      optimisticScenario,
      challengingScenario,
      summary,
      confidenceDeltaRecommendation: confidenceDelta
    };
  };

  const generateAIBranches = async () => {
    try {
      setIsGeneratingBranches(true);
      
      // Use Claude to generate intelligent branches
      const response = await apiClient.generateBranches(decision.title, decision.description || '');
      const aiBranches = response.branches;
      
      console.log('Claude generated branches:', aiBranches);
      
      // Convert to Branch format
      const branches = aiBranches.map(branch => ({
        branchId: branch.branchId,
        decisionId: decision.decisionId,
        name: branch.name,
        description: branch.description,
        createdAt: new Date().toISOString()
      }));
      
      setGeneratedBranches(branches);
      
      // Auto-create the branches
      for (const branch of branches) {
        if (onCreateBranch) {
          await onCreateBranch({
            name: branch.name,
            description: branch.description
          });
        }
      }
      
      toast.success('Claude has generated intelligent decision branches for you!');
    } catch (error) {
      console.error('Error generating AI branches:', error);
      toast.error('Failed to generate AI branches');
      
      // Fallback to local generation
      console.log('Falling back to local branch generation');
      const branches = generateBranchesFromQuestion(decision.title, decision.description);
      setGeneratedBranches(branches);
      
      // Auto-create the branches
      for (const branch of branches) {
        if (onCreateBranch) {
          await onCreateBranch({
            name: branch.name,
            description: branch.description
          });
        }
      }
      
      toast.success('AI has generated decision branches for you! (fallback mode)');
    } finally {
      setIsGeneratingBranches(false);
    }
  };

  const generateBranchesFromQuestion = (title: string, description: string): Branch[] => {
    const question = title.toLowerCase();
    const desc = description?.toLowerCase() || '';
    
    // Analyze the question type and generate appropriate branches
    // Check for investment/money questions FIRST (most specific)
    if (question.includes('invest') || question.includes('money') || question.includes('put into') || question.includes('spend') || question.includes('budget')) {
      // Extract numbers from description if available
      const numbers = desc.match(/\d+/g);
      const baseAmount = numbers ? parseInt(numbers[0]) : 1000;
      
      return [
        {
          branchId: 'ai-conservative',
          decisionId: decision.decisionId,
          name: `Conservative - $${baseAmount}`,
          description: `Invest a smaller, safer amount of $${baseAmount} to minimize risk`,
          createdAt: new Date().toISOString()
        },
        {
          branchId: 'ai-aggressive',
          decisionId: decision.decisionId,
          name: `Aggressive - $${baseAmount * 10}`,
          description: `Invest a larger amount of $${baseAmount * 10} for potentially higher returns`,
          createdAt: new Date().toISOString()
        }
      ];
    }
    
    // Check for job/career questions
    if (question.includes('quit') && question.includes('job')) {
      return [
        {
          branchId: 'ai-yes',
          decisionId: decision.decisionId,
          name: 'Yes - Quit the Job',
          description: 'Take the leap and leave your current position to pursue new opportunities',
          createdAt: new Date().toISOString()
        },
        {
          branchId: 'ai-no',
          decisionId: decision.decisionId,
          name: 'No - Stay in Current Job',
          description: 'Continue in your current role while looking for ways to improve your situation',
          createdAt: new Date().toISOString()
        }
      ];
    }
    
    // Check for choice/option questions
    if (question.includes('which') || question.includes('choose')) {
      return [
        {
          branchId: 'ai-option-a',
          decisionId: decision.decisionId,
          name: 'Option A - First Choice',
          description: 'Choose the first available option and see where it leads',
          createdAt: new Date().toISOString()
        },
        {
          branchId: 'ai-option-b',
          decisionId: decision.decisionId,
          name: 'Option B - Alternative Path',
          description: 'Go with the alternative approach and explore new possibilities',
          createdAt: new Date().toISOString()
        }
      ];
    }
    
    // Generic yes/no questions (least specific - check last)
    if (question.includes('should i') || question.includes('should we')) {
      return [
        {
          branchId: 'ai-yes',
          decisionId: decision.decisionId,
          name: 'Yes - Take Action',
          description: 'Move forward with this decision and embrace the opportunities it brings',
          createdAt: new Date().toISOString()
        },
        {
          branchId: 'ai-no',
          decisionId: decision.decisionId,
          name: 'No - Wait or Decline',
          description: 'Hold off on this decision and explore alternative options',
          createdAt: new Date().toISOString()
        }
      ];
    }
    
    // Default fallback for any other question type
    return [
      {
        branchId: 'ai-proceed',
        decisionId: decision.decisionId,
        name: 'Proceed - Take Action',
        description: 'Move forward with confidence and embrace the journey ahead',
        createdAt: new Date().toISOString()
      },
      {
        branchId: 'ai-pause',
        decisionId: decision.decisionId,
        name: 'Pause - Wait and Reflect',
        description: 'Take time to gather more information and consider all angles',
        createdAt: new Date().toISOString()
      }
    ];
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isRoot = level === 0;
    const isBranch = node.type === 'branch';
    const isSelected = selectedNode === node.id;
    const isSimulatingNode = isSimulating?.nodeId === node.id;
    const isSimulatingAnalytical = isSimulating?.nodeId === node.id && isSimulating?.type === 'analytical';
    const isSimulatingEmpathetic = isSimulating?.nodeId === node.id && isSimulating?.type === 'empathetic';

  return (
      <div key={node.id} className="relative">
        {/* Node */}
      <div
        className={`
            relative cursor-pointer transition-all duration-200 hover:scale-105
            ${isRoot ? 'w-48' : 'w-48'}
            ${isBranch ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-green-500 to-teal-600'}
            ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
            rounded-xl p-4 text-white shadow-lg
            ${isBranch ? 'h-64 flex flex-col' : ''}
          `}
          onClick={() => handleNodeClick(node.id)}
        >
          {/* Node Header */}
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {isRoot ? (
                <Brain className="w-5 h-5" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span className="font-semibold text-sm">
                {isRoot ? 'Decision' : 'Branch'}
              </span>
          </div>
            {node.isSimulated && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>

          {/* Node Title */}
          <h3 className="font-bold text-sm mb-1">
            {node.title}
        </h3>

          {/* Node Description */}
          <div className="text-xs opacity-90 mb-2 flex-grow overflow-y-auto break-words max-h-20">
            {node.description}
          </div>

          {/* Confidence Score */}
          {node.confidence && (
            <div className="mt-2 flex items-center space-x-1">
              <span className="text-xs">Confidence:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`w-2 h-2 rounded-full ${
                      star <= node.confidence! ? 'bg-yellow-400' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Simulation Button for Branches */}
          {isBranch && (
            <div className="mt-auto space-y-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                  handleSimulate(node.id, 'analytical');
                    }}
                disabled={isSimulatingAnalytical || isSimulatingEmpathetic}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-xs py-1 px-2 rounded transition-colors disabled:opacity-50"
                  >
                {isSimulatingAnalytical ? 'Simulating...' : '🧠 Analyze'}
                  </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
                  handleSimulate(node.id, 'empathetic');
            }}
                disabled={isSimulatingAnalytical || isSimulatingEmpathetic}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-xs py-1 px-2 rounded transition-colors disabled:opacity-50"
          >
                {isSimulatingEmpathetic ? 'Simulating...' : '❤️ Empathize'}
          </button>
            </div>
        )}
      </div>

      {/* Connection Lines - Only render for tree structure, not in our custom layout */}
      {false && node.children.length > 0 && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <ArrowDown className="w-6 h-6 text-gray-400" />
        </div>
      )}

        {/* Children - Disabled for our custom layout */}
        {false && node.children.length > 0 && (
          <div className="flex justify-center space-x-8 mt-8">
          {node.children.map((child, index) => (
              <div key={child.id} className="relative">
                {/* Horizontal Line */}
                {index > 0 && (
                  <div className="absolute top-0 left-0 w-full h-px bg-gray-400 transform -translate-y-4" />
                )}
                {renderNode(child, level + 1)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={() => setViewMode('tree')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'tree'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Brain className="w-4 h-4 mr-2 inline" />
          Tree View
        </button>
        <button
          onClick={() => setViewMode('interactive')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'interactive'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Play className="w-4 h-4 mr-2 inline" />
          Interactive Flow
        </button>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && viewMode === 'tree' && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">AI Insight</h4>
              <p className="text-sm opacity-90">{aiSuggestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'tree' ? (
        <>
          {/* AI Branch Generation */}
          {branches.length === 0 && (
            <div className="rounded-xl p-8 text-center mb-6">
              <Brain className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Let AI Generate Your Decision Branches
              </h3>
              <p className="text-gray-600 mb-6">
                AI will analyze your decision and create 2 relevant options for you to choose from
              </p>
              <button
                onClick={generateAIBranches}
                disabled={isGeneratingBranches}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingBranches ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>AI is thinking...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Generate AI Branches</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tree Visualization */}
          {branches.length > 0 && treeData.length > 0 && (
            <div className="rounded-xl">
              <div className="flex flex-col items-center space-y-6">
                {/* Root Decision Node */}
                {treeData.map(node => (
                  <div key={node.id} className="flex flex-col items-center w-full">
                    <div className="flex justify-center">
                      {renderNode(node)}
                    </div>
                    {/* Single Arrow pointing down */}
                    <div className="mt-4">
                      <ArrowDown className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                ))}
                
                {/* Branch Nodes */}
                <div className="flex flex-wrap justify-center gap-6 w-full">
                  {treeData[0]?.children?.map(node => (
                    <div key={node.id} className="flex-shrink-0">
                      {renderNode(node)}
                    </div>
                  )) || []}
                </div>
              </div>
            </div>
          )}

          {/* Fallback when branches exist but no tree data */}
          {branches.length > 0 && treeData.length === 0 && (
            <div className="rounded-xl p-8 text-center">
              <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Building Your Decision Tree
              </h3>
              <p className="text-gray-600">
                Your branches are being processed. The tree visualization will appear shortly.
              </p>
            </div>
          )}

          {/* Manual Create Branch Button */}
          {onCreateBranch && branches.length > 0 && (
            <div className="text-center">
              <button
                onClick={() => {
                  const name = prompt('Enter branch name:');
                  const description = prompt('Enter branch description:');
                  if (name && description) {
                    onCreateBranch({ name, description });
                  }
                }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Add More Branches</span>
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-gray-600">
            <p className="text-sm">
              {branches.length === 0 
                ? "Click 'Generate AI Branches' to get started with AI-powered decision options"
                : "Click on branches to explore them, or use the simulation buttons to get AI-powered insights"
              }
            </p>
          </div>
        </>
      ) : (
        <InteractiveDecisionFlow
          decision={decision}
          branches={branches}
          onDecisionComplete={(choice, simulation) => {
            toast.success(`Decision completed: ${choice}`);
            console.log('Final simulation:', simulation);
          }}
        />
      )}
    </div>
  );
};