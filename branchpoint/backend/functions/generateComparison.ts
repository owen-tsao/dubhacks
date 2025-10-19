import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { getItem, queryItems, putItem } from './utils/dynamodb';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { generateComparison } from './utils/bedrock';
import { Branch, SimulationOutput } from './types';

interface BranchWithSimulation extends Branch {
  simulation: SimulationOutput | null;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // For demo purposes, use a mock user ID
    const userId = event.headers['x-user-id'] || `user_${Date.now()}`;

    const decisionId = event.pathParameters?.id;
    if (!decisionId) {
      return createErrorResponse(400, 'Decision ID is required');
    }

    // Get the decision
    const decision = await getItem(process.env.DECISIONS_TABLE!, {
      DecisionId: decisionId,
      UserId: userId,
    });

    if (!decision) {
      return createErrorResponse(404, 'Decision not found');
    }

    // Get all branches for this decision
    const branches = await queryItems(
      process.env.BRANCHES_TABLE!,
      'DecisionId = :decisionId',
      { ':decisionId': decisionId },
      'DecisionIndex'
    );

    if (branches.length < 2) {
      return createErrorResponse(400, 'At least 2 branches are required for comparison');
    }

    // Get conversations for each branch
    const branchesWithSimulations = await Promise.all(
      branches.map(async (branch) => {
        const conversations = await queryItems(
          process.env.CONVERSATIONS_TABLE!,
          'BranchId = :branchId',
          { ':branchId': branch.branchId }
        );
        
        const latestConversation = conversations
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        return {
          ...branch,
          simulation: latestConversation?.simulationOutput || null,
        };
      })
    );

    // Filter branches that have simulations
    const simulatedBranches = branchesWithSimulations.filter(b => b.simulation) as BranchWithSimulation[];

    if (simulatedBranches.length < 2) {
      return createErrorResponse(400, 'At least 2 branches must be simulated before comparison');
    }

    // Generate comparison using mocked Bedrock
    const comparisonResult = await generateComparison(
      decision.title,
      simulatedBranches.slice(0, 2).map(branch => ({
        name: branch.name,
        description: branch.description,
        simulation: branch.simulation
      }))
    );

    // Save comparison to database
    const comparisonId = uuidv4();
    const now = new Date().toISOString();

    const comparison = {
      comparisonId,
      decisionId,
      branchesCompared: simulatedBranches.slice(0, 2).map(b => b.branchId),
      generatedDiff: comparisonResult,
      createdAt: now,
    };

    await putItem(process.env.COMPARISONS_TABLE!, comparison);

    return createSuccessResponse({
      comparisonId,
      generatedDiff: comparisonResult,
      branches: simulatedBranches.slice(0, 2),
    });
  } catch (error) {
    console.error('Error generating comparison:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};
