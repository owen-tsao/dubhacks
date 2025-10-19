import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { getItem, putItem, updateItem, docClient } from './utils/dynamodb';
import { ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { generateSimulation } from './utils/bedrock';
import { SimulateRequest, Conversation, SimulationOutput } from './types';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // For demo purposes, use a mock user ID
    const userId = event.headers['x-user-id'] || `user_${Date.now()}`;

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const requestBody: SimulateRequest = JSON.parse(event.body);
    
    console.log('Simulate request body:', requestBody);
    
    if (!requestBody.branchId) {
      return createErrorResponse(400, 'Branch ID is required');
    }

    // Get the branch - we need to scan since we only have BranchId
    console.log('Looking for branch with ID:', requestBody.branchId);
    
    // Scan the table to find the branch by BranchId
    const scanResult = await docClient.send(new ScanCommand({
      TableName: process.env.BRANCHES_TABLE!,
      FilterExpression: 'BranchId = :branchId',
      ExpressionAttributeValues: {
        ':branchId': { S: requestBody.branchId }
      }
    }));
    
    const branch = scanResult.Items?.[0];
    
    console.log('Found branch:', branch);

    if (!branch) {
      return createErrorResponse(404, 'Branch not found');
    }

    // Extract values from DynamoDB format
    const branchId = branch.BranchId?.S;
    const decisionId = branch.DecisionId?.S;
    const branchName = branch.Name?.S;
    const branchDescription = branch.Description?.S;

    console.log('Extracted branch data:', { branchId, decisionId, branchName, branchDescription });

    // Get the decision to access title using scan (since we have composite key)
    console.log('Looking for decision with:', { DecisionId: decisionId, UserId: userId });
    const decisionScanResult = await docClient.send(new ScanCommand({
      TableName: process.env.DECISIONS_TABLE!,
      FilterExpression: 'DecisionId = :decisionId AND UserId = :userId',
      ExpressionAttributeValues: {
        ':decisionId': { S: decisionId || '' },
        ':userId': { S: userId || '' }
      }
    }));
    
    const decision = decisionScanResult.Items?.[0];
    console.log('Found decision:', decision);

    if (!decision) {
      return createErrorResponse(404, 'Decision not found');
    }

    // Extract decision data from DynamoDB format
    const decisionTitle = decision.Title?.S;
    console.log('Extracted decision title:', decisionTitle);

    console.log('About to call generateSimulation with:', {
      decisionTitle: decisionTitle,
      branchName: branchName,
      branchDescription: branchDescription,
      personaStyle: requestBody.personaStyle || 'analytical'
    });

    // Generate simulation using Bedrock
    const bedrockResponse = await generateSimulation(
      decisionTitle || 'Unknown Decision',
      branchName || 'Unknown Branch',
      branchDescription || 'No description',
      requestBody.personaStyle || 'analytical'
    );

    console.log('Bedrock response received:', bedrockResponse);

    const simulationOutput: SimulationOutput = {
      questions: bedrockResponse.questions,
      optimisticScenario: bedrockResponse.optimistic_scenario,
      challengingScenario: bedrockResponse.challenging_scenario,
      summary: bedrockResponse.summary,
      personaStyle: requestBody.personaStyle || 'analytical',
      confidenceDeltaRecommendation: bedrockResponse.confidence_delta_recommendation,
    };

    // Create or update conversation
    const conversationId = uuidv4();
    const now = new Date().toISOString();

    const conversation = {
      ConversationId: conversationId,
      BranchId: requestBody.branchId,
      Messages: [
        {
          MessageId: uuidv4(),
          Sender: 'future-you',
          Text: `I'm Future-You, one year from now. I chose the "${branchName}" path for "${decisionTitle}". Let me share what I learned...`,
          CreatedAt: now,
        },
        {
          MessageId: uuidv4(),
          Sender: 'future-you',
          Text: `Here are some questions that would have helped me make this choice: ${simulationOutput.questions.join(', ')}`,
          CreatedAt: now,
        },
        {
          MessageId: uuidv4(),
          Sender: 'future-you',
          Text: `Optimistic scenario: ${simulationOutput.optimisticScenario}`,
          CreatedAt: now,
        },
        {
          MessageId: uuidv4(),
          Sender: 'future-you',
          Text: `Challenging scenario: ${simulationOutput.challengingScenario}`,
          CreatedAt: now,
        },
        {
          MessageId: uuidv4(),
          Sender: 'future-you',
          Text: `Summary: ${simulationOutput.summary}`,
          CreatedAt: now,
        },
      ],
      SimulationOutput: simulationOutput,
      CreatedAt: now,
      UpdatedAt: now,
    };

    await putItem(process.env.CONVERSATIONS_TABLE!, conversation);

    // Update branch with simulation timestamp using low-level client
    if (decisionId) {
      await docClient.send(new UpdateItemCommand({
        TableName: process.env.BRANCHES_TABLE!,
        Key: {
          BranchId: { S: requestBody.branchId },
          DecisionId: { S: decisionId }
        },
        UpdateExpression: 'SET LastSimulatedAt = :timestamp',
        ExpressionAttributeValues: {
          ':timestamp': { S: now }
        }
      }));
    }

    return createSuccessResponse({
      conversationId,
      simulationOutput,
      messages: conversation.Messages,
    });
  } catch (error) {
    console.error('Error simulating branch:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};
