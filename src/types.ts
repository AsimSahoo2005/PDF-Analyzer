export enum AppState {
    IDLE = 'IDLE',
    PARSING = 'PARSING',
    READY = 'READY',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

export enum ActiveTab {
    SUMMARY = 'summary',
    STRATEGY = 'strategy',
    QUIZ = 'quiz',
}

export enum SummaryLength {
    SHORT = 'short',
    MEDIUM = 'medium',
    DETAILED = 'detailed',
}

export enum QuestionType {
    MULTIPLE_CHOICE = 'Multiple Choice',
    TRUE_FALSE = 'True/False',
    SHORT_ANSWER = 'Short Answer',
}

export interface QuizQuestion {
    question: string;
    type: QuestionType;
    options?: string[];
    answer: string;
}