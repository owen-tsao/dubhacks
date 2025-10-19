import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { SimulationOutput, ConversationMessage } from '../types';
import { MessageCircle, User, Bot, Clock } from 'lucide-react';
import { formatRelativeTime } from '../utils';

interface SimulationPanelProps {
  conversationId: string;
  messages: ConversationMessage[];
  simulationOutput?: SimulationOutput;
  onSend?: (text: string) => void;
  isLoading?: boolean;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  messages,
  simulationOutput,
  onSend,
  isLoading,
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim() && onSend) {
      onSend(newMessage.trim());
      setNewMessage('');
    }
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'future-you':
        return <Bot className="w-4 h-4" />;
      case 'system':
        return <Clock className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'user':
        return 'bg-primary-100 text-primary-800';
      case 'future-you':
        return 'bg-secondary-100 text-secondary-800';
      case 'system':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Future-You Simulation
          </h3>
          <p className="text-secondary-600">
            Chat with your future self who has already made this decision
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.messageId}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getSenderColor(
                        message.sender
                      )}`}
                    >
                      {getSenderIcon(message.sender)}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-secondary-100 text-secondary-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatRelativeTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-secondary-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            {onSend && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your future self a question..."
                  className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Output Summary */}
      {simulationOutput && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <h4 className="font-semibold text-green-700">Optimistic Scenario</h4>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-700">{simulationOutput.optimisticScenario}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h4 className="font-semibold text-red-700">Challenging Scenario</h4>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-700">{simulationOutput.challengingScenario}</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <h4 className="font-semibold text-secondary-700">Key Questions to Consider</h4>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {simulationOutput.questions.map((question, index) => (
                  <li key={index} className="text-sm text-secondary-700 flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    {question}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <h4 className="font-semibold text-secondary-700">Summary</h4>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-700">{simulationOutput.summary}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};