import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getItem, queryItems } from './utils/dynamodb';
import { createSuccessResponse, createErrorResponse } from './utils/response';

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

    // Transform branches to camelCase (conversations will be empty for now)
    const branchesWithConversations = branches.map(branch => ({
      branchId: branch.BranchId,
      decisionId: branch.DecisionId,
      name: branch.Name,
      description: branch.Description,
      createdAt: branch.CreatedAt,
      lastSimulatedAt: branch.LastSimulatedAt,
      conversations: [], // TODO: Implement conversations query with proper GSI
    }));

    // Transform decision data to camelCase
    const transformedDecision = {
      decisionId: decision.DecisionId,
      userId: decision.UserId,
      title: decision.Title,
      description: decision.Description,
      preConfidence: decision.PreConfidence,
      postConfidence: decision.PostConfidence,
      state: decision.State,
      createdAt: decision.CreatedAt,
      parentDecisionId: decision.ParentDecisionId,
      parentBranchId: decision.ParentBranchId,
      isRootDecision: decision.IsRootDecision,
      resolvedAt: decision.ResolvedAt,
    };

    return createSuccessResponse({
      decision: transformedDecision,
      branches: branchesWithConversations,
    });
  } catch (error) {
    console.error('Error getting decision:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};
