import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem } from './utils/dynamodb';
import { createCreatedResponse, createErrorResponse } from './utils/response';
import { CreateDecisionRequest, Decision } from './types';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // For demo purposes, use a mock user ID
    const userId = event.headers['x-user-id'] || `user_${Date.now()}`;

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const requestBody: CreateDecisionRequest = JSON.parse(event.body);
    
    if (!requestBody.title) {
      return createErrorResponse(400, 'Title is required');
    }

    const decisionId = uuidv4();
    const now = new Date().toISOString();

    const decision = {
      DecisionId: decisionId,
      UserId: userId,
      Title: requestBody.title,
      Description: requestBody.description || '',
      PreConfidence: requestBody.preConfidence || 3,
      State: 'DRAFT',
      CreatedAt: now,
    };

    console.log('Decision object:', JSON.stringify(decision, null, 2));
    console.log('Table name:', process.env.DECISIONS_TABLE);

    await putItem(process.env.DECISIONS_TABLE!, decision);

    return createCreatedResponse({
      decisionId,
      createdAt: now,
    });
  } catch (error) {
    console.error('Error creating decision:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};
