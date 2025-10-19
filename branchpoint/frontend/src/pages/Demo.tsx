import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GitBranch, Brain, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';

export const Demo: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Create a Decision",
      description: "Start by defining your life decision with a title, description, and confidence level.",
      example: "Should I take a job offer in a new city or stay in my current role?",
      icon: <GitBranch className="w-8 h-8" />,
    },
    {
      title: "Branch Your Options",
      description: "Create different paths for your decision, just like Git branches in code.",
      example: "Branch 1: Accept the job offer\nBranch 2: Stay in current role\nBranch 3: Negotiate remote work",
      icon: <GitBranch className="w-8 h-8" />,
    },
    {
      title: "Simulate with AI",
      description: "Chat with your future self who has already experienced each path.",
      example: "Future-You: 'I chose the new city job. Here's what I learned about the tradeoffs...'",
      icon: <Brain className="w-8 h-8" />,
    },
    {
      title: "Compare & Analyze",
      description: "Get AI-generated diffs showing tradeoffs, conflicts, and recommendations.",
      example: "Tradeoffs: Higher salary vs. leaving friends\nConflicts: Time zone differences vs. career growth",
      icon: <BarChart3 className="w-8 h-8" />,
    },
    {
      title: "Commit Your Decision",
      description: "Make your final choice with increased confidence and clarity.",
      example: "Committed to: Accept the job offer\nConfidence improved from 3/5 to 4/5",
      icon: <CheckCircle className="w-8 h-8" />,
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startDemo = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            BranchPoint Demo
          </h1>
          <p className="text-xl text-secondary-600">
            See how BranchPoint helps you make better life decisions
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-secondary-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-secondary-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                {steps[currentStep].icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  {steps[currentStep].title}
                </h2>
                <p className="text-secondary-600 mt-1">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary-50 p-6 rounded-lg">
              <h3 className="font-semibold text-secondary-900 mb-2">Example:</h3>
              <pre className="text-sm text-secondary-700 whitespace-pre-wrap">
                {steps[currentStep].example}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary-600'
                    : index < currentStep
                    ? 'bg-primary-300'
                    : 'bg-secondary-300'
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button onClick={startDemo} size="lg">
              Try It Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button onClick={nextStep} size="lg">
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>

        {/* Key Benefits */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-secondary-900 mb-8">
            Why BranchPoint Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-semibold text-secondary-900 mb-2">AI-Powered Insights</h4>
                <p className="text-sm text-secondary-600">
                  Get personalized analysis from your future self perspective
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-semibold text-secondary-900 mb-2">Familiar Workflow</h4>
                <p className="text-sm text-secondary-600">
                  Use Git-like branching concepts you already know from coding
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-semibold text-secondary-900 mb-2">Data-Driven Decisions</h4>
                <p className="text-sm text-secondary-600">
                  Track confidence changes and decision outcomes over time
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};