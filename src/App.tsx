import React, { useState, useCallback } from 'react';
import { AppState, ActiveTab, SummaryLength, QuizQuestion } from './types';
import { generateSummary, generateStrategy, generateQuiz } from './services/geminiService';
import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import ResultDisplay from './components/ResultDisplay';

// pdf.js is loaded from CDN, so we declare it as a global
declare const pdfjsLib: any;

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfText, setPdfText] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const [summary, setSummary] = useState<string>('');
    const [strategy, setStrategy] = useState<string>('');
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);

    const [isGenerating, setIsGenerating] = useState<Partial<Record<ActiveTab, boolean>>>({});
    
    const handleFileSelect = useCallback(async (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
             setError('File size exceeds 50MB. Please upload a smaller PDF.');
             return;
        }

        setPdfFile(file);
        setError(null);
        setAppState(AppState.PARSING);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target?.result) {
                    const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let textContent = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const text = await page.getTextContent();
                        textContent += text.items.map((s: any) => s.str).join(' ');
                    }
                    setPdfText(textContent);
                    setAppState(AppState.READY);
                }
            };
            reader.onerror = () => {
                setError('Failed to read the file.');
                setAppState(AppState.ERROR);
            }
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            setError('Failed to parse the PDF file.');
            setAppState(AppState.ERROR);
        }
    }, []);

    const handleAnalysis = useCallback(async (tab: ActiveTab, options?: { summaryLength?: SummaryLength }) => {
        if (!pdfText) {
            setError('No PDF content to analyze.');
            return;
        }

        setIsGenerating(prev => ({ ...prev, [tab]: true }));
        setError(null);

        try {
            if (tab === ActiveTab.SUMMARY) {
                const length = options?.summaryLength || SummaryLength.MEDIUM;
                const result = await generateSummary(pdfText, length);
                setSummary(result);
            } else if (tab === ActiveTab.STRATEGY) {
                const result = await generateStrategy(pdfText);
                setStrategy(result);
            } else if (tab === ActiveTab.QUIZ) {
                const result = await generateQuiz(pdfText);
                setQuiz(result);
            }
            if (appState !== AppState.SUCCESS) {
                setAppState(AppState.SUCCESS);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to generate ${tab}. Please try again.`);
            setAppState(AppState.ERROR);
        } finally {
            setIsGenerating(prev => ({ ...prev, [tab]: false }));
        }
    }, [pdfText, appState]);

    const resetState = () => {
        setAppState(AppState.IDLE);
        setPdfFile(null);
        setPdfText('');
        setError(null);
        setSummary('');
        setStrategy('');
        setQuiz([]);
        setIsGenerating({});
    };

    const renderContent = () => {
        switch (appState) {
            case AppState.IDLE:
            case AppState.ERROR:
                return <FileUpload onFileSelect={handleFileSelect} error={error} />;
            case AppState.PARSING:
                return <Loader message="Parsing PDF document..." />;
            case AppState.READY:
            case AppState.SUCCESS:
                return (
                    <ResultDisplay
                        fileName={pdfFile?.name || 'document'}
                        onAnalyze={handleAnalysis}
                        isGenerating={isGenerating}
                        summary={summary}
                        strategy={strategy}
                        quiz={quiz}
                        onReset={resetState}
                        showInitialAnalyzeButton={appState === AppState.READY}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
            <header className="w-full max-w-5xl text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                    PDF Analyzer & Learning Assistant
                </h1>
                <p className="text-lg text-gray-400 mt-2">
                    Upload a PDF to generate summaries, learning plans, and quizzes with AI.
                </p>
            </header>
            <main className="w-full max-w-5xl flex-grow">
                {renderContent()}
            </main>
            <footer className="w-full max-w-5xl text-center mt-8 text-gray-500 text-sm">
                <p>Powered by Gemini API</p>
            </footer>
        </div>
    );
};

export default App;