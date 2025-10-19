import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { generateFollowUpDecisions } from './utils/bedrock';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Generate follow-up decisions request:', JSON.stringify(event, null, 2));

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const requestBody = JSON.parse(event.body);
    const { originalDecision, chosenPath, simulationResult } = requestBody;

    if (!originalDecision || !chosenPath) {
      return createErrorResponse(400, 'Original decision and chosen path are required');
    }

    console.log('Generating follow-up decisions for:', { originalDecision, chosenPath });

    // Use Claude to generate storyline and follow-up decisions
    const result = await generateFollowUpDecisions(originalDecision, chosenPath, simulationResult);

    console.log('Generated follow-up decisions:', result);

    return createSuccessResponse(result);
  } catch (error) {
    console.error('Error generating follow-up decisions:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};



