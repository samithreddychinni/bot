
import React, { useState } from 'react';
import { KnowledgeItem, KnowledgeItemType } from '../types';
import { getSummary } from '../services/geminiService';

const MOCK_KNOWLEDGE: KnowledgeItem[] = [
    { id: '1', type: KnowledgeItemType.PDF, title: "Lecture Notes - Week 5.pdf", summary: "Covers the Krebs Cycle and electron transport chain. Key diagrams on pages 3 and 5.", source: "Lecture Notes - Week 5.pdf", dateAdded: "2023-10-12" },
    { id: '2', type: KnowledgeItemType.URL, title: "Quantum Computing Explained", summary: "An article explaining the basics of quantum computing, including qubits, superposition, and entanglement.", source: "https://example.com/quantum", dateAdded: "2023-10-23" },
];

const KnowledgeItemCard: React.FC<{ item: KnowledgeItem }> = ({ item }) => (
    <div className="bg-secondary p-4 rounded-lg flex flex-col justify-between">
        <div>
            <div className="flex items-center mb-2">
                <span className={`mr-2 p-2 rounded-full ${item.type === KnowledgeItemType.PDF ? 'bg-danger/20' : 'bg-success/20'}`}>
                    {item.type === KnowledgeItemType.PDF ? 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-danger"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> :
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-success"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                    }
                </span>
                <h3 className="font-bold text-lg truncate text-text-primary">{item.title}</h3>
            </div>
            <p className="text-sm text-text-secondary mb-4 line-clamp-3">{item.summary}</p>
        </div>
        <div className="flex justify-end space-x-2 mt-auto">
            <button className="text-sm px-3 py-1 bg-primary hover:bg-primary/70 rounded-md">Ask Q&A</button>
            <button className="text-sm px-3 py-1 bg-accent hover:bg-accent/80 text-primary rounded-md">View Summary</button>
        </div>
    </div>
);

export const KnowledgeBase: React.FC = () => {
    const [items, setItems] = useState<KnowledgeItem[]>(MOCK_KNOWLEDGE);
    const [newItemSource, setNewItemSource] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAddItem = async () => {
        if (!newItemSource.trim() || isProcessing) return;

        setIsProcessing(true);
        const isUrl = newItemSource.startsWith('http');
        const type = isUrl ? KnowledgeItemType.URL : KnowledgeItemType.PDF;
        const title = isUrl ? new URL(newItemSource).hostname : newItemSource.split('\\').pop()?.split('/').pop() || "Uploaded File";

        const summary = await getSummary(newItemSource, type);

        const newItem: KnowledgeItem = {
            id: Date.now().toString(),
            type,
            title,
            summary,
            source: newItemSource,
            dateAdded: new Date().toLocaleDateString('en-CA'),
        };

        setItems(prev => [newItem, ...prev]);
        setNewItemSource('');
        setIsProcessing(false);
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-4xl font-bold mb-2">Knowledge Base</h1>
            <p className="text-text-secondary mb-8">Ingest documents and links to make them searchable and available for Q&A.</p>
            
            <div className="mb-8 p-6 bg-secondary rounded-xl">
                 <h2 className="text-2xl font-semibold mb-4 text-highlight">Add New Item</h2>
                 <div className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={newItemSource}
                        onChange={(e) => setNewItemSource(e.target.value)}
                        placeholder="Paste a URL or select a file..."
                        className="w-full px-4 py-3 bg-primary border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                     <input type="file" id="file-upload" className="hidden" onChange={(e) => e.target.files && setNewItemSource(e.target.files[0].name)} />
                     <label htmlFor="file-upload" className="cursor-pointer px-6 py-3 font-semibold text-primary bg-text-secondary rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                         Upload PDF
                     </label>
                    <button
                        onClick={handleAddItem}
                        disabled={isProcessing}
                        className="px-6 py-3 font-semibold text-primary bg-accent rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isProcessing ? 'Processing...' : 'Ingest'}
                    </button>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => <KnowledgeItemCard key={item.id} item={item} />)}
            </div>
        </div>
    );
};
