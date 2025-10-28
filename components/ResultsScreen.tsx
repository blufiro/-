
import React from 'react';
import { TestResult } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { RestartIcon } from './icons/RestartIcon';

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  results: TestResult[];
  onRetry: () => void;
  onHome: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, totalQuestions, results, onRetry, onHome }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const getFeedback = () => {
    if (percentage === 100) return "Perfect! You're a Pinyin master! ✨";
    if (percentage >= 80) return "Great job! Keep up the excellent work! 👍";
    if (percentage >= 60) return "Good effort! Practice makes perfect. 💪";
    return "Don't worry, let's try again! You can do it! 😊";
  };

  return (
    <div className="text-center flex flex-col items-center justify-center p-4 space-y-6">
      <h2 className="text-3xl font-bold text-blue-600">Test Complete!</h2>
      
      <div className="bg-yellow-100 text-yellow-800 font-bold py-2 px-4 rounded-full">
        You earned {score} {score === 1 ? 'point' : 'points'} of screen time! ⭐
      </div>

      <div className="w-48 h-48 bg-blue-100 rounded-full flex flex-col items-center justify-center border-8 border-blue-200">
        <span className="text-5xl font-bold text-blue-700">{score}/{totalQuestions}</span>
        <span className="text-xl text-blue-500">{percentage}%</span>
      </div>
      
      <p className="text-xl font-semibold text-gray-700">{getFeedback()}</p>

      {results.some(r => !r.correct) && (
        <div className="w-full max-w-md bg-gray-50 p-4 rounded-lg shadow-inner">
          <h3 className="text-lg font-bold mb-3 text-left">Let's review your mistakes:</h3>
          <ul className="space-y-2 text-left">
            {results.filter(r => !r.correct).map(({ word, userInput }) => (
              <li key={word.id} className="flex flex-col md:flex-row md:items-center justify-between p-2 bg-white rounded-md border">
                <span className="text-2xl font-semibold">{word.character}</span>
                <div className="flex flex-col items-start md:items-end">
                    <span className="text-red-500 font-mono line-through">{userInput || 'no answer'}</span>
                    <span className="text-green-600 font-mono">{word.pinyin}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs pt-4">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-md transition-transform transform hover:scale-105"
        >
          <RestartIcon className="w-6 h-6" />
          <span>Try Again</span>
        </button>
        <button
          onClick={onHome}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-md transition-transform transform hover:scale-105"
        >
          <HomeIcon className="w-6 h-6" />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;