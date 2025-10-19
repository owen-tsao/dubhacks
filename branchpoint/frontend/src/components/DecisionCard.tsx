import React, { useRef, useEffect, useState } from 'react';
import { Decision } from '../types';
import { formatRelativeTime } from '../utils';
import { ArrowRight, GitBranch, CheckCircle, Clock, TrendingUp, TreePine } from 'lucide-react';

interface DecisionCardProps {
  decision: Decision;
  index: number;
  onView: (decisionId: string) => void;
  onCompare?: (decisionId: string) => void;
  onViewTree?: (decisionId: string) => void;
}

const accentColors = [
  { name: 'orange', value: '#FF7F3F' },
  { name: 'blue', value: '#0066FF' },
  { name: 'green', value: '#00FF88' },
  { name: 'purple', value: '#8B5CF6' },
  { name: 'pink', value: '#EC4899' }
];

const getStateInfo = (state: string) => {
  switch (state) {
    case 'DRAFT':
      return { icon: Clock, label: 'Draft', color: 'text-gray-500' };
    case 'ACTIVE':
      return { icon: GitBranch, label: 'Active', color: 'text-blue-500' };
    case 'COMMITTED':
      return { icon: CheckCircle, label: 'Committed', color: 'text-green-500' };
    case 'RESOLVED':
      return { icon: CheckCircle, label: 'Resolved', color: 'text-purple-500' };
    case 'ARCHIVED':
      return { icon: Clock, label: 'Archived', color: 'text-gray-500' };
    default:
      return { icon: Clock, label: 'Unknown', color: 'text-gray-500' };
  }
};

export const DecisionCard: React.FC<DecisionCardProps> = ({ 
  decision, 
  index, 
  onView, 
  onCompare,
  onViewTree
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const accentColor = accentColors[index % accentColors.length];
  const stateInfo = getStateInfo(decision.state);
  const StateIcon = stateInfo.icon;

  return (
    <div
      ref={cardRef}
      className={`
        relative w-full max-w-4xl mx-auto mb-8 rounded-2xl overflow-hidden
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${isIntersecting ? 'scale-100' : 'scale-95'}
      `}
      style={{
        background: `linear-gradient(135deg, ${accentColor.value} 0%, ${accentColor.value}CC 100%)`,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }}
    >
      {/* Card Content */}
      <div className="p-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm font-medium">
              {new Date(decision.createdAt).getFullYear()}
            </span>
            <div className="w-px h-4 bg-gray-500 opacity-50"></div>
            <div className={`flex items-center space-x-2 ${stateInfo.color}`}>
              <StateIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{stateInfo.label}</span>
            </div>
          </div>
          <button
            onClick={() => onView(decision.decisionId)}
            className="group flex items-center space-x-2 text-black hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-medium">View Details</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-black bg-opacity-20 mb-6"></div>

        {/* Title */}
        <h3 className="text-4xl font-bold text-black mb-6 leading-tight">
          {decision.title}
        </h3>

        {/* Description */}
        {decision.description && (
          <p className="text-black text-opacity-80 text-lg mb-6 leading-relaxed">
            {decision.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-8 text-black text-opacity-70">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              Pre: {decision.preConfidence}/5
            </span>
          </div>
          {decision.postConfidence && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Post: {decision.postConfidence}/5
              </span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {formatRelativeTime(decision.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={() => onView(decision.decisionId)}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 hover:scale-105"
          >
            Explore Branches
          </button>
          {decision.state === 'ACTIVE' && onCompare && (
            <button
              onClick={() => onCompare(decision.decisionId)}
              className="px-6 py-3 bg-white bg-opacity-20 text-black rounded-lg font-medium hover:bg-opacity-30 transition-all duration-200 hover:scale-105"
            >
              Compare
            </button>
          )}
          {decision.state === 'COMMITTED' && onViewTree && (
            <button
              onClick={() => onView(decision.decisionId)}
              className="px-6 py-3 bg-white bg-opacity-20 text-black rounded-lg font-medium hover:bg-opacity-30 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <TreePine className="w-4 h-4" />
              <span>View Tree</span>
            </button>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full rounded-full bg-black"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
        <div className="w-full h-full rounded-full bg-black"></div>
      </div>
    </div>
  );
};
