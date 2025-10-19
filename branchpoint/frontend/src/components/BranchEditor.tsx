import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card, CardContent, CardHeader } from './ui/Card';
import { CreateBranchRequest } from '../types';
import { GitBranch, Play } from 'lucide-react';

interface BranchEditorProps {
  onCreate: (data: CreateBranchRequest) => void;
  onSimulate: (branchId: string, personaStyle: 'analytical' | 'empathetic') => void;
  branches: Array<{ branchId: string; name: string; description: string; lastSimulatedAt?: string }>;
  isCreating?: boolean;
  isSimulating?: string;
}

export const BranchEditor: React.FC<BranchEditorProps> = ({
  onCreate,
  onSimulate,
  branches,
  isCreating,
  isSimulating,
}) => {
  const [formData, setFormData] = useState<CreateBranchRequest>({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreate(formData);
      setFormData({ name: '', description: '' });
    }
  };

  const handleInputChange = (field: keyof CreateBranchRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <GitBranch className="w-5 h-5 mr-2" />
            Create New Branch
          </h3>
          <p className="text-secondary-600">Define a different path for your decision</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Branch Name"
              placeholder="e.g., Go to Grad School"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
            
            <Textarea
              label="Description (Optional)"
              placeholder="Describe what this path involves..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
            />
            
            <Button
              type="submit"
              disabled={!formData.name.trim() || isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating...' : 'Create Branch'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {branches.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-secondary-900">Existing Branches</h4>
          <div className="grid gap-4">
            {branches.map((branch) => (
              <Card key={branch.branchId}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-secondary-900">{branch.name}</h5>
                      {branch.description && (
                        <p className="text-sm text-secondary-600 mt-1">{branch.description}</p>
                      )}
                      {branch.lastSimulatedAt && (
                        <p className="text-xs text-secondary-500 mt-1">
                          Last simulated: {new Date(branch.lastSimulatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSimulate(branch.branchId, 'analytical')}
                        disabled={isSimulating === branch.branchId}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {isSimulating === branch.branchId ? 'Simulating...' : 'Simulate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};