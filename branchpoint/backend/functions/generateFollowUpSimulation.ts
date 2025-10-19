import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { generateFollowUpSimulation } from './utils/bedrock';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Generate follow-up simulation request:', JSON.stringify(event, null, 2));

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const requestBody = JSON.parse(event.body);
    const { originalDecision, followUpName, followUpDescription } = requestBody;

    if (!originalDecision || !followUpName) {
      return createErrorResponse(400, 'Original decision and follow-up name are required');
    }

    console.log('Generating follow-up simulation for:', { originalDecision, followUpName });

    // Use Claude to generate detailed follow-up simulation
    const result = await generateFollowUpSimulation(originalDecision, followUpName, followUpDescription);

    console.log('Generated follow-up simulation:', result);

    return createSuccessResponse({ simulation: result });
  } catch (error) {
    console.error('Error generating follow-up simulation:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};



