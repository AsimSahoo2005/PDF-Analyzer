import React, { useState, useEffect } from 'react';
import { ActiveTab, SummaryLength, QuizQuestion } from '../types';
import ResultCard from './ResultCard';
import SummaryView from './SummaryView';
import QuizView from './QuizView';
import { DocumentIcon, ResetIcon, StrategyIcon } from './Icons';

interface ResultDisplayProps {
    fileName: string;
    onAnalyze: (tab: ActiveTab, options?: { summaryLength?: SummaryLength }) => Promise<void>;
    isGenerating: Partial<Record<ActiveTab, boolean>>;
    summary: string;
    strategy: string;
    quiz: QuizQuestion[];
    onReset: () => void;
    showInitialAnalyzeButton: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
    fileName,
    onAnalyze,
    isGenerating,
    summary,
    strategy,
    quiz,
    onReset,
    showInitialAnalyzeButton
}) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.SUMMARY);
    
    useEffect(() => {
        if (showInitialAnalyzeButton) {
            onAnalyze(ActiveTab.SUMMARY, { summaryLength: SummaryLength.MEDIUM });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showInitialAnalyzeButton]);

    const tabs = [
        { id: ActiveTab.SUMMARY, label: 'Summary' },
        { id: ActiveTab.STRATEGY, label: '4-Week Strategy' },
        { id: ActiveTab.QUIZ, label: 'Quiz' },
    ];

    const handleTabClick = (tabId: ActiveTab) => {
        setActiveTab(tabId);
        if ((tabId === ActiveTab.STRATEGY && !strategy) || (tabId === ActiveTab.QUIZ && quiz.length === 0)) {
            onAnalyze(tabId);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case ActiveTab.SUMMARY:
                return (
                    <SummaryView 
                        summary={summary}
                        isLoading={!!isGenerating.summary}
                        onGenerate={onAnalyze}
                    />
                );
            case ActiveTab.STRATEGY:
                return (
                     <ResultCard 
                        title={
                            <div className="flex items-center gap-2">
                                <StrategyIcon className="w-6 h-6 text-indigo-400" />
                                <span>4-Week Strategy Plan</span>
                            </div>
                        }
                        content={strategy}
                        isLoading={!!isGenerating.strategy}
                        placeholder="Generate a strategy to get started."
                        contentType="strategy"
                    />
                );
            case ActiveTab.QUIZ:
                return (
                    <QuizView 
                        questions={quiz}
                        isLoading={!!isGenerating.quiz}
                        onRegenerate={() => onAnalyze(ActiveTab.QUIZ)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full flex flex-col">
            <div className="bg-gray-800/50 p-4 rounded-t-lg flex justify-between items-center border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <DocumentIcon className="w-6 h-6 text-indigo-400" />
                    <span className="font-medium text-gray-300 truncate">{fileName}</span>
                </div>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors"
                    title="Analyze another file"
                >
                    <ResetIcon className="w-4 h-4" />
                    <span>New File</span>
                </button>
            </div>
            <div className="bg-gray-800 p-2 sm:p-4 rounded-b-lg">
                <div className="border-b border-gray-700 mb-4">
                    <nav className="flex -mb-px space-x-2 sm:space-x-4" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div>{renderContent()}</div>
            </div>
        </div>
    );
};

export default ResultDisplay;