import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';

interface HeaderProps {
  currentPage?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'decisions', path: '/decisions' },
    { label: 'about', path: '/about' },
    { label: 'notes', path: '/notes' },
    { label: 'contact', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm border-b border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="text-white text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            .branchpoint
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`
                  text-white text-sm font-medium hover:opacity-80 transition-opacity capitalize
                  ${currentPage === item.label ? 'opacity-100' : 'opacity-70'}
                `}
              >
                {item.label}
              </button>
            ))}
            <Button
              onClick={() => navigate('/')}
              className="bg-accent-green text-black hover:bg-accent-green hover:opacity-90 font-medium"
            >
              get started
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
