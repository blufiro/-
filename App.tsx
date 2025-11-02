import React, { useState, useCallback, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import TestScreen from './components/TestScreen';
import ResultsScreen from './components/ResultsScreen';
import ImportScreen from './components/ImportScreen';
import TestLessonSelectionModal from './components/TestLessonSelectionModal';
import ShopScreen from './components/ShopScreen';
import { TestResult, HistoricalScore, Word, Lesson, Background } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { wordService } from './services/wordService';
import { backgrounds, defaultBackground } from './data/backgrounds';

type View = 'home' | 'test' | 'results' | 'import' | 'shop';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [lastTestResults, setLastTestResults] = useState<TestResult[]>([]);
  const [score, setScore] = useState(0);
  const [screenTime, setScreenTime] = useLocalStorage<number>('screenTime', 0);
  const [historicalScores, setHistoricalScores] = useLocalStorage<HistoricalScore[]>('historicalScores', []);
  const [topMistakes, setTopMistakes] = useState<Word[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLessonSelectionOpen, setLessonSelectionOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
  const [selectedLessonIds, setSelectedLessonIds] = useState<number[]>([]);

  const [purchasedBackgroundIds, setPurchasedBackgroundIds] = useLocalStorage<string[]>('purchasedBackgrounds', [defaultBackground.id]);
  const [activeBackgroundId, setActiveBackgroundId] = useLocalStorage<string>('activeBackground', defaultBackground.id);
  const [allBackgrounds] = useState<Background[]>([defaultBackground, ...backgrounds]);
          
  const activeBackground = allBackgrounds.find(bg => bg.id === activeBackgroundId) || defaultBackground;


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

  // Secret debug key press to add points
  useEffect(() => {
    const pressedKeys = new Set<string>();

    const handleKeyDown = (event: KeyboardEvent) => {
      pressedKeys.add(event.key.toLowerCase());
      if (pressedKeys.has('q') && pressedKeys.has('p')) {
        setScreenTime(prevTime => prevTime + 50);
        pressedKeys.clear(); // Prevents continuous adding
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setScreenTime]);

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
    const correctAnswers = results.filter(r => r.correct).length;
    setLastTestResults(results);
    setScore(correctAnswers);
    wordService.saveTestResults(results);
    setScreenTime(prevTime => prevTime + correctAnswers);
    
    const namesOfLessons = lessons
        .filter(lesson => selectedLessonIds.includes(lesson.id))
        .map(lesson => lesson.name);

    const newScore: HistoricalScore = {
        date: new Date().toLocaleDateString(),
        score: correctAnswers,
        total: results.length,
        lessonNames: namesOfLessons,
    };
    setHistoricalScores(prevScores => [newScore, ...prevScores].slice(0, 10)); // Keep last 10 scores
    
    setView('results');
  }, [setScreenTime, setHistoricalScores, lessons, selectedLessonIds]);

  const goHome = () => {
    setLessonToEdit(null);
    setView('home');
  };

  const goToImport = () => {
    setLessonToEdit(null);
    setView('import');
  };

  const goToShop = () => {
    setView('shop');
  };

  const handlePurchaseBackground = (background: Background) => {
    if (screenTime >= background.cost && !purchasedBackgroundIds.includes(background.id)) {
        setScreenTime(prev => prev - background.cost);
        setPurchasedBackgroundIds(prev => [...prev, background.id]);
    } else {
        console.error("Cannot purchase background. Not enough points or already owned.");
    }
  };

  const handleApplyBackground = (backgroundId: string) => {
      if (purchasedBackgroundIds.includes(backgroundId)) {
          setActiveBackgroundId(backgroundId);
      }
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
                        screenTime={screenTime} 
                        historicalScores={historicalScores} 
                        topMistakes={topMistakes}
                        lessons={lessons}
                        onEditLesson={handleEditLesson}
                        onDeleteLesson={handleDeleteLesson}
                        onGoToShop={goToShop}
                    />;
        case 'test':
            return <TestScreen onTestComplete={finishTest} onGoHome={goHome} lessonIds={selectedLessonIds}/>;
        case 'results':
            return <ResultsScreen score={score} totalQuestions={lastTestResults.length} results={lastTestResults} onRetry={() => handleTestStart(selectedLessonIds)} onHome={goHome} />;
        case 'import':
            return <ImportScreen onGoHome={goHome} lessonToEdit={lessonToEdit} />;
        case 'shop':
            return <ShopScreen
                        onGoHome={goHome}
                        screenTime={screenTime}
                        backgrounds={allBackgrounds}
                        purchasedIds={purchasedBackgroundIds}
                        activeId={activeBackgroundId}
                        onPurchase={handlePurchaseBackground}
                        onApply={handleApplyBackground}
                    />;
        default:
            return <HomeScreen 
                        onStartTestRequest={handleStartTestRequest} 
                        onGoToImport={goToImport} 
                        screenTime={screenTime} 
                        historicalScores={historicalScores} 
                        topMistakes={topMistakes}
                        lessons={lessons}
                        onEditLesson={handleEditLesson}
                        onDeleteLesson={handleDeleteLesson}
                        onGoToShop={goToShop}
                   />;
    }
  }

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-4 transition-all duration-500" style={activeBackground.style}>
      <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 text-gray-800">
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
