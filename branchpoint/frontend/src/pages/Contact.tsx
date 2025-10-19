import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Mail, MessageCircle, Github, Twitter, Send, CheckCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg bg-grid-pattern bg-grid">
      <Header currentPage="contact" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 animate-fade-in-up">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            Have questions about BranchPoint? Want to share feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 px-6 bg-dark-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-text-primary mb-16 text-center">
            Ways to Reach Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-accent-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">Email Us</h3>
              <p className="text-text-secondary mb-4">
                Send us a detailed message and we'll get back to you within 24 hours.
              </p>
              <a 
                href="mailto:hello@branchpoint.app"
                className="text-accent-green hover:opacity-80 transition-opacity font-medium"
              >
                hello@branchpoint.app
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">Live Chat</h3>
              <p className="text-text-secondary mb-4">
                Chat with our team in real-time for immediate assistance.
              </p>
              <button className="text-accent-blue hover:opacity-80 transition-opacity font-medium">
                Start Chat
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Github className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">GitHub</h3>
              <p className="text-text-secondary mb-4">
                Report bugs, request features, or contribute to our open source projects.
              </p>
              <a 
                href="https://github.com/branchpoint"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-purple hover:opacity-80 transition-opacity font-medium"
              >
                @branchpoint
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-primary mb-4">Send us a Message</h2>
            <p className="text-text-secondary">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-accent-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-text-primary mb-2">Message Sent!</h3>
              <p className="text-text-secondary">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-green transition-colors"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-green transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-green transition-colors"
                  placeholder="What's this about?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-green transition-colors resize-none"
                  placeholder="Tell us more about your question or feedback..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-accent-green text-black font-bold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Social Links */}
      <section className="py-20 px-6 bg-dark-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-8">Follow Our Journey</h2>
          <p className="text-text-secondary mb-12">
            Stay updated with the latest BranchPoint features and decision-making insights.
          </p>
          
          <div className="flex justify-center space-x-8">
            <a
              href="https://twitter.com/branchpoint"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-400 hover:text-accent-blue transition-colors"
            >
              <Twitter className="w-6 h-6" />
              <span>Twitter</span>
            </a>
            
            <a
              href="https://github.com/branchpoint"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-400 hover:text-accent-purple transition-colors"
            >
              <Github className="w-6 h-6" />
              <span>GitHub</span>
            </a>
            
            <a
              href="mailto:hello@branchpoint.app"
              className="flex items-center space-x-2 text-gray-400 hover:text-accent-green transition-colors"
            >
              <Mail className="w-6 h-6" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
