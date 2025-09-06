import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuestionType } from '../types';
import Loader from './Loader';
import { ResetIcon } from './Icons';

interface QuizViewProps {
    questions: QuizQuestion[];
    isLoading: boolean;
    onRegenerate: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, isLoading, onRegenerate }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        // Reset state if questions change (e.g., regeneration)
        setSelectedAnswers({});
        setIsSubmitted(false);
        setScore(0);
    }, [questions]);

    const handleAnswerSelect = (questionIndex: number, answer: string) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmit = () => {
        let correctAnswers = 0;
        questions.forEach((q, index) => {
            if (selectedAnswers[index]?.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        setIsSubmitted(true);
    };

    const handleTryAgain = () => {
        setSelectedAnswers({});
        setIsSubmitted(false);
        setScore(0);
    };
    
    const allQuestionsAnswered = Object.keys(selectedAnswers).length === questions.length;

    if (isLoading) {
        return <Loader message="Generating quiz..." />;
    }

    if (questions.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 min-h-[300px]">
                Generate a quiz to test your knowledge.
            </div>
        );
    }
    
    return (
        <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
            <h3 className="text-xl font-bold text-gray-200 mb-2">Knowledge Check Quiz</h3>

            {isSubmitted && (
                <div className="mb-6 bg-gray-800 border border-indigo-500/50 p-4 rounded-lg text-center">
                    <p className="text-lg font-semibold text-white">Your Score: <span className="text-2xl text-indigo-400">{score} / {questions.length}</span></p>
                    <p className="text-sm text-gray-400 mt-1">
                        {score === questions.length ? "Excellent work!" : "Review the answers below and try again!"}
                    </p>
                </div>
            )}

            <div className="space-y-6">
                {questions.map((q, index) => {
                    const userAnswer = selectedAnswers[index];
                    const isCorrect = userAnswer?.trim().toLowerCase() === q.answer.trim().toLowerCase();

                    return (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <p className="font-semibold text-gray-200 mb-3">
                               {index + 1}. {q.question}
                            </p>
                            
                            <div className="space-y-2">
                            {(q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.TRUE_FALSE) && q.options?.map((option, i) => {
                                const isSelected = userAnswer === option;
                                const isCorrectAnswer = q.answer === option;

                                let optionClasses = "w-full text-left p-3 rounded-lg border-2 transition-colors cursor-pointer ";
                                if (isSubmitted) {
                                    optionClasses += "cursor-default ";
                                    if (isCorrectAnswer) {
                                        optionClasses += "bg-green-500/20 border-green-500 text-green-300";
                                    } else if (isSelected && !isCorrectAnswer) {
                                        optionClasses += "bg-red-500/20 border-red-500 text-red-300";
                                    } else {
                                        optionClasses += "border-gray-600 text-gray-400";
                                    }
                                } else {
                                    optionClasses += "text-gray-300 hover:border-indigo-500 hover:bg-indigo-500/10 ";
                                    optionClasses += isSelected ? "bg-indigo-600/30 border-indigo-500" : "border-gray-600";
                                }

                                return <button key={i} onClick={() => handleAnswerSelect(index, option)} className={optionClasses} disabled={isSubmitted}>{option}</button>
                            })}

                            {q.type === QuestionType.SHORT_ANSWER && (
                                <div>
                                    <input
                                        type="text"
                                        value={userAnswer || ''}
                                        onChange={(e) => handleAnswerSelect(index, e.target.value)}
                                        disabled={isSubmitted}
                                        placeholder="Your answer..."
                                        className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {isSubmitted && (
                                        <div className={`mt-2 p-3 rounded-md text-sm ${isCorrect ? 'bg-green-900/50 border border-green-700 text-green-300' : 'bg-red-900/50 border border-red-700 text-red-300'}`}>
                                            <strong>Correct Answer:</strong> {q.answer}
                                        </div>
                                    )}
                                </div>
                            )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!allQuestionsAnswered}
                        className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <button
                        onClick={handleTryAgain}
                        className="w-full sm:w-auto bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-500 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                )}
                 <button
                    onClick={onRegenerate}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-gray-600 text-gray-300 font-bold py-3 px-6 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                    title="Get a new set of questions"
                >
                    <ResetIcon className="w-4 h-4" />
                    <span>New Quiz</span>
                </button>
            </div>
        </div>
    );
};

export default QuizView;