
import { Exam, UserAnswer } from '../types';

const EXAM_STATE_KEY = 'aiExamProState';

export interface SavedExamState {
  exam: Exam;
  userAnswers: UserAnswer[];
  timeLeft: number;
}

export const saveExamState = (state: SavedExamState): void => {
  try {
    const stateString = JSON.stringify(state);
    localStorage.setItem(EXAM_STATE_KEY, stateString);
  } catch (error) {
    console.error("Failed to save exam state to localStorage", error);
  }
};

export const loadExamState = (): SavedExamState | null => {
  try {
    const stateString = localStorage.getItem(EXAM_STATE_KEY);
    if (stateString === null) {
      return null;
    }
    return JSON.parse(stateString) as SavedExamState;
  } catch (error) {
    console.error("Failed to load exam state from localStorage", error);
    return null;
  }
};

export const clearExamState = (): void => {
  try {
    localStorage.removeItem(EXAM_STATE_KEY);
  } catch (error) {
    console.error("Failed to clear exam state from localStorage", error);
  }
};
