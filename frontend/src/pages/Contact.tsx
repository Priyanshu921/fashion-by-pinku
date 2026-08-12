import { useState } from 'react';
import { StaticPage } from '../components/StaticPage';

export const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.success('Thank you for reaching out. We will get back to you shortly.');
        setName('');
        setEmail('');
        setMessage('');
      });
    }
  };

  return (
    <StaticPage title="Contact Us" subtitle="Get in touch with our concierge team">
      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
        <div>
          <label className="block text-sm font-mono uppercase tracking-widest text-white/70 mb-2">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="appearance-none block w-full px-4 py-3 border border-white/10 bg-black/50 placeholder-white/30 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink focus:border-brand-pink transition-colors font-mono"
            placeholder="YOUR NAME"
          />
        </div>
        <div>
          <label className="block text-sm font-mono uppercase tracking-widest text-white/70 mb-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-4 py-3 border border-white/10 bg-black/50 placeholder-white/30 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink focus:border-brand-pink transition-colors font-mono"
            placeholder="YOUR EMAIL"
          />
        </div>
        <div>
          <label className="block text-sm font-mono uppercase tracking-widest text-white/70 mb-2">Message</label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="appearance-none block w-full px-4 py-3 border border-white/10 bg-black/50 placeholder-white/30 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink focus:border-brand-pink transition-colors font-mono resize-none"
            placeholder="HOW CAN WE HELP YOU?"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold uppercase tracking-widest rounded-full text-black bg-brand-pink hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink transition-colors shadow-[0_0_20px_rgba(255,209,220,0.3)] cursor-pointer"
        >
          Send Message
        </button>
      </form>
    </StaticPage>
  );
};
