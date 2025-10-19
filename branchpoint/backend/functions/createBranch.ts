import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { getItem, putItem } from './utils/dynamodb';
import { createCreatedResponse, createErrorResponse } from './utils/response';
import { CreateBranchRequest, Branch } from './types';

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

    const requestBody: CreateBranchRequest = JSON.parse(event.body);
    
    if (!requestBody.name) {
      return createErrorResponse(400, 'Branch name is required');
    }

    // Verify the decision exists and belongs to the user
    const decision = await getItem(process.env.DECISIONS_TABLE!, {
      DecisionId: decisionId,
      UserId: userId,
    });

    if (!decision) {
      return createErrorResponse(404, 'Decision not found');
    }

    const branchId = uuidv4();
    const now = new Date().toISOString();

    const branch = {
      BranchId: branchId,
      DecisionId: decisionId,
      Name: requestBody.name,
      Description: requestBody.description || '',
      CreatedAt: now,
    };

    await putItem(process.env.BRANCHES_TABLE!, branch);

    return createCreatedResponse({
      branchId,
      decisionId,
      createdAt: now,
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};
