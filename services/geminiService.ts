
import { GoogleGenAI, Type } from "@google/genai";
import { ExamConfig, Exam, UserAnswer, EvaluationReport, Question } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const examSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        duration: { type: Type.INTEGER },
        totalMarks: { type: Type.INTEGER },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER },
                    text: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['mcq', 'short', 'medium', 'long'] },
                    marks: { type: Type.INTEGER },
                    options: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                value: { type: Type.STRING },
                                label: { type: Type.STRING },
                            },
                        },
                        nullable: true,
                    },
                },
                required: ['id', 'text', 'type', 'marks'],
            },
        },
    },
    required: ['title', 'duration', 'totalMarks', 'questions'],
};

export const generateExam = async (config: ExamConfig): Promise<Exam> => {
    const prompt = `
        You are an expert exam creator for the Kerala State Board curriculum, but your questions should be universally understandable. Generate a complete exam paper based on the following specifications.

        Specifications:
        - Class: ${config.classLevel}
        - Subject: ${config.subject}
        - Exam Type: ${config.examType}
        - Total Marks: ${config.totalMarks}
        - Duration (in minutes): ${config.duration}
        - Language: English

        Instructions:
        1.  Create a balanced mix of question types: Multiple Choice (mcq), Short Answer (short), Medium Answer (medium), and Essay/Descriptive (long).
        2.  The difficulty and topics should align with the specified Class, Subject, and Exam Type. For 'Board Exam Preparation', mimic the official pattern. For 'Quick Revision', cover a wide range of topics.
        3.  The total marks of all questions combined should equal the specified Total Marks.
        4.  Distribute the marks appropriately across the different question types.
        5.  Ensure the number and complexity of questions are reasonable for the given duration.
        6.  For MCQs, provide 4 distinct options with one correct answer. The 'value' should be a simple identifier (e.g., 'a', 'b', 'c', 'd') and 'label' should be the option text.
        7.  Assign a unique integer 'id' to each question, starting from 1.
        8.  The questions array MUST be sorted in ascending order based on the 'marks' for each question (e.g., questions with 2 marks first, then 5 marks, then 10 marks).
        9.  Return the output as a single JSON object that strictly follows the provided schema. Do not include any introductory text, explanations, or markdown formatting outside the JSON structure.
    `;

    const response = await ai.models.generateContent({
        // FIX: Updated model name to 'gemini-flash-lite-latest' according to the API guidelines.
        model: 'gemini-flash-lite-latest',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: examSchema,
        },
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as Exam;
};


const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.INTEGER },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        detailedFeedback: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    questionId: { type: Type.INTEGER },
                    questionText: { type: Type.STRING },
                    studentAnswer: { type: Type.STRING },
                    assignedScore: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                },
                required: ['questionId', 'questionText', 'studentAnswer', 'assignedScore', 'feedback'],
            },
        },
    },
    required: ['overallScore', 'strengths', 'weaknesses', 'recommendations', 'detailedFeedback'],
};


export const evaluateExam = async (exam: Exam, answers: UserAnswer[]): Promise<EvaluationReport> => {
    const questionsAndAnswers = exam.questions.map(q => {
        const answer = answers.find(a => a.questionId === q.id);
        return {
            ...q,
            studentAnswer: answer ? answer.answer : 'Not answered',
        };
    });
    
    const prompt = `
        You are a highly experienced and fair examiner with deep expertise in the subject of ${exam.questions[0] ? 'the relevant subject' : 'various subjects'}. Your task is to evaluate a student's exam answers based on the provided questions. Provide a detailed, constructive, and encouraging evaluation.

        Evaluation Criteria:
        - Content Accuracy & Factual Correctness
        - Depth of Understanding of the topic
        - Clarity, Structure, and Coherence of the answer
        - Completeness in addressing all parts of the question
        - Relevance to the question asked

        Instructions:
        1.  Evaluate each question's answer based on the criteria above.
        2.  Assign a score for each answer ('assignedScore'), which must not exceed the maximum marks for that question.
        3.  Provide specific feedback for EACH question's answer in the 'feedback' field:
            - If the answer is INCORRECT or PARTIALLY CORRECT: Give a detailed, constructive explanation. Clearly state what was wrong, what key points were missed, and provide the correct information. Explain any misconceptions. This is the most critical part of the feedback.
            - If the answer is CORRECT: Provide a brief, encouraging confirmation like "Excellent work!" or "Correct, you've clearly understood the concept."
        4.  Calculate the total 'overallScore' by summing up all 'assignedScore' values.
        5.  Based on the entire performance, summarize the student's key 'strengths' and 'weaknesses' (3-4 points each).
        6.  Provide a list of 3-4 actionable 'recommendations' for improvement.
        7.  Return the entire evaluation as a single, valid JSON object that strictly follows the provided schema. Do not include any text, markdown, or explanations outside the JSON object.

        Here is the exam data (questions and student answers):
        ${JSON.stringify(questionsAndAnswers)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: evaluationSchema,
            thinkingConfig: {
                thinkingBudget: 32768,
            },
        },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as EvaluationReport;
};