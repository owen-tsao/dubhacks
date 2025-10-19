import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Plus, FileText, Search, Filter, Calendar, Tag } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Decision Making Framework',
      content: 'When facing a major life decision, consider these factors:\n\n1. Long-term impact (5+ years)\n2. Alignment with core values\n3. Opportunity cost\n4. Risk vs. reward\n5. Gut feeling after research\n\nUse BranchPoint to simulate different paths and get AI insights.',
      tags: ['framework', 'decision-making', 'process'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Career Change Considerations',
      content: 'Key questions to ask when considering a career change:\n\n- What am I running towards vs. running away from?\n- How does this align with my long-term goals?\n- What skills do I need to develop?\n- What\'s the financial impact?\n- How will this affect my relationships?\n\nUse BranchPoint to simulate both staying and leaving scenarios.',
      tags: ['career', 'change', 'planning'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12')
    },
    {
      id: '3',
      title: 'Relationship Decision Template',
      content: 'Template for relationship decisions:\n\n1. Current state assessment\n2. Future vision alignment\n3. Communication patterns\n4. Shared values check\n5. Growth potential\n6. Deal breakers\n\nSimulate different relationship paths using BranchPoint\'s AI conversations.',
      tags: ['relationships', 'template', 'decision-making'],
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes([note, ...notes]);
      setNewNote({ title: '', content: '', tags: '' });
      setShowNewNote(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern bg-grid">
      <Header currentPage="notes" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-2">
              <FileText className="w-8 h-8" />
              <span>Decision Notes</span>
            </h1>
            <p className="text-gray-400">
              Capture insights, frameworks, and learnings from your decision-making process
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-green"
              />
            </div>

            {/* Tag Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <select
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className="px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-green"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* New Note Button */}
            <button
              onClick={() => setShowNewNote(true)}
              className="px-6 py-3 bg-accent-green text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        </div>
      </section>

      {/* Notes Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-4">
                {searchTerm || selectedTag ? 'No notes match your search' : 'No notes yet'}
              </p>
              <p className="text-gray-500">
                {searchTerm || selectedTag ? 'Try adjusting your search terms' : 'Create your first note to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredNotes.map((note) => (
                <div key={note.id} className="bg-dark-card rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-text-primary">{note.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(note.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="text-text-secondary mb-4 whitespace-pre-line">
                    {note.content}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-accent-blue bg-opacity-20 text-accent-blue text-xs rounded-full flex items-center space-x-1"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Note Modal */}
      {showNewNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Create New Note</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-green"
                  placeholder="Enter note title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Content
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-green resize-none"
                  placeholder="Enter your note content..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newNote.tags}
                  onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-green"
                  placeholder="e.g., career, decision-making, framework"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowNewNote(false)}
                className="px-6 py-3 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                className="px-6 py-3 bg-accent-green text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
