// AI branch generation using Bedrock
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

const generateBranchesAI = async (decisionTitle, decisionDescription) => {
  console.log('🤖 Using Claude AI to generate branches for:', { decisionTitle, decisionDescription });
  
  const prompt = `You are an AI decision-making assistant. Given a decision title and description, generate exactly 2 meaningful, specific choices that represent the main paths forward for this decision.

Decision Title: "${decisionTitle}"
Decision Description: "${decisionDescription}"

IMPORTANT: Extract the actual specific options mentioned in the decision and create choices based on those exact options. For example:
- If the decision is "Should I go to UW or Purdue?", create choices like "Go to UW" and "Go to Purdue"
- If the decision is "Should I take the Google job or Microsoft job?", create choices like "Take the Google job" and "Take the Microsoft job"
- If the decision is "Should I invest $1000 or $5000?", create choices like "Invest $1000" and "Invest $5000"

Each choice should be:
- Based on the actual specific options mentioned in the decision
- Clear and actionable
- Represent genuinely different paths forward
- Use the exact names/options from the decision when possible

Output JSON matching this exact schema:
{
  "branches": [
    {
      "name": "Specific Choice 1",
      "description": "Clear description of what this choice involves and its implications"
    },
    {
      "name": "Specific Choice 2", 
      "description": "Clear description of what this choice involves and its implications"
    }
  ]
}`;

  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    messages: [
      {
        role: 'user',
        content: [
          {
            text: prompt
          }
        ]
      }
    ]
  });

  try {
    const response = await client.send(command);
    const content = response.output?.message?.content?.[0]?.text;
    
    if (!content) {
      throw new Error('No content in response');
    }
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    // Clean the JSON string by removing control characters
    const cleanedJson = jsonMatch[0]
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\n/g, '\\n') // Escape newlines
      .replace(/\r/g, '\\r') // Escape carriage returns
      .replace(/\t/g, '\\t'); // Escape tabs
    
    const parsed = JSON.parse(cleanedJson);
    
    console.log('✅ Claude generated branches:', parsed.branches);
    
    return {
      branches: parsed.branches || []
    };
  } catch (error) {
    console.error('❌ Error generating AI branches:', error);
    
    // Fallback to generic choices
    return {
      branches: [
        {
          name: "Yes - Take Action",
          description: "Move forward with this decision and embrace the opportunities and challenges it brings."
        },
        {
          name: "No - Wait or Explore Alternatives",
          description: "Hold off on this decision and explore other options or gather more information before proceeding."
        }
      ]
    };
  }
};

module.exports = { generateBranchesAI };
