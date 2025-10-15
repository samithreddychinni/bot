
import React, { useState } from 'react';
import { Memory } from '../types';

const MOCK_MEMORIES: Memory[] = [
    { id: '1', content: "Quantum superposition is both confusing but fascinating. Need to read more about Schrödinger's cat experiment.", date: '2023-10-22', tags: ['physics', 'study'] },
    { id: '2', content: 'Met with the study group for Calculus. John explained derivatives in a really clear way.', date: '2023-10-20', tags: ['calculus', 'study group'] },
    { id: '3', content: 'Idea for final English paper: analyze the theme of isolation in Frankenstein.', date: '2023-10-18', tags: ['english', 'idea'] },
    { id: '4', content: "Don't forget to book flights for winter break before prices go up.", date: '2023-10-15', tags: ['personal', 'travel'] },
    { id: '5', content: "The lecture on cellular respiration was dense. The Krebs cycle is the most complex part to remember.", date: '2023-10-12', tags: ['biology', 'lecture notes'] },
];

const MemoryCard: React.FC<{ memory: Memory }> = ({ memory }) => (
    <div className="bg-secondary p-4 rounded-lg shadow-md transition-transform hover:scale-105">
        <p className="text-text-primary mb-2">"{memory.content}"</p>
        <div className="flex justify-between items-center text-sm text-text-secondary">
            <span>{memory.date}</span>
            <div className="flex space-x-2">
                {memory.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-primary text-accent rounded-full text-xs">{tag}</span>
                ))}
            </div>
        </div>
    </div>
);

export const MemoryLane: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMemories, setFilteredMemories] = useState<Memory[]>(MOCK_MEMORIES);
    
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        if (term === '') {
            setFilteredMemories(MOCK_MEMORIES);
        } else {
            // This is a simple keyword search. A real vector DB would allow conceptual search.
            // e.g., searching "what did I find confusing about physics" would match memory ID 1.
            const results = MOCK_MEMORIES.filter(m => 
                m.content.toLowerCase().includes(term) ||
                m.tags.some(t => t.toLowerCase().includes(term))
            );
            setFilteredMemories(results);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-4xl font-bold mb-2">Memory Lane</h1>
            <p className="text-text-secondary mb-8">Search your saved thoughts and notes. Try asking a conceptual question!</p>
            
            <div className="mb-8 relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="What were my thoughts on the quantum mechanics lecture?"
                    className="w-full p-4 pl-12 bg-secondary border border-secondary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMemories.length > 0 ? (
                    filteredMemories.map(memory => <MemoryCard key={memory.id} memory={memory} />)
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-text-secondary">No memories found for your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
