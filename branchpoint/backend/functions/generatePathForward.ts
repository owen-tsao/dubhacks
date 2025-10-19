import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { generatePathForward } from './utils/bedrock';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Generate path forward request:', JSON.stringify(event, null, 2));

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const requestBody = JSON.parse(event.body);
    const { originalDecision, chosenPath, pathDescription } = requestBody;

    if (!originalDecision || !chosenPath || !pathDescription) {
      return createErrorResponse(400, 'Original decision, chosen path, and path description are required');
    }

    console.log('Generating path forward for:', { originalDecision, chosenPath, pathDescription });

    const pathForward = await generatePathForward(originalDecision, chosenPath, pathDescription);

    console.log('Generated path forward:', pathForward);

    return createSuccessResponse({ pathForward });
  } catch (error) {
    console.error('Error generating path forward:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};



