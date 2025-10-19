import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { queryItems } from './utils/dynamodb';
import { createSuccessResponse, createErrorResponse } from './utils/response';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // For demo purposes, use a mock user ID
    const userId = event.headers['x-user-id'] || `user_${Date.now()}`;

    const decisions = await queryItems(
      process.env.DECISIONS_TABLE!,
      'UserId = :userId',
      { ':userId': userId },
      'UserIndex'
    );

    // Sort by creation date (newest first)
    decisions.sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());

    // Transform data to camelCase for frontend compatibility
    const transformedDecisions = decisions.map(decision => ({
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
    }));

    return createSuccessResponse({
      decisions: transformedDecisions,
      count: transformedDecisions.length,
    });
  } catch (error) {
    console.error('Error listing decisions:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};
