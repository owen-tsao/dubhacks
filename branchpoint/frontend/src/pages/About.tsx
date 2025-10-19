import React from 'react';
import { Header } from '../components/Header';
import { Brain, GitBranch, BarChart3, Users, Zap, Shield } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern bg-grid">
      <Header currentPage="about" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 animate-fade-in-up">
            About BranchPoint
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            We're revolutionizing how people make life decisions by bringing the power of Git branching to personal choices.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-dark-card">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-8">Our Mission</h2>
            <p className="text-xl text-text-secondary leading-relaxed">
              To help people make better life decisions by providing a structured, AI-powered approach that mirrors how developers manage code changes.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-text-primary mb-16 text-center">
            How BranchPoint Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center animate-fade-in-up flex flex-col items-center h-80">
              <div className="w-20 h-20 bg-accent-orange rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GitBranch className="w-10 h-10 text-black" />
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-4">1. Branch Your Decision</h3>
                <p className="text-text-secondary leading-relaxed text-center">
                  Create multiple paths for any life decision, just like Git branches in code development.
                </p>
              </div>
            </div>
            <div className="text-center animate-fade-in-up flex flex-col items-center h-80" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-4">2. AI Simulation</h3>
                <p className="text-text-secondary leading-relaxed text-center">
                  Chat with your future self who has already made each decision path using advanced AI.
                </p>
              </div>
            </div>
            <div className="text-center animate-fade-in-up flex flex-col items-center h-80" style={{ animationDelay: '0.4s' }}>
              <div className="w-20 h-20 bg-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-4">3. Smart Comparison</h3>
                <p className="text-text-secondary leading-relaxed text-center">
                  Get AI-generated diffs showing tradeoffs, conflicts, and merge recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-dark-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-text-primary mb-16 text-center">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4 h-24">
                <div className="w-12 h-12 bg-accent-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Instant Branching</h3>
                  <p className="text-text-secondary">Create decision branches in seconds with our intuitive terminal interface.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 h-24">
                <div className="w-12 h-12 bg-accent-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-2">AI-Powered Insights</h3>
                  <p className="text-text-secondary">Get personalized advice from Claude AI based on your specific situation.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 h-24">
                <div className="w-12 h-12 bg-accent-purple rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Smart Comparisons</h3>
                  <p className="text-text-secondary">Compare different paths with detailed analysis and recommendations.</p>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="flex items-start space-x-4 h-24">
                <div className="w-12 h-12 bg-accent-orange rounded-lg flex items-center justify-center flex-shrink-0">
                  <GitBranch className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Git-Inspired Workflow</h3>
                  <p className="text-text-secondary">Familiar branching concepts make complex decisions manageable.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 h-24">
                <div className="w-12 h-12 bg-accent-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Future-Self Conversations</h3>
                  <p className="text-text-secondary">Chat with different versions of yourself who made each choice.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 h-24">
                <div className="w-12 h-12 bg-accent-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Privacy First</h3>
                  <p className="text-text-secondary">Your decisions are private and secure, stored locally when possible.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-text-primary mb-8">
            Ready to Make Better Decisions?
          </h2>
          <p className="text-xl text-text-secondary mb-12">
            Join thousands of people who are using BranchPoint to navigate life's biggest choices.
          </p>
          <button
            onClick={() => window.location.href = '/decisions'}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-accent-green text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105"
          >
            <span>Get Started Now</span>
            <GitBranch className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
