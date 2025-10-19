const express = require('express');
const cors = require('cors');
const app = express();
const port = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const decisions = [];
const branches = [];
const conversations = [];
const comparisons = [];
const events = [];
const decisionGroups = [];

// Mock user ID for demo
const getUserId = (req) => {
  return req.headers['x-user-id'] || `user_${Date.now()}`;
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BranchPoint API is running' });
});


// Decisions
app.post('/decisions', (req, res) => {
  const userId = getUserId(req);
  let { title, description, preConfidence } = req.body;
  
  // Remove "life branch" prefix if present
  if (title && title.toLowerCase().startsWith('life branch')) {
    title = title.substring(11).trim(); // Remove "life branch " (11 characters)
  }
  
  console.log('📝 Creating decision:', { title, description, preConfidence, userId });
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const decision = {
    decisionId: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    title,
    description: description || '',
    preConfidence: preConfidence || 3,
    state: 'DRAFT',
    createdAt: new Date().toISOString(),
  };

  decisions.push(decision);
  console.log('✅ Decision created:', decision.decisionId);
  console.log('📊 Total decisions:', decisions.length);
  
  res.status(201).json({
    decisionId: decision.decisionId,
    createdAt: decision.createdAt,
  });
});

app.get('/decisions', (req, res) => {
  const userId = getUserId(req);
  const userDecisions = decisions.filter(d => d.userId === userId);
  userDecisions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json({
    decisions: userDecisions,
    count: userDecisions.length,
  });
});

app.get('/decisions/:id', (req, res) => {
  const userId = getUserId(req);
  const decision = decisions.find(d => d.decisionId === req.params.id && d.userId === userId);
  
  if (!decision) {
    return res.status(404).json({ error: 'Decision not found' });
  }

  const decisionBranches = branches.filter(b => b.decisionId === req.params.id);
  const branchesWithConversations = decisionBranches.map(branch => ({
    ...branch,
    conversations: conversations.filter(c => c.branchId === branch.branchId),
  }));

  res.json({
    decision,
    branches: branchesWithConversations,
  });
});

// Branches
app.post('/decisions/:id/branches', (req, res) => {
  const userId = getUserId(req);
  const decisionId = req.params.id;
  
  console.log('🔍 Looking for decision:', decisionId);
  console.log('🔍 Available decisions:', decisions.map(d => d.decisionId));
  console.log('🔍 User ID:', userId);
  
  const decision = decisions.find(d => d.decisionId === decisionId && d.userId === userId);
  
  if (!decision) {
    console.log('❌ Decision not found for ID:', decisionId);
    return res.status(404).json({ error: 'Decision not found' });
  }

  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Branch name is required' });
  }

  const branch = {
    branchId: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    decisionId: req.params.id,
    name,
    description: description || '',
    createdAt: new Date().toISOString(),
  };

  branches.push(branch);
  res.status(201).json({
    branchId: branch.branchId,
    decisionId: branch.decisionId,
    createdAt: branch.createdAt,
  });
});

// Simulation
app.post('/simulate', async (req, res) => {
  const { branchId, personaStyle = 'analytical' } = req.body;
  
  if (!branchId) {
    return res.status(400).json({ error: 'Branch ID is required' });
  }

  const branch = branches.find(b => b.branchId === branchId);
  if (!branch) {
    return res.status(404).json({ error: 'Branch not found' });
  }

  const decision = decisions.find(d => d.decisionId === branch.decisionId);
  if (!decision) {
    return res.status(404).json({ error: 'Decision not found' });
  }

  try {
    console.log('🤖 Using Claude AI to generate simulation for:', {
      decisionTitle: decision.title,
      branchName: branch.name,
      branchDescription: branch.description,
      personaStyle
    });

    // Use real Bedrock function for simulation
    const { generateSimulation } = require('./bedrock-js');
    const simulationResult = await generateSimulation(
      decision.title,
      branch.name,
      branch.description,
      personaStyle,
      decision.description // Pass the decision's description as context (which may be enhanced)
    );
    
    console.log('✅ Generated simulation:', simulationResult);

    const simulationOutput = {
      questions: simulationResult.questions,
      optimisticScenario: simulationResult.optimistic_scenario,
      challengingScenario: simulationResult.challenging_scenario,
      summary: simulationResult.summary,
      personaStyle: personaStyle,
      confidenceDeltaRecommendation: simulationResult.confidence_delta_recommendation
    };

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const conversation = {
      conversationId,
      branchId,
      messages: [
        {
          messageId: `msg_${Date.now()}_1`,
          sender: 'future-you',
          text: `I'm Future-You, one year from now. I chose the "${branch.name}" path for "${decision.title}". Let me share what I learned...`,
          createdAt: now,
        },
        {
          messageId: `msg_${Date.now()}_2`,
          sender: 'future-you',
          text: `Here are some questions that would have helped me make this choice: ${simulationOutput.questions.join(', ')}`,
          createdAt: now,
        },
        {
          messageId: `msg_${Date.now()}_3`,
          sender: 'future-you',
          text: `Optimistic scenario: ${simulationOutput.optimisticScenario}`,
          createdAt: now,
        },
        {
          messageId: `msg_${Date.now()}_4`,
          sender: 'future-you',
          text: `Challenging scenario: ${simulationOutput.challengingScenario}`,
          createdAt: now,
        },
        {
          messageId: `msg_${Date.now()}_5`,
          sender: 'future-you',
          text: `Summary: ${simulationOutput.summary}`,
          createdAt: now,
        },
      ],
      simulationOutput,
      createdAt: now,
      updatedAt: now,
    };

    conversations.push(conversation);

    // Update branch with simulation timestamp
    const branchIndex = branches.findIndex(b => b.branchId === branchId);
    if (branchIndex !== -1) {
      branches[branchIndex].lastSimulatedAt = now;
    }

    res.json({
      conversationId,
      simulationOutput,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error('❌ Error generating simulation:', error);
    res.status(500).json({ error: 'Failed to generate simulation' });
  }
});

// Generate Branches using Claude AI
app.post('/generate-branches', async (req, res) => {
  const { decisionTitle, decisionDescription } = req.body;
  
  if (!decisionTitle) {
    return res.status(400).json({ error: 'Decision title is required' });
  }

  try {
    console.log('🤖 Using Claude AI to generate branches for:', { decisionTitle, decisionDescription });
    
    // Import the AI function
    const { generateBranchesAI } = require('./generate-branches-ai');
    
    // Call AI to generate contextual branches
    const aiResponse = await generateBranchesAI(decisionTitle, decisionDescription);
    
    // Add branch IDs and timestamps
    const branches = aiResponse.branches.map((branch, index) => ({
      branchId: `ai-${Date.now()}-${index}`,
      name: branch.name,
      description: branch.description
    }));
    
    console.log('✅ Claude generated branches:', branches);
    res.json({ branches });
    
  } catch (error) {
    console.error('❌ Error generating AI branches:', error);
    
    // Fallback to simple hardcoded logic if AI fails
    console.log('🔄 Falling back to hardcoded logic');
    const question = decisionTitle.toLowerCase();
    const desc = decisionDescription?.toLowerCase() || '';
    
    let branches = [];
    
    if (question.includes('job') && (question.includes('amazon') || question.includes('microsoft') || question.includes('apple'))) {
      const companies = [];
      const combinedText = `${question} ${desc}`;
      if (combinedText.includes('amazon')) companies.push('Amazon');
      if (combinedText.includes('microsoft')) companies.push('Microsoft');
      if (combinedText.includes('apple')) companies.push('Apple');
      
      const company1 = companies[0] || 'Company A';
      const company2 = companies[1] || 'Company B';
      
      branches = [
        {
          branchId: `fallback-${company1.toLowerCase()}-${Date.now()}`,
          name: `Accept ${company1} Offer`,
          description: `Choose the ${company1} position and move forward with their offer.`
        },
        {
          branchId: `fallback-${company2.toLowerCase()}-${Date.now()}`,
          name: `Accept ${company2} Offer`,
          description: `Choose the ${company2} position and move forward with their offer.`
        }
      ];
    } else {
      branches = [
        {
          branchId: `fallback-yes-${Date.now()}`,
          name: 'Yes - Take Action',
          description: 'Move forward with this decision and embrace the opportunities it brings'
        },
        {
          branchId: `fallback-no-${Date.now()}`,
          name: 'No - Wait or Decline',
          description: 'Hold off on this decision and explore alternative options'
        }
      ];
    }
    
    res.json({ branches });
  }
});

// Generate Follow-up Decisions
app.post('/generate-followup-decisions', async (req, res) => {
  const { originalDecision, chosenPath, simulationResult } = req.body;
  
  if (!originalDecision || !chosenPath) {
    return res.status(400).json({ error: 'Original decision and chosen path are required' });
  }

  try {
    console.log('🤖 Using Claude AI to generate follow-up decisions for:', {
      originalDecision,
      chosenPath,
      simulationResult
    });

    // Use real Bedrock function
    const { generateFollowUpDecisions } = require('./bedrock-js');
    const result = await generateFollowUpDecisions(originalDecision, chosenPath, simulationResult);
    
    console.log('✅ Generated follow-up decisions:', result);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error generating follow-up decisions:', error);
    res.status(500).json({ error: 'Failed to generate follow-up decisions' });
  }
});

// Comparison
app.get('/decisions/:id/comparison', (req, res) => {
  const userId = getUserId(req);
  const decision = decisions.find(d => d.decisionId === req.params.id && d.userId === userId);
  
  if (!decision) {
    return res.status(404).json({ error: 'Decision not found' });
  }

  const decisionBranches = branches.filter(b => b.decisionId === req.params.id);
  const simulatedBranches = decisionBranches.filter(b => b.lastSimulatedAt);

  if (simulatedBranches.length < 2) {
    return res.status(400).json({ error: 'At least 2 branches must be simulated before comparison' });
  }

  // Mock comparison response
  const comparisonResult = {
    tradeoffs: [
      `${simulatedBranches[0].name} offers more structure and predictability, while ${simulatedBranches[1].name} provides flexibility and spontaneity`,
      `Time investment: ${simulatedBranches[0].name} requires more upfront planning, ${simulatedBranches[1].name} allows for more organic growth`,
      `Risk tolerance: ${simulatedBranches[0].name} is lower risk with steady progress, ${simulatedBranches[1].name} has higher potential but more uncertainty`
    ],
    mergeConflicts: [
      `Conflicting time commitments between ${simulatedBranches[0].name} and ${simulatedBranches[1].name}`,
      `Different approaches to decision-making that may create internal tension`,
      `Resource allocation conflicts - both paths require significant investment`
    ],
    recommendedMerge: `Based on the analysis, I recommend a hybrid approach that combines the structured planning from ${simulatedBranches[0].name} with the flexibility of ${simulatedBranches[1].name}. Start with a clear framework but remain open to opportunities that align with your core values.`,
    confidenceImpact: `This decision will likely increase your confidence by 0.6 points on average. The structured analysis and future-self perspective provide clarity that reduces decision anxiety and increases conviction in your chosen path.`
  };

  const comparisonId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const comparison = {
    comparisonId,
    decisionId: req.params.id,
    branchesCompared: simulatedBranches.slice(0, 2).map(b => b.branchId),
    generatedDiff: comparisonResult,
    createdAt: new Date().toISOString(),
  };

  comparisons.push(comparison);

  res.json({
    comparisonId,
    generatedDiff: comparisonResult,
    branches: simulatedBranches.slice(0, 2),
  });
});

// Commit
app.post('/decisions/:id/commit', (req, res) => {
  const userId = getUserId(req);
  const decision = decisions.find(d => d.decisionId === req.params.id && d.userId === userId);
  
  if (!decision) {
    return res.status(404).json({ error: 'Decision not found' });
  }

  const { finalBranchId, postConfidence } = req.body;
  
  if (!finalBranchId) {
    return res.status(400).json({ error: 'Final branch ID is required' });
  }

  if (!postConfidence || postConfidence < 1 || postConfidence > 5) {
    return res.status(400).json({ error: 'Post-confidence must be between 1 and 5' });
  }

  const finalBranch = branches.find(b => b.branchId === finalBranchId);
  if (!finalBranch || finalBranch.decisionId !== req.params.id) {
    return res.status(404).json({ error: 'Final branch not found or does not belong to this decision' });
  }

  // Update decision to COMMITTED state
  const decisionIndex = decisions.findIndex(d => d.decisionId === req.params.id);
  if (decisionIndex !== -1) {
    decisions[decisionIndex].state = 'COMMITTED';
    decisions[decisionIndex].postConfidence = postConfidence;
    decisions[decisionIndex].updatedAt = new Date().toISOString();
  }

  // Log commit event
  const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const commitEvent = {
    eventId,
    userId,
    type: 'METRIC',
    payload: {
      event: 'commit',
      decisionId: req.params.id,
      finalBranchId,
      preConfidence: decision.preConfidence,
      postConfidence,
      confidenceDelta: postConfidence - decision.preConfidence,
      decisionTitle: decision.title,
      finalBranchName: finalBranch.name,
    },
    createdAt: new Date().toISOString(),
  };

  events.push(commitEvent);

  res.json({
    status: 'committed',
    decisionId: req.params.id,
    finalBranchId,
    preConfidence: decision.preConfidence,
    postConfidence,
    confidenceDelta: postConfidence - decision.preConfidence,
  });
});

// Resolve Decision (with optional sub-decision creation)
app.post('/decisions/:id/resolve', (req, res) => {
  const userId = getUserId(req);
  const decision = decisions.find(d => d.decisionId === req.params.id && d.userId === userId);
  
  if (!decision) {
    return res.status(404).json({ error: 'Decision not found' });
  }

  const { finalBranchId, postConfidence, createSubDecision, subDecisionTitle, subDecisionDescription } = req.body;
  
  if (!finalBranchId) {
    return res.status(400).json({ error: 'Final branch ID is required' });
  }

  if (!postConfidence || postConfidence < 1 || postConfidence > 5) {
    return res.status(400).json({ error: 'Post-confidence must be between 1 and 5' });
  }

  const finalBranch = branches.find(b => b.branchId === finalBranchId);
  if (!finalBranch || finalBranch.decisionId !== req.params.id) {
    return res.status(404).json({ error: 'Final branch not found or does not belong to this decision' });
  }

  // Update decision to RESOLVED state
  const decisionIndex = decisions.findIndex(d => d.decisionId === req.params.id);
  if (decisionIndex !== -1) {
    decisions[decisionIndex].state = 'RESOLVED';
    decisions[decisionIndex].postConfidence = postConfidence;
    decisions[decisionIndex].resolvedAt = new Date().toISOString();
    decisions[decisionIndex].updatedAt = new Date().toISOString();
  }

  let subDecision = null;
  
  // Create sub-decision if requested
  if (createSubDecision && subDecisionTitle) {
    subDecision = {
      decisionId: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title: subDecisionTitle,
      description: subDecisionDescription || '',
      preConfidence: 3,
      state: 'DRAFT',
      parentDecisionId: req.params.id,
      parentBranchId: finalBranchId,
      isRootDecision: false,
      createdAt: new Date().toISOString(),
    };
    
    decisions.push(subDecision);
  }

  // Log resolve event
  const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const resolveEvent = {
    eventId,
    userId,
    type: 'METRIC',
    payload: {
      event: 'resolve',
      decisionId: req.params.id,
      finalBranchId,
      preConfidence: decision.preConfidence,
      postConfidence,
      confidenceDelta: postConfidence - decision.preConfidence,
      decisionTitle: decision.title,
      finalBranchName: finalBranch.name,
      subDecisionCreated: !!subDecision,
    },
    createdAt: new Date().toISOString(),
  };

  events.push(resolveEvent);

  res.json({
    status: 'resolved',
    decisionId: req.params.id,
    finalBranchId,
    preConfidence: decision.preConfidence,
    postConfidence,
    confidenceDelta: postConfidence - decision.preConfidence,
    subDecision: subDecision ? {
      decisionId: subDecision.decisionId,
      title: subDecision.title,
      createdAt: subDecision.createdAt,
    } : null,
  });
});

// Get Decision Tree
app.get('/decisions/tree', (req, res) => {
  const userId = getUserId(req);
  const userDecisions = decisions.filter(d => d.userId === userId);
  
  // Build tree structure
  const buildTree = (parentId = null) => {
    return userDecisions
      .filter(d => d.parentDecisionId === parentId)
      .map(decision => ({
        decision,
        branches: branches.filter(b => b.decisionId === decision.decisionId),
        children: buildTree(decision.decisionId),
      }));
  };

  const tree = buildTree();
  const rootDecisions = tree.filter(node => !node.decision.parentDecisionId);
  
  // Calculate tree metrics
  const allDecisions = userDecisions;
  const maxDepth = Math.max(...allDecisions.map(d => {
    let depth = 0;
    let current = d;
    while (current.parentDecisionId) {
      depth++;
      current = allDecisions.find(d2 => d2.decisionId === current.parentDecisionId);
      if (!current) break;
    }
    return depth;
  }));

  res.json({
    rootDecision: rootDecisions[0]?.decision || null,
    nodes: rootDecisions,
    maxDepth: maxDepth + 1,
    totalDecisions: allDecisions.length,
  });
});

// Group Decisions
app.post('/decisions/group', (req, res) => {
  const userId = getUserId(req);
  const { decisionIds, groupName, groupDescription } = req.body;
  
  if (!decisionIds || decisionIds.length < 2) {
    return res.status(400).json({ error: 'At least 2 decisions are required to create a group' });
  }

  if (!groupName) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  // Verify all decisions belong to the user
  const userDecisions = decisions.filter(d => d.userId === userId);
  const validDecisions = decisionIds.filter(id => 
    userDecisions.some(d => d.decisionId === id)
  );

  if (validDecisions.length !== decisionIds.length) {
    return res.status(400).json({ error: 'Some decisions not found or do not belong to user' });
  }

  const group = {
    groupId: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    name: groupName,
    description: groupDescription || '',
    decisionIds: validDecisions,
    createdAt: new Date().toISOString(),
  };

  decisionGroups.push(group);

  res.json({
    groupId: group.groupId,
    name: group.name,
    description: group.description,
    decisionIds: group.decisionIds,
    createdAt: group.createdAt,
  });
});

// Get Decision Groups
app.get('/decisions/groups', (req, res) => {
  const userId = getUserId(req);
  const userGroups = decisionGroups.filter(g => g.userId === userId);
  
  const groupsWithDecisions = userGroups.map(group => ({
    ...group,
    decisions: decisions.filter(d => group.decisionIds.includes(d.decisionId)),
  }));

  res.json({
    groups: groupsWithDecisions,
    count: groupsWithDecisions.length,
  });
});

// Generate Path Forward
app.post('/generate-path-forward', (req, res) => {
  const { originalDecision, chosenPath, pathDescription } = req.body;
  
  if (!originalDecision || !chosenPath || !pathDescription) {
    return res.status(400).json({ error: 'Original decision, chosen path, and path description are required' });
  }

  console.log('Generating path forward for:', { originalDecision, chosenPath, pathDescription });
  console.log('Checking conditions:', {
    originalDecisionLower: originalDecision.toLowerCase(),
    chosenPathLower: chosenPath.toLowerCase(),
    hasOilField: originalDecision.toLowerCase().includes('oil field'),
    hasNegotiate: chosenPath.toLowerCase().includes('negotiate')
  });

  // Generate contextual path forward content based on decision and choice
  let pathForward = {};
  
  if (originalDecision.toLowerCase().includes('oil field') && chosenPath.toLowerCase().includes('negotiate')) {
    pathForward = {
      actionPlan: `For oil field negotiation, research current industry pay scales for your specific role and location. Study union contracts and safety pay structures. Document your experience with hazardous work conditions, certifications, and specialized skills. Prepare a detailed case for hazard pay, overtime rates, and safety bonuses.`,
      potentialOutcomes: `Successful negotiation in oil field work typically results in 15-25% higher base pay, improved safety pay rates, better overtime compensation, and enhanced benefits packages. You could see immediate financial gains within 1-2 months of starting negotiations.`,
      nextSteps: `1) Research current oil field pay scales on Rigzone and OilCareers 2) Join relevant unions like USW or IAM 3) Document all safety certifications and hazardous work experience 4) Schedule meeting with HR or supervisor 5) Present data-driven case for better compensation`,
      timeline: `Week 1-2: Research and data collection. Week 3-4: Prepare negotiation materials and schedule meetings. Week 5-6: Conduct negotiations and follow up. Month 2-3: Implement new compensation structure.`,
      resources: `Rigzone salary surveys, OilCareers job postings, USW union resources, OSHA safety training records, industry-specific negotiation guides, and local oil field worker networks.`
    };
  } else if (originalDecision.toLowerCase().includes('oil field') && chosenPath.toLowerCase().includes('accounting')) {
    pathForward = {
      actionPlan: `Transition from oil field to accounting requires obtaining CPA certification and relevant accounting experience. Start by taking accounting courses, gaining bookkeeping experience, and preparing for the CPA exam. Consider oil and gas accounting specialization for industry relevance.`,
      potentialOutcomes: `Accounting offers more stable income, better work-life balance, and long-term career growth. Starting salary may be lower initially, but CPA certification can lead to 6-figure salaries within 3-5 years.`,
      nextSteps: `1) Enroll in accounting courses or degree program 2) Gain bookkeeping experience 3) Study for CPA exam 4) Network with oil and gas accountants 5) Apply for entry-level accounting positions`,
      timeline: `Month 1-6: Complete accounting education. Month 7-12: Gain practical experience and study for CPA. Year 2: Pass CPA exam and secure accounting position. Year 3+: Advance in accounting career.`,
      resources: `AICPA resources, accounting degree programs, CPA exam prep courses, oil and gas accounting firms, professional accounting associations, and industry-specific accounting software training.`
    };
  } else {
    // Generic fallback
    pathForward = {
      actionPlan: `Based on your decision "${originalDecision}" and chosen path "${chosenPath}", here's your detailed action plan. Research industry-specific requirements and best practices. Network with professionals in this field. Create a step-by-step implementation plan with clear milestones.`,
      potentialOutcomes: `By pursuing "${chosenPath}" in the context of "${originalDecision}", you can expect to see positive changes within 3-6 months. This could include improved career prospects, better work-life balance, or increased earning potential.`,
      nextSteps: `1) Research specific requirements for "${chosenPath}" in your industry 2) Network with professionals who have made similar transitions 3) Create a detailed timeline with specific milestones 4) Start taking concrete action steps this week 5) Monitor progress and adjust your approach as needed`,
      timeline: `Month 1-2: Research and planning phase. Month 3-4: Active implementation and skill development. Month 5-6: Evaluation and refinement of your approach.`,
      resources: `Industry-specific job boards, professional associations, networking events, online courses, mentors in your field, and relevant certification programs.`
    };
  }

  res.json({ pathForward });
});

// Check if clarification is needed
app.post('/check-clarification-needed', async (req, res) => {
  const { decisionTitle, decisionDescription } = req.body;
  
  if (!decisionTitle) {
    return res.status(400).json({ error: 'Decision title is required' });
  }

  try {
    console.log('🤖 Using Claude AI to check if clarification is needed for:', {
      decisionTitle,
      decisionDescription
    });

    // Use real Bedrock function
    const { checkClarificationNeeded } = require('./bedrock-js');
    const result = await checkClarificationNeeded(decisionTitle, decisionDescription || '');
    
    console.log('✅ Clarification check result:', result);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error checking clarification needs:', error);
    res.status(500).json({ error: 'Failed to check clarification needs' });
  }
});

// Generate Clarifying Questions
app.post('/generate-clarifying-questions', async (req, res) => {
  const { decisionTitle, decisionDescription } = req.body;
  
  if (!decisionTitle) {
    return res.status(400).json({ error: 'Decision title is required' });
  }

  try {
    console.log('🤖 Using Claude AI to generate clarifying questions for:', {
      decisionTitle,
      decisionDescription
    });

    // Use real Bedrock function
    const { generateClarifyingQuestions } = require('./bedrock-js');
    const result = await generateClarifyingQuestions(decisionTitle, decisionDescription || '');
    
    console.log('✅ Generated clarifying questions:', result);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error generating clarifying questions:', error);
    res.status(500).json({ error: 'Failed to generate clarifying questions' });
  }
});

// Generate Decision Summary
app.post('/generate-decision-summary', async (req, res) => {
  const { decisionTitle, originalDescription, userResponses } = req.body;
  
  if (!decisionTitle || !userResponses || !Array.isArray(userResponses)) {
    return res.status(400).json({ error: 'Decision title and user responses are required' });
  }

  try {
    console.log('🤖 Using Claude AI to generate decision summary for:', {
      decisionTitle,
      originalDescription,
      responseCount: userResponses.length
    });

    // Use real Bedrock function
    const { generateDecisionSummary } = require('./bedrock-js');
    const result = await generateDecisionSummary(decisionTitle, originalDescription || '', userResponses);
    
    console.log('✅ Generated decision summary:', result);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error generating decision summary:', error);
    res.status(500).json({ error: 'Failed to generate decision summary' });
  }
});

app.listen(port, () => {
  console.log(`🚀 BranchPoint API server running at http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🎯 Ready to handle decision branching requests!`);
});
