import React from 'react';
import { CoinIcon } from './icons/CoinIcon';
import { ImportIcon } from './icons/ImportIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShopIcon } from './icons/ShopIcon';
import { HistoricalScore, Word, Lesson } from '../types';
import { wordService } from '../services/wordService';

interface HomeScreenProps {
  onStartTestRequest: () => void;
  onGoToImport: () => void;
  onGoToShop: () => void;
  screenTime: number;
  historicalScores: HistoricalScore[];
  topMistakes: Word[];
  lessons: Lesson[];
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: number) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartTestRequest, onGoToImport, onGoToShop, screenTime, historicalScores, topMistakes, lessons, onEditLesson, onDeleteLesson }) => {
  
  const handleExport = () => {
    const allLessons = wordService.getLessons();
    if (allLessons.length === 0) {
      alert("There are no lessons to export.");
      return;
    }
    const jsonString = JSON.stringify(allLessons, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `pinyin-lessons-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="relative text-center flex flex-col items-center justify-center h-full space-y-6">
      <span className="absolute top-0 right-0 text-xs text-gray-400 p-2">v0.2</span>
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600">拼音天天练</h1>
        <p className="text-lg text-gray-600">Pinyin Daily Practice</p>
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-full pl-6 pr-4 py-3 flex items-center space-x-3 shadow-md">
          <CoinIcon className="w-8 h-8 text-yellow-500" />
          <span className="text-2xl font-bold text-yellow-700">{screenTime}</span>
          <span className="text-lg text-yellow-600">Points</span>
        </div>
        <button
          onClick={onGoToShop}
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform duration-200"
          aria-label="Open Shop"
        >
          <ShopIcon className="w-8 h-8"/>
        </button>
      </div>
      
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onGoToImport}
          className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-full text-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          <ImportIcon className="w-6 h-6" />
          Import New Lesson
        </button>
        <button
          onClick={onStartTestRequest}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-full text-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          Start Daily Test
        </button>
      </div>

      {/* My Lessons Section */}
      <div className="w-full bg-gray-50 p-4 rounded-lg shadow-inner">
        <h3 className="text-xl font-bold mb-3 text-gray-700">My Lessons</h3>
        {lessons.length > 0 ? (
          <>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {lessons.map(lesson => (
                <div key={lesson.id} className="flex justify-between items-center p-2 bg-white rounded-lg border">
                  <span className="font-semibold text-gray-800 truncate" title={lesson.name}>{lesson.name} ({lesson.words.length} words)</span>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => onEditLesson(lesson)} className="p-2 text-blue-500 hover:text-blue-700" aria-label={`Edit ${lesson.name}`}>
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDeleteLesson(lesson.id)} className="p-2 text-red-500 hover:text-red-700" aria-label={`Delete ${lesson.name}`}>
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
             <div className="text-center mt-3">
              <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline mx-auto"
              >
                <DownloadIcon className="w-4 h-4" />
                Export All Lessons to File
              </button>
            </div>
          </>
        ) : (
           <p className="text-gray-500 italic">You have no custom lessons. Import one to get started!</p>
        )}
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Top Mistakes */}
        <div className="bg-red-50 p-4 rounded-lg shadow-inner">
          <h3 className="text-lg font-bold mb-2 text-red-700">Top Mistakes</h3>
          {topMistakes.length > 0 ? (
            <ul className="space-y-1 text-left max-h-40 overflow-y-auto pr-2">
              {topMistakes.map(word => (
                <li key={word.id} className="flex justify-between items-center p-1 bg-white rounded">
                  <span className="text-xl font-semibold">{word.character}</span>
                  <span className="font-mono text-gray-600">{word.pinyin}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No mistakes recorded yet. Great job!</p>
          )}
        </div>

        {/* Recent Scores */}
        <div className="bg-blue-50 p-4 rounded-lg shadow-inner">
          <h3 className="text-lg font-bold mb-2 text-blue-700">Recent Scores</h3>
          {historicalScores.length > 0 ? (
            <ul className="space-y-1 text-left max-h-40 overflow-y-auto pr-2">
              {historicalScores.map((s, i) => (
                <li key={i} className="flex justify-between items-center p-1 bg-white rounded">
                  <span className="text-sm text-gray-500">{s.date}</span>
                  <span className="font-bold text-blue-600">{s.score} / {s.total}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No tests taken yet. Let's start!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;