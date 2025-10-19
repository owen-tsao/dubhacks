import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { getItem, updateItem, putItem } from './utils/dynamodb';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { CommitDecisionRequest } from './types';

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

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const requestBody: CommitDecisionRequest = JSON.parse(event.body);
    
    if (!requestBody.finalBranchId) {
      return createErrorResponse(400, 'Final branch ID is required');
    }

    if (!requestBody.postConfidence || requestBody.postConfidence < 1 || requestBody.postConfidence > 5) {
      return createErrorResponse(400, 'Post-confidence must be between 1 and 5');
    }

    // Get the decision
    const decision = await getItem(process.env.DECISIONS_TABLE!, {
      DecisionId: decisionId,
      UserId: userId,
    });

    if (!decision) {
      return createErrorResponse(404, 'Decision not found');
    }

    // Verify the final branch exists
    const finalBranch = await getItem(process.env.BRANCHES_TABLE!, {
      BranchId: requestBody.finalBranchId,
    });

    if (!finalBranch || finalBranch.decisionId !== decisionId) {
      return createErrorResponse(404, 'Final branch not found or does not belong to this decision');
    }

    // Update decision to COMMITTED state
    await updateItem(
      process.env.DECISIONS_TABLE!,
      { DecisionId: decisionId, UserId: userId },
      'SET #state = :state, postConfidence = :postConfidence, updatedAt = :updatedAt',
      {
        ':state': 'COMMITTED',
        ':postConfidence': requestBody.postConfidence,
        ':updatedAt': new Date().toISOString(),
      },
      { '#state': 'state' }
    );

    // Log commit event
    const eventId = uuidv4();
    const now = new Date().toISOString();

    const commitEvent = {
      eventId,
      userId,
      type: 'METRIC',
      payload: {
        event: 'commit',
        decisionId,
        finalBranchId: requestBody.finalBranchId,
        preConfidence: decision.preConfidence,
        postConfidence: requestBody.postConfidence,
        confidenceDelta: requestBody.postConfidence - decision.preConfidence,
        decisionTitle: decision.title,
        finalBranchName: finalBranch.name,
      },
      createdAt: now,
    };

    await putItem(process.env.EVENTS_TABLE!, commitEvent);

    // TODO: Send event to Statsig
    console.log('Statsig event:', {
      event: 'commit',
      userId,
      properties: commitEvent.payload,
    });

    return createSuccessResponse({
      status: 'committed',
      decisionId,
      finalBranchId: requestBody.finalBranchId,
      preConfidence: decision.preConfidence,
      postConfidence: requestBody.postConfidence,
      confidenceDelta: requestBody.postConfidence - decision.preConfidence,
    });
  } catch (error) {
    console.error('Error committing decision:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};
