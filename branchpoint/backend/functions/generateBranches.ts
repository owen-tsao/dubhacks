import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { generateBranches } from './utils/bedrock';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Generate branches request:', JSON.stringify(event, null, 2));

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const requestBody = JSON.parse(event.body);
    const { decisionTitle, decisionDescription } = requestBody;

    if (!decisionTitle) {
      return createErrorResponse(400, 'Decision title is required');
    }

    console.log('Generating branches for:', { decisionTitle, decisionDescription });

    // Use Claude to generate intelligent branches
    const branches = await generateBranches(decisionTitle, decisionDescription || '');

    console.log('Generated branches:', branches);

    return createSuccessResponse({
      branches: branches.branches.map(branch => ({
        branchId: uuidv4(),
        name: branch.name,
        description: branch.description
      }))
    });
  } catch (error) {
    console.error('Error generating branches:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};


