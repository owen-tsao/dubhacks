import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { apiClient } from '../api';
import { Bot, User, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface DecisionClarificationProps {
  decisionTitle: string;
  originalDescription: string;
  onComplete: (enhancedDescription: string) => void;
  onCancel: () => void;
}

export const DecisionClarification: React.FC<DecisionClarificationProps> = ({
  decisionTitle,
  originalDescription,
  onComplete,
  onCancel
}) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [enhancedDescription, setEnhancedDescription] = useState('');

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      const response = await apiClient.generateClarifyingQuestions(decisionTitle, originalDescription);
      setQuestions(response.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate clarifying questions');
      // Fallback questions
      setQuestions([
        "What's the main reason you're considering this decision right now?",
        "What are the most important factors you're weighing?",
        "What would success look like for you in this situation?",
        "What concerns or fears do you have about this decision?",
        "How does this decision fit into your broader life goals?"
      ]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;

    const newAnswer: QuestionAnswer = {
      question: questions[currentQuestionIndex],
      answer: currentAnswer.trim()
    };

    setAnswers(prev => [...prev, newAnswer]);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      generateSummary();
    }
  };

  const generateSummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const response = await apiClient.generateDecisionSummary(decisionTitle, originalDescription, answers);
      setSummary(response.summary);
      setEnhancedDescription(response.enhancedDescription);
      setShowSummary(true);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate decision summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleConfirm = () => {
    onComplete(enhancedDescription);
  };

  const handleEdit = () => {
    setShowSummary(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
  };

  if (isLoadingQuestions) {
    return (
      <Card className="bg-black border-green-400/20 text-green-400 font-mono">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-green-400" />
            <span>Generating clarifying questions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showSummary) {
    return (
      <Card className="bg-black border-green-400/20 text-green-400 font-mono">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Bot className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-400 mb-4">{summary}</p>
              <div className="flex space-x-3">
                <Button
                  onClick={handleConfirm}
                  className="bg-green-400 text-black hover:bg-green-300 font-mono text-sm px-4 py-2"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Branches
                </Button>
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="border-green-400/30 text-green-400 hover:bg-green-400/10 font-mono text-sm px-4 py-2"
                >
                  Edit Responses
                </Button>
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="border-red-400/30 text-red-400 hover:bg-red-400/10 font-mono text-sm px-4 py-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-green-400/20 text-green-400 font-mono">
      <CardContent className="p-6 space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center space-x-2 text-sm text-green-400/70">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <div className="flex-1 bg-green-400/20 rounded-full h-1">
            <div 
              className="bg-green-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex items-start space-x-3">
          <Bot className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-400 mb-4">{questions[currentQuestionIndex]}</p>
            
            {/* Answer input */}
            <div className="space-y-3">
              <Textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="bg-black border-green-400/30 text-green-400 placeholder-green-400/50 font-mono resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center text-xs text-green-400/70">
                <span>{currentAnswer.length}/500 characters</span>
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={!currentAnswer.trim()}
                  className="bg-green-400 text-black hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm px-4 py-2"
                >
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      {isGeneratingSummary ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Summary...
                        </>
                      ) : (
                        <>
                          Generate Summary
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Previous answers */}
        {answers.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-green-400/20">
            <h4 className="text-sm text-green-400/70 font-mono">Previous Answers:</h4>
            {answers.map((qa, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Bot className="w-4 h-4 text-green-400/70 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-400/70 font-mono">{qa.question}</p>
                </div>
                <div className="flex items-start space-x-2 ml-6">
                  <User className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-400 font-mono">{qa.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel button */}
        <div className="flex justify-end pt-4 border-t border-green-400/20">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-red-400/30 text-red-400 hover:bg-red-400/10 font-mono text-sm px-4 py-2"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
