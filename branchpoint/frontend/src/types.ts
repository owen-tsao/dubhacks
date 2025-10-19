export interface User {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Decision {
  decisionId: string;
  userId: string;
  title: string;
  description: string;
  preConfidence: number;
  postConfidence?: number;
  state: 'DRAFT' | 'ACTIVE' | 'COMMITTED' | 'ARCHIVED' | 'RESOLVED';
  createdAt: string;
  parentDecisionId?: string;
  parentBranchId?: string;
  isRootDecision?: boolean;
  children?: Decision[];
  resolvedAt?: string;
}

export interface Branch {
  branchId: string;
  decisionId: string;
  name: string;
  description: string;
  createdAt: string;
  lastSimulatedAt?: string;
  conversations?: Conversation[];
}

export interface ConversationMessage {
  messageId: string;
  sender: 'user' | 'future-you' | 'system';
  text: string;
  createdAt: string;
}

export interface SimulationOutput {
  questions: string[];
  optimisticScenario: string;
  challengingScenario: string;
  summary: string;
  personaStyle: 'analytical' | 'empathetic';
  confidenceDeltaRecommendation?: number;
}

export interface Conversation {
  conversationId: string;
  branchId: string;
  messages: ConversationMessage[];
  simulationOutput?: SimulationOutput;
  createdAt: string;
  updatedAt: string;
}

export interface Comparison {
  comparisonId: string;
  decisionId: string;
  branchesCompared: string[];
  generatedDiff: {
    tradeoffs: string[];
    mergeConflicts: string[];
    recommendedMerge: string;
    confidenceImpact: string;
  };
  createdAt: string;
}

export interface CreateDecisionRequest {
  title: string;
  description?: string;
  preConfidence?: number;
}

export interface CreateBranchRequest {
  name: string;
  description?: string;
}

export interface SimulateRequest {
  branchId: string;
  personaStyle?: 'analytical' | 'empathetic';
  async?: boolean;
}

export interface CommitDecisionRequest {
  finalBranchId: string;
  postConfidence: number;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

export interface DecisionTreeNode {
  decision: Decision;
  branches: Branch[];
  children: DecisionTreeNode[];
  level: number;
  x: number;
  y: number;
}

export interface DecisionTree {
  rootDecision: Decision;
  nodes: DecisionTreeNode[];
  maxDepth: number;
  totalDecisions: number;
}

export interface ResolveDecisionRequest {
  decisionId: string;
  finalBranchId: string;
  postConfidence: number;
  createSubDecision?: boolean;
  subDecisionTitle?: string;
  subDecisionDescription?: string;
}

export interface GroupDecisionsRequest {
  decisionIds: string[];
  groupName: string;
  groupDescription?: string;
}