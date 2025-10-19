import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { CreateDecisionRequest } from '../types';
import { GitBranch, Plus } from 'lucide-react';

interface DecisionCreatorProps {
  onCreate: (data: CreateDecisionRequest) => void;
  isLoading?: boolean;
}

export const DecisionCreator: React.FC<DecisionCreatorProps> = ({ onCreate, isLoading }) => {
  const [formData, setFormData] = useState<CreateDecisionRequest>({
    title: '',
    description: '',
    preConfidence: 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onCreate(formData);
      setFormData({ title: '', description: '', preConfidence: 3 });
    }
  };

  const handleInputChange = (field: keyof CreateDecisionRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
          <GitBranch className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-text-primary mb-4">
          Create Your Decision
        </h2>
        <p className="text-text-secondary text-lg">
          Start by defining your life decision and current confidence level
        </p>
      </div>

      <div className="bg-dark-card rounded-3xl p-8 border border-white border-opacity-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-3">
              Decision Title *
            </label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Should I take the job offer in San Francisco?"
              required
              className="w-full bg-dark-bg border-white border-opacity-20 text-text-primary placeholder-text-muted focus:border-accent-blue focus:ring-accent-blue"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-3">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add more context about your decision..."
              rows={4}
              className="w-full bg-dark-bg border-white border-opacity-20 text-text-primary placeholder-text-muted focus:border-accent-blue focus:ring-accent-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-4">
              Current Confidence Level: {formData.preConfidence}/5
            </label>
            <div className="flex items-center space-x-3">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleInputChange('preConfidence', level)}
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all duration-200 hover:scale-105 ${
                    formData.preConfidence >= level
                      ? 'border-accent-blue bg-accent-blue text-white shadow-lg shadow-accent-blue shadow-opacity-30'
                      : 'border-white border-opacity-30 text-text-secondary hover:border-accent-blue hover:text-accent-blue'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-text-muted mt-3">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-accent-green text-black font-bold hover:opacity-90 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!formData.title.trim() || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Decision...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create Decision</span>
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};