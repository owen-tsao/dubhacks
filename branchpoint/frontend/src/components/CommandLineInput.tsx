import React, { useState, useRef, useEffect } from 'react';
import { Terminal, GitBranch } from 'lucide-react';
import { DecisionClarification } from './DecisionClarification';
import { apiClient } from '../api';

interface CommandLineInputProps {
  onSubmit: (decisionTitle: string, description?: string, confidence?: number) => void;
  isLoading?: boolean;
}

export const CommandLineInput: React.FC<CommandLineInputProps> = ({ 
  onSubmit, 
  isLoading = false 
}) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [step, setStep] = useState<'title' | 'description' | 'confidence'>('title');
  const [decisionTitle, setDecisionTitle] = useState('');
  const [description, setDescription] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [showClarification, setShowClarification] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to detect vague descriptions
  const isVagueDescription = (description: string): boolean => {
    const vaguePatterns = [
      /^(i want|i need|i should|i think|i feel|i hope|i wish)/i,
      /^(explore|try|consider|maybe|perhaps|possibly)/i,
      /^(new opportunities|new options|new choices|new paths)/i,
      /^(better|good|best|right|correct)/i,
      /^(change|different|something else|other)/i,
      /^(not sure|unsure|don't know|unclear)/i,
      /^(help|advice|guidance|suggestions)/i,
      /^(what should|how should|when should|where should)/i,
      /^(confused|stuck|lost|torn|divided)/i,
      /^(just|simply|basically|basically just)/i
    ];
    
    const vagueKeywords = [
      'opportunities', 'options', 'choices', 'paths', 'ways', 'things',
      'something', 'anything', 'everything', 'nothing', 'better', 'good',
      'best', 'right', 'correct', 'proper', 'appropriate', 'suitable',
      'change', 'different', 'new', 'other', 'alternative', 'else',
      'help', 'advice', 'guidance', 'suggestions', 'recommendations',
      'confused', 'stuck', 'lost', 'torn', 'divided', 'unsure', 'unclear'
    ];
    
    const lowerDesc = description.toLowerCase().trim();
    
    // Check for vague patterns
    if (vaguePatterns.some(pattern => pattern.test(lowerDesc))) {
      return true;
    }
    
    // Check for vague keywords (if description is short and contains vague words)
    if (description.length < 50) {
      const wordCount = lowerDesc.split(/\s+/).length;
      const vagueWordCount = vagueKeywords.filter(keyword => 
        lowerDesc.includes(keyword)
      ).length;
      
      // If more than 30% of words are vague, consider it vague
      if (vagueWordCount > 0 && (vagueWordCount / wordCount) > 0.3) {
        return true;
      }
    }
    
    return false;
  };

  // Function to check if clarification is needed using AI
  const checkIfClarificationNeeded = async (title: string, desc: string) => {
    try {
      const response = await apiClient.generateClarifyingQuestions(title, desc);
      if (response.questions && response.questions.length > 0) {
        setShowClarification(true);
      } else {
        // No clarification needed, proceed to confidence step
        setStep('confidence');
      }
    } catch (error) {
      console.error('Error checking clarification:', error);
      // On error, proceed to confidence step
      setStep('confidence');
    }
  };

  // Function to handle clarification completion
  const handleClarificationComplete = (enhancedDescription: string) => {
    setDescription(enhancedDescription);
    setShowClarification(false);
    setStep('confidence');
  };

  // Function to handle clarification skip
  const handleClarificationSkip = () => {
    setShowClarification(false);
    setStep('confidence');
  };


  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    if (trimmedInput) {
      if (step === 'title') {
        // Store the decision title and move to description step
        const title = trimmedInput;
        setDecisionTitle(title);
        setInput('');
        setStep('description');
        console.log(`$ life branch ${title}`);
      } else if (step === 'description') {
        // Store description and check if clarification is needed
        const desc = trimmedInput;
        setDescription(desc);
        setInput('');
        
        // Always check with AI if clarification is needed for realistic simulation
        checkIfClarificationNeeded(decisionTitle, desc);
        console.log(`$ describe --decision ${desc}`);
      } else if (step === 'confidence') {
        // Parse confidence level and submit all
        const confInput = trimmedInput;
        const confLevel = parseInt(confInput);
        
        if (confLevel >= 1 && confLevel <= 5) {
          setConfidence(confLevel);
          
          // Remove "life branch" prefix if present before saving
          let finalTitle = decisionTitle;
          if (finalTitle.toLowerCase().startsWith('life branch')) {
            finalTitle = finalTitle.substring(11).trim(); // Remove "life branch " (11 characters)
          }
          
          console.log(`$ life branch ${decisionTitle} - ${description} --confidence ${confLevel}`);
          onSubmit(finalTitle, description, confLevel);
          
          // Reset for next decision
          setInput('');
          setDecisionTitle('');
          setDescription('');
          setConfidence(3);
          setStep('title');
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Reset to title step
      setInput('');
      setDecisionTitle('');
      setDescription('');
      setConfidence(3);
      setStep('title');
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Limit input length to prevent overflow
    const maxLength = step === 'title' ? 100 : step === 'description' ? 200 : 1;
    if (value.length <= maxLength) {
      setInput(value);
      // Ensure input stays focused
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Show clarification component if needed
  if (showClarification) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <DecisionClarification
          decisionTitle={decisionTitle}
          originalDescription={description}
          onComplete={handleClarificationComplete}
          onSkip={handleClarificationSkip}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-black rounded-lg border border-gray-700 overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-gray-800 px-4 py-2 flex items-center space-x-2 border-b border-gray-700">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-mono">BranchPoint Terminal</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-6 space-y-4">
          {/* Welcome Message */}
          <div className="flex items-center space-x-2 text-green-400">
            <GitBranch className="w-5 h-5" />
            <span className="font-mono text-sm">
              Welcome to BranchPoint - Code Your Life Decisions Like Git
            </span>
          </div>

          {/* Help Text */}
          <div className="text-gray-500 text-sm font-mono">
            # Type your decision to create a new branch...
          </div>

          {/* Show previous step info */}
          {step === 'description' && decisionTitle && (
            <div className="mb-4 p-3 bg-gray-900 rounded border-l-2 border-green-400">
              <div className="text-green-400 text-sm font-mono">
                <span className="text-blue-400">life</span> <span className="text-purple-400">branch</span> {decisionTitle}
              </div>
              <div className="text-gray-500 text-sm mt-1 font-mono">
                # Now add a description for this decision...
              </div>
            </div>
          )}

          {step === 'confidence' && decisionTitle && description && (
            <div className="mb-4 p-3 bg-gray-900 rounded border-l-2 border-green-400">
              <div className="text-green-400 text-sm font-mono">
                <span className="text-blue-400">life</span> <span className="text-purple-400">branch</span> {decisionTitle}
              </div>
              <div className="text-gray-500 text-sm mt-1 font-mono">
                # Description: {description}
              </div>
              <div className="text-gray-500 text-sm mt-1 font-mono">
                # Now set your confidence level (1-5)...
              </div>
            </div>
          )}

          {/* Command Input */}
          <form onSubmit={handleSubmit} className="flex items-center">
            <div className="flex items-center space-x-2 text-green-400">
              <span className="select-none text-green-400 font-mono">$</span>
              <span className="text-blue-400">life</span>
              <span className="text-purple-400">branch</span>
            </div>
            
            <div className="flex-1 relative ml-2 overflow-hidden">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  step === 'title' ? '[enter your decision]' :
                  step === 'description' ? '[add description]' : '[1-5]'
                }
                className="w-full bg-transparent text-green-400 placeholder-gray-600 outline-none border-none font-mono text-sm"
                disabled={isLoading}
              />
              
            </div>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-4 text-yellow-400 flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
              <span className="text-sm font-mono">Processing your decision...</span>
            </div>
          )}

          {/* Help Text */}
          <div className="text-gray-500 text-sm font-mono">
            {step === 'title' && '# Press Enter to continue, Esc to reset'}
            {step === 'description' && '# Press Enter to continue, Esc to reset'}
            {step === 'confidence' && '# Press Enter to create decision, Esc to reset'}
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-700 font-mono">
          <div className="flex items-center space-x-4">
            <span>Status: Ready</span>
            <span>•</span>
            <span>Decisions: Git-inspired branching</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};