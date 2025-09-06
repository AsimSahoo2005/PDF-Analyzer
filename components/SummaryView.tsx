import React, { useState } from 'react';
import { ActiveTab, SummaryLength } from '../types';
import ResultCard from './ResultCard';
import { SparklesIcon } from './Icons';

interface SummaryViewProps {
    summary: string;
    isLoading: boolean;
    onGenerate: (tab: ActiveTab, options: { summaryLength: SummaryLength }) => Promise<void>;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary, isLoading, onGenerate }) => {
    const [selectedLength, setSelectedLength] = useState<SummaryLength>(SummaryLength.MEDIUM);

    const handleGenerateClick = () => {
        onGenerate(ActiveTab.SUMMARY, { summaryLength: selectedLength });
    };

    return (
        <div className="bg-gray-900 rounded-lg">
            <div className="p-4 sm:p-6 border-b border-gray-700 flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-400">Length:</span>
                    <div className="flex items-center bg-gray-800 rounded-lg p-1">
                        {(Object.values(SummaryLength)).map(len => (
                            <button
                                key={len}
                                onClick={() => setSelectedLength(len)}
                                className={`capitalize text-sm font-semibold px-3 py-1 rounded-md transition-colors ${
                                    selectedLength === len ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {len}
                            </button>
                        ))}
                    </div>
                 </div>
                 <button
                    onClick={handleGenerateClick}
                    disabled={isLoading}
                    className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-800 disabled:cursor-not-allowed"
                 >
                    {isLoading ? 'Generating...' : 'Regenerate'}
                 </button>
            </div>
            <ResultCard 
                title={
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-purple-400" />
                        <span>AI Generated Summary</span>
                    </div>
                }
                content={summary}
                isLoading={isLoading}
                placeholder="Select a summary length and click generate."
                contentType="summary"
            />
        </div>
    );
};

export default SummaryView;