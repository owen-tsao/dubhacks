import { BedrockResponse } from '../types';

// Real Bedrock implementation
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
export const generateSimulation = async (
  decisionTitle: string,
  branchName: string,
  branchDescription: string,
  personaStyle: 'analytical' | 'empathetic' = 'analytical',
  decisionDescription?: string
): Promise<BedrockResponse> => {
  const prompt = `You are Future-You one year from now. You experienced choosing "${branchName}" for the decision "${decisionTitle}". 

Decision Context: ${decisionDescription || 'No additional context provided'}

Branch Description: ${branchDescription}

Use the decision context to create a more personalized and realistic simulation. The decision context contains important details about your situation, motivations, and circumstances that should inform your future-self reflection.

Speak from first-person and be reflective. Produce 5 probing questions that would have helped you make this choice, an optimistic scenario (short paragraph), a challenging scenario (short paragraph), and a short summary of the major tradeoffs.

Persona Style: ${personaStyle === 'analytical' ? 'Focus on data, metrics, and logical analysis' : 'Focus on emotions, relationships, and personal impact'}

Output JSON matching this exact schema:
{
  "questions": ["question1", "question2", "question3", "question4", "question5"],
  "optimistic_scenario": "In one year, after choosing this path...",
  "challenging_scenario": "In one year, after choosing this path, the challenges...",
  "summary": "Major tradeoffs: ...",
  "confidence_delta_recommendation": 0.5
}`;

  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
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
    console.log('Calling Bedrock with model:', 'anthropic.claude-3-sonnet-20240229-v1:0');
    console.log('Prompt:', prompt);
    
    const response = await client.send(command);
    console.log('Bedrock response:', JSON.stringify(response, null, 2));
    
    const content = response.output?.message?.content?.[0]?.text;
    
    if (!content) {
      console.error('No content in response:', response);
      throw new Error('No content in response');
    }
    
    console.log('Content from Bedrock:', content);
    
    // Parse the JSON response from Claude
    const jsonMatch = content!.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('No JSON found in content:', content);
      throw new Error('No valid JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    console.log('Parsed JSON:', parsed);
    
    return {
      questions: parsed.questions || [],
      optimistic_scenario: parsed.optimistic_scenario || '',
      challenging_scenario: parsed.challenging_scenario || '',
      summary: parsed.summary || '',
      confidence_delta_recommendation: parsed.confidence_delta_recommendation || 0,
    };
  } catch (error) {
    console.error('Bedrock error details:', error);
    console.error('Error stack:', (error as Error).stack);
    // Return a fallback response
    return {
      questions: [
        'How did this choice affect my daily routine?',
        'What relationships were impacted?',
        'Did my financial situation change?',
        'How did my stress levels change?',
        'What new opportunities opened up?'
      ],
      optimistic_scenario: `In one year, after choosing "${branchName}", I found that this path provided the structure and opportunities I needed to grow.`,
      challenging_scenario: `In one year, after choosing "${branchName}", I faced some unexpected challenges that tested my commitment to this path.`,
      summary: `Major tradeoffs: Consider the long-term vs short-term benefits, personal growth vs stability, and financial impact vs fulfillment.`,
      confidence_delta_recommendation: 0.5,
    };
  }
};

export const generateComparison = async (
  decisionTitle: string,
  branches: Array<{ name: string; description: string; simulation: any }>
): Promise<{
  tradeoffs: string[];
  mergeConflicts: string[];
  recommendedMerge: string;
  confidenceImpact: string;
}> => {
  const prompt = `Compare these two life decision branches for "${decisionTitle}":

Branch 1: ${branches[0]?.name}
Description: ${branches[0]?.description}
Simulation: ${JSON.stringify(branches[0]?.simulation, null, 2)}

Branch 2: ${branches[1]?.name}
Description: ${branches[1]?.description}
Simulation: ${JSON.stringify(branches[1]?.simulation, null, 2)}

Generate a comparison analysis in JSON format:
{
  "tradeoffs": ["tradeoff1", "tradeoff2", "tradeoff3"],
  "mergeConflicts": ["conflict1", "conflict2"],
  "recommendedMerge": "Based on the analysis, I recommend...",
  "confidenceImpact": "This decision will likely..."
}`;

  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
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
    
    const jsonMatch = content!.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      tradeoffs: parsed.tradeoffs || [],
      mergeConflicts: parsed.mergeConflicts || [],
      recommendedMerge: parsed.recommendedMerge || 'Consider both options carefully.',
      confidenceImpact: parsed.confidenceImpact || 'This decision will impact your confidence.',
    };
  } catch (error) {
    console.error('Bedrock comparison error:', error);
    return {
      tradeoffs: ['Time investment vs immediate results', 'Risk vs stability', 'Personal growth vs comfort'],
      mergeConflicts: ['Conflicting time commitments', 'Different risk tolerances'],
      recommendedMerge: 'Consider a hybrid approach that combines the best of both options.',
      confidenceImpact: 'This decision will likely increase your confidence in your chosen path.',
    };
  }
};


export const generateFollowUpDecisions = async (
  originalDecision: string,
  chosenPath: string,
  simulationResult: any
): Promise<{
  storyline: string;
  followUpDecisions: Array<{ name: string; description: string }>;
}> => {
  // Generate both storyline and follow-up decisions using AI
  const prompt = `You are a life simulation AI. Based on the user's original decision, their chosen path, and the simulation results, create a compelling storyline of their life journey and generate specific follow-up decisions.

Original Decision: "${originalDecision}"
Chosen Path: "${chosenPath}"
Simulation Results: ${JSON.stringify(simulationResult, null, 2)}

Create a detailed, specific storyline (2-3 paragraphs) showing how their life unfolds over 6-12 months after making this choice.

The storyline should be:
- HIGHLY SPECIFIC to their exact decision and choice
- Realistic and relatable with concrete details
- Show both positive and challenging aspects with specific examples
- Connect directly to the simulation results and their implications
- Set up the follow-up decisions naturally
- Include specific timeframes, emotions, and outcomes
- Be personal and engaging, not generic

Then generate 3-4 specific follow-up decisions that naturally arise from this storyline. These should be:
- Highly contextual to their specific situation and decision
- Realistic and actionable
- Different from generic categories - be specific
- Based on the storyline and simulation results
- Show different paths they could take next

Examples of specific vs generic follow-up decisions:
- SPECIFIC: "Negotiate for a 20% salary increase based on your 6-month performance review" vs GENERIC: "Continue Current Path"
- SPECIFIC: "Start couples therapy to address the communication issues that emerged" vs GENERIC: "Pivot Strategy"
- SPECIFIC: "Apply for the senior developer position that opened up in your team" vs GENERIC: "Explore New Opportunities"

Output JSON matching this exact schema:
{
  "storyline": "Your detailed, specific storyline here...",
  "followUpDecisions": [
    {"name": "Specific decision 1", "description": "Detailed description of what this involves"},
    {"name": "Specific decision 2", "description": "Detailed description of what this involves"},
    {"name": "Specific decision 3", "description": "Detailed description of what this involves"}
  ]
}`;

  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    messages: [
      {
        role: 'user',
        content: [
          {
            text: prompt
          }
        ]
      }
    ],
  });

  try {
    const response = await client.send(command);
    const content = response.output?.message?.content?.[0]?.text;
    
    if (!content) {
      throw new Error('No content in response');
    }
    
    const jsonMatch = content!.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Return AI-generated storyline and follow-up decisions
    return {
      storyline: parsed.storyline || 'Your journey continues...',
      followUpDecisions: parsed.followUpDecisions || [
        {
          name: 'Continue Current Path',
          description: 'Stay committed to your chosen direction and see where it leads'
        },
        {
          name: 'Pivot Strategy',
          description: 'Adjust your approach based on new information and experiences'
        },
        {
          name: 'Explore New Opportunities',
          description: 'Look for additional options that have emerged from your choice'
        }
      ]
    };
  } catch (error) {
    console.error('Bedrock follow-up decisions error:', error);
    // Fallback response with hardcoded categories
    return {
      storyline: `After choosing "${chosenPath}", your life takes an interesting turn. The decision brings both expected and unexpected changes, opening new doors while presenting fresh challenges. You find yourself at a crossroads, ready to make the next important choice in your journey.`,
      followUpDecisions: [
        {
          name: 'Continue Current Path',
          description: 'Stay committed to your chosen direction and see where it leads'
        },
        {
          name: 'Pivot Strategy',
          description: 'Adjust your approach based on new information and experiences'
        },
        {
          name: 'Explore New Opportunities',
          description: 'Look for additional options that have emerged from your choice'
        }
      ]
    };
  }
};

export const generateFollowUpSimulation = async (
  originalDecision: string,
  followUpName: string,
  followUpDescription: string
): Promise<{
  actionPlan: string;
  potentialOutcomes: string;
  nextSteps: string;
  timeline: string;
  resources: string;
}> => {
  const prompt = `You are a life coaching AI. Based on the user's original decision and their chosen follow-up action, create a detailed, personalized action plan.

Original Decision: "${originalDecision}"
Follow-up Action: "${followUpName}"
Description: "${followUpDescription}"

Create a comprehensive action plan that includes:

1. A detailed action plan (2-3 sentences) with specific, actionable steps
2. Potential outcomes (2-3 sentences) describing what they can expect
3. Next steps (2-3 sentences) with immediate actions they can take
4. Timeline (1-2 sentences) with realistic expectations for progress
5. Resources needed (2-3 sentences) about what they'll need to succeed

Make it:
- Specific and actionable, not generic
- Personalized to their situation
- Realistic and achievable
- Encouraging but honest about challenges
- Focused on practical next steps

Output JSON matching this exact schema:
{
  "actionPlan": "Your detailed action plan here...",
  "potentialOutcomes": "What they can expect to achieve...",
  "nextSteps": "Immediate actions they can take...",
  "timeline": "Realistic timeline for progress...",
  "resources": "What they'll need to succeed..."
}`;

  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    messages: [
      {
        role: 'user',
        content: [
          {
            text: prompt
          }
        ]
      }
    ],
  });

  try {
    const response = await client.send(command);
    const content = response.output?.message?.content?.[0]?.text;
    
    if (!content) {
      throw new Error('No content in response');
    }
    
    const jsonMatch = content!.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      actionPlan: parsed.actionPlan || 'Create a step-by-step plan to move forward with this direction.',
      potentialOutcomes: parsed.potentialOutcomes || 'This path will likely lead to positive changes in your situation.',
      nextSteps: parsed.nextSteps || 'Start by taking small, concrete actions that align with your goals.',
      timeline: parsed.timeline || 'You can expect to see progress within 1-3 months.',
      resources: parsed.resources || 'Consider what skills, support, or resources you might need.'
    };
  } catch (error) {
    console.error('Bedrock follow-up simulation error:', error);
    // Fallback response
    return {
      actionPlan: `Here's a detailed plan for "${followUpName}": Start by breaking this down into smaller, manageable steps that you can take immediately.`,
      potentialOutcomes: `By choosing this path, you'll likely see positive changes in your situation within the next 3-6 months.`,
      nextSteps: `Begin by taking one small action today that moves you in this direction.`,
      timeline: `You can expect to see initial results within 1-2 months, with more significant progress by 6 months.`,
      resources: `Consider what resources, skills, or support you'll need to succeed in this direction.`
    };
  }
};

export const generateSpecificFollowUpDecisions = async (
  originalDecision: string,
  chosenPath: string,
  broadCategory: string,
  simulationResult: any
): Promise<{
  specificDecisions: Array<{ name: string; description: string }>;
}> => {
  console.log('generateSpecificFollowUpDecisions called with:', {
    originalDecision,
    chosenPath,
    broadCategory,
    simulationResult
  });

  const prompt = `You are a life coaching AI. Based on the user's original decision, their chosen path, the broad category they selected, and the simulation results, generate 3-4 specific, actionable follow-up decisions within that category.

Original Decision: "${originalDecision}"
Chosen Path: "${chosenPath}"
Broad Category: "${broadCategory}"
Simulation Results: ${JSON.stringify(simulationResult, null, 2)}

Generate 3-4 specific, actionable follow-up decisions that fall under the "${broadCategory}" category. These should be:

- SPECIFIC and actionable (not broad concepts)
- Directly related to their situation and the broad category
- Realistic and achievable
- Represent different aspects or approaches within the category
- Have clear, descriptive names and detailed descriptions
- Based on their specific context and simulation results

IMPORTANT: Make these decisions highly relevant to their specific situation. Use the simulation results to understand their context and generate appropriate options.

For example, if they chose "Pivot Strategy" for a job decision about Amazon vs Microsoft, generate specific pivots like:
- "Negotiate for remote work arrangements at Amazon"
- "Seek internal transfer to a different Amazon department"
- "Develop new skills for a career transition to Microsoft"

Output JSON matching this exact schema:
{
  "specificDecisions": [
    {
      "name": "Specific Decision 1",
      "description": "Detailed description of this specific follow-up decision"
    },
    {
      "name": "Specific Decision 2", 
      "description": "Detailed description of this specific follow-up decision"
    },
    {
      "name": "Specific Decision 3",
      "description": "Detailed description of this specific follow-up decision"
    }
  ]
}`;

  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    messages: [
      {
        role: 'user',
        content: [
          {
            text: prompt
          }
        ]
      }
    ],
  });

  try {
    const response = await client.send(command);
    const content = response.output?.message?.content?.[0]?.text;
    
    if (!content) {
      throw new Error('No content in response');
    }
    
    const jsonMatch = content!.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      specificDecisions: parsed.specificDecisions || []
    };
  } catch (error) {
    console.error('Bedrock specific follow-up decisions error:', error);
    console.error('Error details:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    // Fallback response based on category
    const fallbackDecisions = getFallbackSpecificDecisions(broadCategory);
    return {
      specificDecisions: fallbackDecisions
    };
  }
};

const getFallbackSpecificDecisions = (broadCategory: string) => {
  switch (broadCategory) {
    case 'Continue Current Path':
      return [
        {
          name: 'Double Down on Current Approach',
          description: 'Invest more time and energy into your current strategy to maximize results and build momentum'
        },
        {
          name: 'Seek Mentorship and Guidance',
          description: 'Find experienced mentors who can help you navigate your current path more effectively and avoid common pitfalls'
        },
        {
          name: 'Track Progress and Optimize',
          description: 'Implement systems to monitor your progress and make data-driven improvements to your approach'
        },
        {
          name: 'Build Support Systems',
          description: 'Create networks and systems that will help you succeed in your chosen direction'
        }
      ];
    case 'Pivot Strategy':
      return [
        {
          name: 'Adjust Timeline and Expectations',
          description: 'Modify your timeline and expectations based on new information and experiences'
        },
        {
          name: 'Change Tactics While Keeping Goals',
          description: 'Maintain your core objectives but change the methods you use to achieve them'
        },
        {
          name: 'Seek Alternative Approaches',
          description: 'Explore different ways to reach the same destination with a fresh perspective'
        },
        {
          name: 'Test New Strategies',
          description: 'Experiment with small changes to see what works better for your situation'
        }
      ];
    case 'Explore New Opportunities':
      return [
        {
          name: 'Research Emerging Options',
          description: 'Investigate new opportunities that have become available since your decision'
        },
        {
          name: 'Network and Build Connections',
          description: 'Expand your network to discover new possibilities and pathways you hadn\'t considered'
        },
        {
          name: 'Develop New Skills',
          description: 'Acquire new capabilities that open up additional opportunities and career paths'
        },
        {
          name: 'Explore Side Projects',
          description: 'Start small experiments or side projects to test new directions without major commitment'
        }
      ];
    default:
      return [
        {
          name: 'Reflect and Reassess',
          description: 'Take time to think about your situation and consider your options carefully'
        },
        {
          name: 'Seek Additional Information',
          description: 'Gather more data and insights to make better-informed decisions'
        },
        {
          name: 'Consult with Others',
          description: 'Get advice and perspectives from trusted friends, family, or professionals'
        }
      ];
  }
};

export const generateBranches = async (decisionTitle: string, decisionDescription: string): Promise<{ branches: Array<{ name: string; description: string }> }> => {
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
    console.log('Generating AI branches for:', { decisionTitle, decisionDescription });
    console.log('Using model:', 'anthropic.claude-3-haiku-20240307-v1:0');
    console.log('AWS Region:', process.env.AWS_REGION || 'us-east-1');
    
    const response = await client.send(command);
    console.log('Bedrock response received:', JSON.stringify(response, null, 2));
    
    const content = response.output?.message?.content?.[0]?.text;
    
    if (!content) {
      console.error('No content in Bedrock response:', response);
      throw new Error('No content received from Bedrock');
    }

    console.log('Claude branch generation response:', content);
    
    // Parse the JSON response
    const parsed = JSON.parse(content);
    
    if (!parsed.branches || !Array.isArray(parsed.branches) || parsed.branches.length !== 2) {
      console.error('Invalid response format from Claude:', parsed);
      throw new Error('Invalid response format from Claude');
    }

    return {
      branches: parsed.branches.map((branch: any) => ({
        name: branch.name,
        description: branch.description
      }))
    };
  } catch (error) {
    console.error('Error generating AI branches:', error);
    console.error('Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      code: (error as any).code,
      stack: (error as Error).stack
    });
    throw error;
  }
};

export const checkClarificationNeeded = async (
  decisionTitle: string,
  decisionDescription: string
): Promise<{ needsClarification: boolean; reason?: string }> => {
  const prompt = `You are an AI assistant that analyzes decisions to determine if there's enough context for realistic simulation.

The user has shared this decision:
Title: "${decisionTitle}"
Description: "${decisionDescription}"

Your task is to determine if this decision has enough specific details to create a meaningful, realistic simulation of the different choice paths. Consider:

1. **Specificity**: Are the options clearly defined and specific enough?
2. **Context**: Is there enough background information about the user's situation?
3. **Constraints**: Are important factors like timeline, budget, location, etc. mentioned?
4. **Stakes**: Is it clear what the consequences of each choice might be?
5. **Simulation Quality**: Could you realistically simulate what life would be like 1 year after each choice?

Examples of decisions that NEED clarification:
- "Should I go to UW or Purdue?" (missing: major, financial situation, career goals, location preferences)
- "Should I take the job offer?" (missing: current job details, salary, location, company culture)
- "Should I move to a new city?" (missing: which city, current situation, reasons for moving)
- "Should I start a business?" (missing: what type of business, current financial situation, experience)

Examples of decisions that DON'T need clarification:
- "Should I take the $120k software engineer job at Google in Seattle or the $100k job at Microsoft in Redmond?" (very specific)
- "Should I major in Computer Science at UW or Electrical Engineering at Purdue, given that I want to work in tech and both schools offer similar programs?" (specific with context)

Output JSON matching this exact schema:
{
  "needsClarification": true/false,
  "reason": "Brief explanation of why clarification is or isn't needed"
}`;

  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
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
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      needsClarification: parsed.needsClarification || false,
      reason: parsed.reason || 'Insufficient context for realistic simulation'
    };
  } catch (error) {
    console.error('Bedrock clarification check error:', error);
    // Fallback: be conservative and ask for clarification
    return {
      needsClarification: true,
      reason: 'Unable to analyze decision context'
    };
  }
};

export const generateClarifyingQuestions = async (
  decisionTitle: string,
  decisionDescription: string
): Promise<{ questions: string[] }> => {
  const prompt = `You are a helpful AI assistant that generates clarifying questions to enable realistic decision simulation.

The user has shared this decision:
Title: "${decisionTitle}"
Description: "${decisionDescription}"

Based on the decision title and description, generate 3-5 specific, thoughtful clarifying questions that would help create a realistic simulation of each choice path. Focus on gathering information that would be essential for simulating what life would be like 1 year after making each choice.

The questions should help uncover:
- **Specific details** about each option (majors, salaries, locations, timelines, etc.)
- **Personal context** (current situation, goals, constraints, preferences)
- **Important factors** that would affect the simulation (financial situation, family considerations, career aspirations)
- **Missing information** needed to realistically compare the options

Examples of good clarifying questions:
- "What major did you get into each school for?" (for college decisions)
- "What's the salary difference between the two job offers?" (for career decisions)
- "What's your current financial situation and how would this decision affect it?" (for financial decisions)
- "What are your main priorities - career growth, work-life balance, or financial stability?" (for general decisions)

The questions should be:
- Specific and actionable
- Focused on simulation-relevant details
- Conversational and empathetic in tone
- Not leading toward any particular outcome

Output JSON matching this exact schema:
{
  "questions": ["question1", "question2", "question3", "question4", "question5"]
}`;

  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
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
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      questions: parsed.questions || []
    };
  } catch (error) {
    console.error('Bedrock clarifying questions error:', error);
    // Fallback questions
    return {
      questions: [
        "What's the main reason you're considering this decision right now?",
        "What are the most important factors you're weighing?",
        "What would success look like for you in this situation?",
        "What concerns or fears do you have about this decision?",
        "How does this decision fit into your broader life goals?"
      ]
    };
  }
};

export const generateDecisionSummary = async (
  decisionTitle: string,
  originalDescription: string,
  userResponses: { question: string; answer: string }[]
): Promise<{ summary: string; enhancedDescription: string }> => {
  const responsesText = userResponses
    .map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.answer}`)
    .join('\n\n');

  const prompt = `You are a helpful AI assistant that creates clear, comprehensive decision summaries.

  Original Decision:
  Title: "${decisionTitle}"
  Description: "${originalDescription}"

  User's Clarifying Responses:
  ${responsesText}

  Based on the original decision and the user's detailed responses, create:
  1. A conversational summary that shows you understand their situation
  2. An enhanced description that incorporates all the context they've provided

  The summary should:
  - Start with "Here's what I understand about your situation..."
  - Be empathetic and show you've listened carefully
  - Synthesize the key points from their responses
  - Be conversational, not formal
  - Highlight the most important factors they've mentioned

  The enhanced description should:
  - Incorporate all the context from their responses
  - Be more detailed and specific than the original
  - Maintain their voice and perspective
  - Be ready to use for decision analysis

  Output JSON matching this exact schema:
  {
    "summary": "Here's what I understand about your situation...",
    "enhancedDescription": "Enhanced description incorporating all context..."
  }`;

  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
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
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      summary: parsed.summary || "Here's what I understand about your situation...",
      enhancedDescription: parsed.enhancedDescription || originalDescription
    };
  } catch (error) {
    console.error('Bedrock decision summary error:', error);
    // Fallback summary
    return {
      summary: "Here's what I understand about your situation...",
      enhancedDescription: originalDescription
    };
  }
};


export const generatePathForward = async (
  originalDecision: string,
  chosenPath: string,
  pathDescription: string
): Promise<{
  actionPlan: string;
  potentialOutcomes: string;
  nextSteps: string;
  timeline: string;
  resources: string;
}> => {
  const prompt = `You are a life coaching AI. Based on the user's original decision and their chosen follow-up path, create a detailed, actionable "Your Path Forward" plan.

Original Decision: "${originalDecision}"
Chosen Follow-up Path: "${chosenPath}"
Path Description: "${pathDescription}"

Create a comprehensive, specific plan that includes:

1. Action Plan: Detailed steps they should take, specific to their decision context and chosen path
2. Potential Outcomes: Realistic expectations of what they can achieve and when
3. Next Steps: 5 specific, numbered action items they can start immediately
4. Timeline: A realistic timeline with specific milestones
5. Resources: Specific tools, people, websites, or services they should use

Make it HIGHLY CONTEXTUAL to their specific decision and chosen path. For example:
- If they chose "Negotiate for Better Terms" for an oil field job, focus on oil industry-specific negotiation tactics
- If they chose "Starting a Family" after a marriage decision, focus on family planning and relationship dynamics
- If they chose "Develop New Skills" for a career change, focus on industry-specific skill development

Be specific, actionable, and realistic. Include concrete examples and industry-specific advice.

Output JSON matching this exact schema:
{
  "actionPlan": "Your detailed action plan here...",
  "potentialOutcomes": "Your potential outcomes here...",
  "nextSteps": "1) First step 2) Second step 3) Third step 4) Fourth step 5) Fifth step",
  "timeline": "Your timeline with specific milestones...",
  "resources": "Your specific resources and tools..."
}`;

  const command = new ConverseCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    messages: [
      {
        role: 'user',
        content: [
          {
            text: prompt
          }
        ]
      }
    ],
  });

  try {
    const response = await client.send(command);
    const content = response.output?.message?.content?.[0]?.text;
    
    if (!content) {
      throw new Error('No content in response');
    }
    
    const jsonMatch = content!.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      actionPlan: parsed.actionPlan || 'Create a detailed plan for your chosen path.',
      potentialOutcomes: parsed.potentialOutcomes || 'You can expect positive changes within 3-6 months.',
      nextSteps: parsed.nextSteps || '1) Research your options 2) Set specific goals 3) Take action 4) Monitor progress 5) Adjust as needed',
      timeline: parsed.timeline || 'Month 1-2: Planning phase. Month 3-4: Implementation. Month 5-6: Evaluation.',
      resources: parsed.resources || 'Educational materials, mentors, professional networks, and relevant tools.'
    };
  } catch (error) {
    console.error('Bedrock path forward error:', error);
    // Fallback response
    return {
      actionPlan: `Create a detailed plan for "${chosenPath}" by researching best practices and setting specific goals.`,
      potentialOutcomes: `By pursuing "${chosenPath}", you'll likely see positive changes within 3-6 months.`,
      nextSteps: `1) Research and gather information 2) Set specific goals 3) Create a timeline 4) Take action 5) Monitor progress`,
      timeline: `Month 1-2: Planning and preparation. Month 3-4: Active implementation. Month 5-6: Evaluation and adjustment.`,
      resources: `Educational materials, mentors, professional networks, and relevant tools for your chosen path.`
    };
  }
};
