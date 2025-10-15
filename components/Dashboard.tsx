
import React, { useState } from 'react';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-secondary p-6 rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

const QuickCapture: React.FC = () => {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            console.log("Captured:", input);
            // Here you would typically send this to your backend service
            alert(`Your thought has been captured: "${input}"`);
            setInput('');
        }
    };

    return (
        <div className="flex items-center space-x-3">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Capture a thought, reminder, or task..."
                className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
                onClick={handleSend}
                className="px-6 py-3 font-semibold text-primary bg-accent rounded-lg hover:opacity-90 transition-opacity"
            >
                Save
            </button>
        </div>
    );
};


export const Dashboard: React.FC = () => {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-4xl font-bold mb-2">Good Morning!</h1>
      <p className="text-text-secondary mb-8">Here's what's on your plate today. Let's have a great day!</p>
      
      <div className="mb-8">
        <Card>
            <h2 className="text-2xl font-semibold mb-4 text-highlight">Quick Capture</h2>
            <QuickCapture/>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-2xl font-semibold mb-4 text-highlight">Daily Digest</h2>
          <div className="space-y-4">
            <p className="text-text-primary">Your AI assistant has prepared a summary for today, October 26th:</p>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
              <li><strong className="text-text-primary">Calculus Assignment:</strong> Due today at 5:00 PM.</li>
              <li><strong className="text-text-primary">Call the Library:</strong> Reminder for 12:00 PM regarding book reservation.</li>
              <li><strong className="text-text-primary">Study Group:</strong> Physics study group at 7:00 PM in the main library.</li>
            </ul>
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold mb-4 text-highlight">Upcoming Reminders</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary rounded-lg">
                <div>
                    <p className="font-medium">Finish Project Proposal</p>
                    <p className="text-sm text-text-secondary">Due: Tomorrow, 11:59 PM</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-highlight text-primary">High Priority</span>
            </div>
             <div className="flex items-center justify-between p-3 bg-primary rounded-lg">
                <div>
                    <p className="font-medium">Buy groceries</p>
                    <p className="text-sm text-text-secondary">Reminder: Today, 6:00 PM</p>
                </div>
                 <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent text-primary">Medium</span>
            </div>
             <div className="flex items-center justify-between p-3 bg-primary rounded-lg">
                <div>
                    <p className="font-medium">Email Prof. Smith</p>
                    <p className="text-sm text-text-secondary">Due: Oct 28th</p>
                </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
