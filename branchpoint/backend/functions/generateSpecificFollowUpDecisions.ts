import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { generateSpecificFollowUpDecisions } from './utils/bedrock';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Generate specific follow-up decisions request:', JSON.stringify(event, null, 2));

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const requestBody = JSON.parse(event.body);
    const { originalDecision, chosenPath, broadCategory, simulationResult } = requestBody;

    if (!originalDecision || !chosenPath || !broadCategory) {
      return createErrorResponse(400, 'Original decision, chosen path, and broad category are required');
    }

    console.log('Generating specific follow-up decisions for:', { originalDecision, chosenPath, broadCategory });

    // Use Claude to generate specific follow-up decisions
    const result = await generateSpecificFollowUpDecisions(originalDecision, chosenPath, broadCategory, simulationResult);

    console.log('Generated specific follow-up decisions:', result);

    return createSuccessResponse(result);
  } catch (error) {
    console.error('Error generating specific follow-up decisions:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};



