import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Brain, BarChart3, ArrowRight, GitBranch } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern bg-grid">
      <Header currentPage="home" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 animate-fade-in-up">
            branchpoint
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            Code your life decisions like Git. Create branches, simulate outcomes, 
            and merge your way to better decisions with AI-powered future-self conversations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up">
            <button
              onClick={() => navigate('/decisions')}
              className="px-8 py-4 bg-accent-green text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105"
            >
              Start Your First Decision
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="px-8 py-4 border border-gray-400 text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-5 transition-all duration-200"
            >
              View Demo
            </button>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-20 px-6 bg-dark-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-text-primary mb-16 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center animate-fade-in-up flex flex-col items-center h-80">
              <div className="w-20 h-20 bg-accent-orange rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GitBranch className="w-10 h-10 text-black" />
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-4">Branch Your Decisions</h3>
                <p className="text-text-secondary leading-relaxed text-center">
                  Create multiple paths for any life decision, just like Git branches in code.
                </p>
              </div>
            </div>
            <div className="text-center animate-fade-in-up flex flex-col items-center h-80" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-4">AI Simulation</h3>
                <p className="text-text-secondary leading-relaxed text-center">
                  Chat with your future self who has already made each decision path.
                </p>
              </div>
            </div>
            <div className="text-center animate-fade-in-up flex flex-col items-center h-80" style={{ animationDelay: '0.4s' }}>
              <div className="w-20 h-20 bg-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-4">Smart Comparison</h3>
                <p className="text-text-secondary leading-relaxed text-center">
                  Get AI-generated diffs showing tradeoffs, conflicts, and recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-text-primary mb-8">
            Ready to Make Better Decisions?
          </h2>
          <p className="text-xl text-text-secondary mb-12">
            Join thousands of people who are using BranchPoint to navigate life's biggest choices.
          </p>
          <button
            onClick={() => navigate('/decisions')}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-accent-green text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};