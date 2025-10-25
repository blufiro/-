import React, { useState, useCallback, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import TestScreen from './components/TestScreen';
import ResultsScreen from './components/ResultsScreen';
import ImportScreen from './components/ImportScreen';
import TestLessonSelectionModal from './components/TestLessonSelectionModal';
import { TestResult, HistoricalScore, Word, Lesson } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { wordService } from './services/wordService';

type View = 'home' | 'test' | 'results' | 'import';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [lastTestResults, setLastTestResults] = useState<TestResult[]>([]);
  const [score, setScore] = useState(0);
  const [rewardPoints, setRewardPoints] = useLocalStorage<number>('rewardPoints', 0);
  const [historicalScores, setHistoricalScores] = useLocalStorage<HistoricalScore[]>('historicalScores', []);
  const [topMistakes, setTopMistakes] = useState<Word[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLessonSelectionOpen, setLessonSelectionOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
  const [selectedLessonIds, setSelectedLessonIds] = useState<number[]>([]);


  const refreshData = useCallback(() => {
    setTopMistakes(wordService.getTopMistakes(5));
    setLessons(wordService.getLessons());
  }, []);
  
  useEffect(() => {
    wordService.initializeWords();
    refreshData();
  }, [refreshData]);
  
  useEffect(() => {
    if (view === 'home') {
        refreshData();
    }
  }, [view, refreshData]);

  const handleStartTestRequest = () => {
    setLessonSelectionOpen(true);
  };
  
  const handleTestStart = (ids: number[]) => {
    if (ids.length === 0) return;
    setSelectedLessonIds(ids);
    setLessonSelectionOpen(false);
    setView('test');
  }

  const finishTest = useCallback((results: TestResult[], finalScore: number) => {
    setLastTestResults(results);
    setScore(finalScore);
    wordService.saveTestResults(results);
    setRewardPoints(prevPoints => prevPoints + 10);
    
    const newScore: HistoricalScore = {
        date: new Date().toLocaleDateString(),
        score: finalScore,
        total: results.length,
    };
    setHistoricalScores(prevScores => [newScore, ...prevScores].slice(0, 10)); // Keep last 10 scores
    
    setView('results');
  }, [setRewardPoints, setHistoricalScores]);

  const goHome = () => {
    setLessonToEdit(null);
    setView('home');
  };

  const goToImport = () => {
    setLessonToEdit(null);
    setView('import');
  };

  const handleEditLesson = (lesson: Lesson) => {
    setLessonToEdit(lesson);
    setView('import');
  };

  const handleDeleteLesson = (lessonId: number) => {
    if (window.confirm("Are you sure you want to delete this lesson? This cannot be undone.")) {
      wordService.deleteLesson(lessonId);
      refreshData();
    }
  };

  const renderContent = () => {
    switch(view) {
        case 'home':
            return <HomeScreen 
                        onStartTestRequest={handleStartTestRequest} 
                        onGoToImport={goToImport} 
                        rewardPoints={rewardPoints} 
                        historicalScores={historicalScores} 
                        topMistakes={topMistakes}
                        lessons={lessons}
                        onEditLesson={handleEditLesson}
                        onDeleteLesson={handleDeleteLesson}
                    />;
        case 'test':
            return <TestScreen onTestComplete={finishTest} onGoHome={goHome} lessonIds={selectedLessonIds}/>;
        case 'results':
            return <ResultsScreen score={score} totalQuestions={lastTestResults.length} results={lastTestResults} onRetry={() => handleTestStart(selectedLessonIds)} onHome={goHome} />;
        case 'import':
            return <ImportScreen onGoHome={goHome} lessonToEdit={lessonToEdit} />;
        default:
            return <HomeScreen 
                        onStartTestRequest={handleStartTestRequest} 
                        onGoToImport={goToImport} 
                        rewardPoints={rewardPoints} 
                        historicalScores={historicalScores} 
                        topMistakes={topMistakes}
                        lessons={lessons}
                        onEditLesson={handleEditLesson}
                        onDeleteLesson={handleDeleteLesson}
                   />;
    }
  }

  return (
    <div className="bg-blue-50 min-h-screen font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 text-gray-800">
        {renderContent()}
        {isLessonSelectionOpen && (
            <TestLessonSelectionModal 
                lessons={lessons}
                onStart={handleTestStart}
                onClose={() => setLessonSelectionOpen(false)}
            />
        )}
      </div>
    </div>
  );
};

export default App;
