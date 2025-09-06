import { GoogleGenAI, Type } from "@google/genai";
import { SummaryLength, QuizQuestion, QuestionType } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const MAX_TEXT_LENGTH = 50000; // A reasonable character limit to avoid overly large payloads

function truncateText(text: string): string {
    if (text.length > MAX_TEXT_LENGTH) {
        return text.substring(0, MAX_TEXT_LENGTH);
    }
    return text;
}

export const generateSummary = async (text: string, length: SummaryLength): Promise<string> => {
    const truncatedText = truncateText(text);
    const prompt = `Based on the following text from a document, please provide a ${length} summary. The summary should capture the key points, main arguments, and conclusions. Format the output using markdown (e.g., headings, subheadings, bullet points) for readability. Text: "${truncatedText}"`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    
    return response.text;
};

export const generateStrategy = async (text: string): Promise<string> => {
    const truncatedText = truncateText(text);
    const prompt = `Analyze the following text and generate a comprehensive 4-week learning or action strategy plan based on its content. Break it down week by week with clear, actionable steps and sub-points. The plan should be structured to help someone master the concepts or apply the information from the document. Format the output using markdown (e.g., using headings for each week and bullet points for actions). Text: "${truncatedText}"`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return response.text;
};

const quizSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: {
                type: Type.STRING,
                description: "The question text."
            },
            type: {
                type: Type.STRING,
                enum: [QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE, QuestionType.SHORT_ANSWER],
                description: "The type of the question."
            },
            options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of options. For Multiple Choice, provide 4 options. For True/False, provide ['True', 'False']. Null for Short Answer."
            },
            answer: {
                type: Type.STRING,
                description: "The correct answer to the question."
            }
        },
        required: ["question", "type", "answer"]
    }
};

export const generateQuiz = async (text: string): Promise<QuizQuestion[]> => {
    const truncatedText = truncateText(text);
    const prompt = `Generate a random quiz with exactly 5 questions based on the provided text. The quiz should include a mix of Multiple Choice, True/False, and Short Answer questions. For multiple-choice questions, provide 4 options. For True/False questions, the options array must contain only "True" and "False". For all questions, provide the correct answer. Text: "${truncatedText}"`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: quizSchema,
        }
    });
    
    try {
        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText);
        // Basic validation
        if (Array.isArray(quizData)) {
            return quizData as QuizQuestion[];
        }
        throw new Error("Generated content is not a valid quiz format.");
    } catch (e) {
        console.error("Failed to parse quiz JSON:", e);
        throw new Error("The AI returned an invalid format for the quiz. Please try again.");
    }
};