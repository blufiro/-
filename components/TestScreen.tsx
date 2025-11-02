import React, { useState, useEffect, useRef } from 'react';
import { Word, TestResult } from '../types';
import { wordService } from '../services/wordService';
import { geminiService } from '../services/geminiService';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface TestScreenProps {
  onTestComplete: (results: TestResult[], score: number) => void;
  onGoHome: () => void;
  lessonIds: string[];
}

// Helper to normalize pinyin input
const normalizePinyin = (pinyin: string): string => {
    return pinyin.toLowerCase().replace(/\s+/g, ' ').trim();
};

const TestScreen: React.FC<TestScreenProps> = ({ onTestComplete, onGoHome, lessonIds }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const testWords = wordService.getDailyTestWords(lessonIds);
    if (testWords.length === 0) {
        alert("No words available for the test in the selected lessons.");
        onGoHome();
    } else {
        setWords(testWords);
    }
  }, [lessonIds, onGoHome]);

  useEffect(() => {
    // Automatically focus the input when the word changes and we are not showing feedback
    if (!answerStatus) {
      inputRef.current?.focus();
    }
  }, [currentIndex, answerStatus]);
  
  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit? Your progress in this test will be lost.")) {
        onGoHome();
    }
  };
  
  // This effect handles the logic for moving to the next word after a delay.
  useEffect(() => {
    if (!answerStatus) {
      return;
    }

    // Set a timer to show the result feedback for 1.5 seconds.
    const timer = setTimeout(() => {
      // If there are more words, move to the next one.
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setInputValue('');
        setAnswerStatus(null); // Reset for the next word.
      } else {
        // Otherwise, the test is over.
        const score = results.filter(r => r.correct).length;
        onTestComplete(results, score);
      }
    }, 1500);

    // Clean up the timer if the component unmounts or dependencies change.
    return () => clearTimeout(timer);
  }, [answerStatus, currentIndex, words, results, onTestComplete]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answerStatus || !words[currentIndex]) return;

    const currentWord = words[currentIndex];
    const isCorrect = normalizePinyin(inputValue) === normalizePinyin(currentWord.pinyin);
    
    setResults(prev => [...prev, { word: currentWord, userInput: inputValue, correct: isCorrect }]);
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
  };
  
  const handleSpeak = async () => {
    if (isSpeaking || !words[currentIndex]) return;
    setIsSpeaking(true);
    await geminiService.speak(words[currentIndex].character);
    setIsSpeaking(false);
  };

  if (words.length === 0) {
    return <div className="text-center p-8">Loading your words...</div>;
  }

  const currentWord = words[currentIndex];

  return (
    <div className="flex flex-col items-center p-4 space-y-6 relative">
       <button 
          onClick={handleExit} 
          className="absolute top-0 right-0 p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          aria-label="Exit Test"
        >
          <XMarkIcon className="w-6 h-6"/>
        </button>
      <div className="w-full flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-500">
          Word {currentIndex + 1} / {words.length}
        </span>
        <button 
          onClick={handleSpeak} 
          disabled={isSpeaking}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <SpeakerIcon className="w-6 h-6"/>
        </button>
      </div>

      <div className="relative w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
        <p className="text-7xl font-bold tracking-widest">{currentWord.character}</p>
        {answerStatus && (
            <div className={`absolute inset-0 rounded-xl flex items-center justify-center text-white font-bold text-2xl transition-opacity duration-300 ${answerStatus === 'correct' ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
                {answerStatus === 'correct' ? 'Correct! 🎉' : 'Oops!'}
            </div>
        )}
      </div>
        {answerStatus === 'incorrect' && (
            <p className="text-center text-red-600 font-semibold text-lg">
                Correct answer: <span className="font-mono">{currentWord.pinyin}</span>
            </p>
        )}

      <form onSubmit={handleSubmit} className="w-full">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={!!answerStatus}
          placeholder="Type the pinyin here (e.g. ni3 hao3)"
          className="w-full text-center p-4 bg-gray-100 border-2 border-gray-300 rounded-lg text-xl focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors disabled:bg-gray-200"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <button
          type="submit"
          disabled={!!answerStatus || inputValue.trim() === ''}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-transform duration-200"
        >
          {answerStatus ? 'Checking...' : 'Check Answer'}
        </button>
      </form>
    </div>
  );
};

export default TestScreen;
