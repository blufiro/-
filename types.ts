// FIX: Import React to make the React namespace available for CSSProperties.
import React from 'react';

export interface Word {
  id: string;
  character: string;
  pinyin: string; // e.g., "ni3 hao3"
}

export interface TestResult {
  word: Word;
  correct: boolean;
  userInput: string;
}

export interface Lesson {
  id: string;
  name: string;
  words: Word[];
  isPredefined?: boolean;
  level?: 'p1' | 'p2' | 'p3' | 'p4';
}

export interface HistoricalScore {
    date: string;
    score: number;
    total: number;
    lessonNames: string[];
}

export interface Background {
  id: string;
  name: string;
  cost: number;
  style: React.CSSProperties;
}

export type EvaluationState = 'expert' | 'competent' | 'learning' | 'beginner' | 'not_started';

// Keep a simple enum for different views/screens in the app
export enum AppView {
    Home = 'home',
    Test = 'test',
    Results = 'results',
    Import = 'import',
}