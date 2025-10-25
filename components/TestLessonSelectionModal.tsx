import React, { useState } from 'react';
import { Lesson } from '../types';

interface TestLessonSelectionModalProps {
  lessons: Lesson[];
  onStart: (selectedIds: number[]) => void;
  onClose: () => void;
}

const TestLessonSelectionModal: React.FC<TestLessonSelectionModalProps> = ({ lessons, onStart, onClose }) => {
  const [selectedLessonIds, setSelectedLessonIds] = useState<Record<number, boolean>>({});

  const handleToggle = (lessonId: number) => {
    setSelectedLessonIds(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const handleStart = () => {
    const ids = Object.keys(selectedLessonIds)
      .filter(id => selectedLessonIds[Number(id)])
      .map(Number);
    if (ids.length > 0) {
      onStart(ids);
    }
  };

  const selectedCount = Object.values(selectedLessonIds).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-center text-blue-600">Choose Lessons for Test</h2>
        
        <div className="space-y-2 max-h-64 overflow-y-auto border p-3 rounded-lg">
          {lessons.length > 0 ? lessons.map(lesson => (
            <div key={lesson.id} className="flex items-center">
              <input
                type="checkbox"
                id={`lesson-${lesson.id}`}
                checked={!!selectedLessonIds[lesson.id]}
                onChange={() => handleToggle(lesson.id)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`lesson-${lesson.id}`} className="ml-3 block text-md font-medium text-gray-700 truncate">
                {lesson.name} <span className="text-gray-500">({lesson.words.length})</span>
              </label>
            </div>
          )) : <p className="text-gray-500 italic text-center">No lessons found. Please import one first.</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
                onClick={onClose}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-md transition-transform transform hover:scale-105"
            >
                Cancel
            </button>
            <button
                onClick={handleStart}
                disabled={selectedCount === 0}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-400"
            >
                Start Test ({selectedCount})
            </button>
        </div>
      </div>
    </div>
  );
};

export default TestLessonSelectionModal;
