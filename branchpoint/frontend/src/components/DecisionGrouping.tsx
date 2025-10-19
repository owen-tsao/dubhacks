import React, { useState } from 'react';
import { Decision, GroupDecisionsRequest } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Folder, FolderOpen, GitBranch, CheckCircle, Clock } from 'lucide-react';

interface DecisionGroupingProps {
  decisions: Decision[];
  onGroupDecisions: (request: GroupDecisionsRequest) => void;
  onUngroupDecisions: (decisionIds: string[]) => void;
  onResolveDecision: (decisionId: string) => void;
}

interface DecisionGroup {
  id: string;
  name: string;
  description?: string;
  decisions: Decision[];
  createdAt: string;
}

export const DecisionGrouping: React.FC<DecisionGroupingProps> = ({
  decisions,
  onGroupDecisions,
  onUngroupDecisions,
  onResolveDecision,
}) => {
  const [selectedDecisions, setSelectedDecisions] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groups, setGroups] = useState<DecisionGroup[]>([]);

  const handleSelectDecision = (decisionId: string) => {
    setSelectedDecisions(prev =>
      prev.includes(decisionId)
        ? prev.filter(id => id !== decisionId)
        : [...prev, decisionId]
    );
  };

  const handleCreateGroup = () => {
    if (selectedDecisions.length < 2 || !groupName.trim()) return;

    const newGroup: DecisionGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: groupName,
      description: groupDescription,
      decisions: decisions.filter(d => selectedDecisions.includes(d.decisionId)),
      createdAt: new Date().toISOString(),
    };

    setGroups(prev => [...prev, newGroup]);
    onGroupDecisions({
      decisionIds: selectedDecisions,
      groupName,
      groupDescription,
    });

    setSelectedDecisions([]);
    setGroupName('');
    setGroupDescription('');
    setIsCreatingGroup(false);
  };

  const handleUngroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      onUngroupDecisions(group.decisions.map(d => d.decisionId));
      setGroups(prev => prev.filter(g => g.id !== groupId));
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'DRAFT':
        return Clock;
      case 'ACTIVE':
        return GitBranch;
      case 'COMMITTED':
        return CheckCircle;
      case 'RESOLVED':
        return CheckCircle;
      case 'ARCHIVED':
        return Clock;
      default:
        return Clock;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'DRAFT':
        return 'text-gray-500';
      case 'ACTIVE':
        return 'text-blue-500';
      case 'COMMITTED':
        return 'text-green-500';
      case 'RESOLVED':
        return 'text-purple-500';
      case 'ARCHIVED':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const ungroupedDecisions = decisions.filter(d => 
    !groups.some(g => g.decisions.some(gd => gd.decisionId === d.decisionId))
  );

  return (
    <div className="space-y-6">
      {/* Group Creation */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Folder className="w-5 h-5 mr-2" />
            Group Decisions
          </h3>
          <p className="text-sm text-gray-600">
            Select related decisions to group them together for better organization
          </p>
        </CardHeader>
        <CardContent>
          {selectedDecisions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Selected {selectedDecisions.length} decision{selectedDecisions.length > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedDecisions.map(decisionId => {
                  const decision = decisions.find(d => d.decisionId === decisionId);
                  return decision ? (
                    <span
                      key={decisionId}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {decision.title}
                      <button
                        onClick={() => handleSelectDecision(decisionId)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {!isCreatingGroup ? (
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsCreatingGroup(true)}
                disabled={selectedDecisions.length < 2}
                size="sm"
              >
                Create Group
              </Button>
              {selectedDecisions.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedDecisions([])}
                  size="sm"
                >
                  Clear Selection
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., College Decision Process"
                required
              />
              <Textarea
                label="Description (Optional)"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Describe what these decisions have in common..."
                rows={2}
              />
              <div className="flex space-x-2">
                <Button onClick={handleCreateGroup} size="sm">
                  Create Group
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingGroup(false);
                    setGroupName('');
                    setGroupDescription('');
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decision Groups */}
      {groups.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Decision Groups</h3>
          {groups.map(group => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FolderOpen className="w-5 h-5 text-blue-500 mr-2" />
                    <h4 className="font-semibold text-gray-900">{group.name}</h4>
                    <span className="ml-2 text-sm text-gray-500">
                      ({group.decisions.length} decisions)
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUngroup(group.id)}
                  >
                    Ungroup
                  </Button>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {group.decisions.map(decision => {
                    const StateIcon = getStateIcon(decision.state);
                    return (
                      <div
                        key={decision.decisionId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <StateIcon className={`w-4 h-4 ${getStateColor(decision.state)}`} />
                          <div>
                            <h5 className="font-medium text-gray-900">{decision.title}</h5>
                            <p className="text-sm text-gray-600">
                              Pre: {decision.preConfidence}/5
                              {decision.postConfidence && ` • Post: ${decision.postConfidence}/5`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium ${getStateColor(decision.state)}`}>
                            {decision.state.toLowerCase()}
                          </span>
                          {decision.state === 'ACTIVE' && (
                            <Button
                              size="sm"
                              onClick={() => onResolveDecision(decision.decisionId)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ungrouped Decisions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Individual Decisions</h3>
        {ungroupedDecisions.length > 0 ? (
          <div className="grid gap-2">
            {ungroupedDecisions.map(decision => {
              const StateIcon = getStateIcon(decision.state);
              return (
                <div
                  key={decision.decisionId}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDecisions.includes(decision.decisionId)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectDecision(decision.decisionId)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedDecisions.includes(decision.decisionId)}
                      onChange={() => handleSelectDecision(decision.decisionId)}
                      className="rounded"
                    />
                    <StateIcon className={`w-4 h-4 ${getStateColor(decision.state)}`} />
                    <div>
                      <h5 className="font-medium text-gray-900">{decision.title}</h5>
                      <p className="text-sm text-gray-600">
                        Pre: {decision.preConfidence}/5
                        {decision.postConfidence && ` • Post: ${decision.postConfidence}/5`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${getStateColor(decision.state)}`}>
                      {decision.state.toLowerCase()}
                    </span>
                    {decision.state === 'ACTIVE' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onResolveDecision(decision.decisionId);
                        }}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">All decisions are grouped</p>
        )}
      </div>
    </div>
  );
};
