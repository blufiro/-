// FIX: Import React to make the React namespace available for CSSProperties.
import React from 'react';

export interface Word {
  id: number;
  character: string;
  pinyin: string; // e.g., "ni3 hao3"
}

export interface TestResult {
  word: Word;
  correct: boolean;
  userInput: string;
}

export interface Lesson {
  id: number;
  name: string;
  words: Word[];
}

export interface HistoricalScore {
    date: string;
    score: number;
    total: number;
}

export interface Background {
  id: string;
  name: string;
  cost: number;
  style: React.CSSProperties;
}


// Keep a simple enum for different views/screens in the app
export enum AppView {
    Home = 'home',
    Test = 'test',
    Results = 'results',
    Import = 'import',
}