import React, { useState, useEffect, useRef } from 'react';
import { wordService } from '../services/wordService';
import { Lesson } from '../types';

interface ImportScreenProps {
    onGoHome: () => void;
    lessonToEdit: Lesson | null;
}

const ImportScreen: React.FC<ImportScreenProps> = ({ onGoHome, lessonToEdit }) => {
    const [lessonName, setLessonName] = useState('');
    const [wordsText, setWordsText] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [importAnalysis, setImportAnalysis] = useState<{ newLessons: Lesson[], duplicates: Lesson[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (lessonToEdit) {
            setLessonName(lessonToEdit.name);
            const wordsString = lessonToEdit.words.map(w => `${w.character},${w.pinyin}`).join('\n');
            setWordsText(wordsString);
        }
    }, [lessonToEdit]);

    const handleSave = () => {
        setMessage(null);
        const result = wordService.saveLesson(lessonName, wordsText, lessonToEdit?.id);
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            setLessonName('');
            setWordsText('');
            setTimeout(() => onGoHome(), 1500); // Go home after a short delay
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleFileImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImportAnalysis(null);
        setMessage(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Could not read file content.");
                }
                const data = JSON.parse(text);
                const analysisResult = wordService.analyzeImportData(data);
                
                if (!analysisResult.success) {
                    setMessage({ type: 'error', text: analysisResult.message });
                    return;
                }
                
                if (analysisResult.duplicates.length > 0) {
                    setImportAnalysis({ newLessons: analysisResult.newLessons, duplicates: analysisResult.duplicates });
                } else {
                    // No duplicates, just import the new ones
                    const saveResult = wordService.saveImportedLessons({ newLessonsToSave: analysisResult.newLessons, lessonsToOverwrite: [] });
                    if (saveResult.success) {
                        setMessage({ type: 'success', text: saveResult.message });
                        setTimeout(() => onGoHome(), 1500);
                    } else {
                        setMessage({ type: 'error', text: saveResult.message });
                    }
                }
            } catch (error) {
                setMessage({ type: 'error', text: `Import failed: Invalid JSON file. ${error instanceof Error ? error.message : ''}` });
            } finally {
                if (event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.onerror = () => {
            setMessage({ type: 'error', text: 'Failed to read the file.' });
        };
        reader.readAsText(file);
    };

    const handleConfirmOverwrite = () => {
        if (!importAnalysis) return;

        const result = wordService.saveImportedLessons({
            newLessonsToSave: importAnalysis.newLessons,
            lessonsToOverwrite: importAnalysis.duplicates
        });

        setImportAnalysis(null);

        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            setTimeout(() => onGoHome(), 1500);
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleCancelOverwrite = () => {
        setImportAnalysis(null);
        setMessage({ type: 'error', text: 'Import cancelled.' });
    };

    const renderOverwriteConfirmation = () => {
        if (!importAnalysis) return null;
        
        const { newLessons, duplicates } = importAnalysis;

        return (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-center space-y-4 animate-fade-in">
                <h3 className="text-xl font-bold text-yellow-800">Duplicate Lessons Found!</h3>
                <p className="text-yellow-700">
                    The following {duplicates.length} lesson(s) already exist. Do you want to overwrite them with the content from the file?
                </p>
                <ul className="text-left bg-white p-2 rounded max-h-32 overflow-y-auto border">
                    {duplicates.map(d => <li key={d.name} className="font-semibold truncate p-1"> - {d.name}</li>)}
                </ul>
                {newLessons.length > 0 && (
                    <p className="text-yellow-700">
                        Additionally, {newLessons.length} new lesson(s) will be imported.
                    </p>
                )}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button onClick={handleCancelOverwrite} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full">
                        Cancel Import
                    </button>
                    <button onClick={handleConfirmOverwrite} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full">
                        Yes, Overwrite
                    </button>
                </div>
            </div>
        );
    };
    
    return (
        <div className="flex flex-col p-4 space-y-6">
            <h2 className="text-3xl font-bold text-blue-600 text-center">{lessonToEdit ? 'Edit Lesson' : 'Import New Lesson'}</h2>
            
            {importAnalysis ? renderOverwriteConfirmation() : (
                 <>
                    {!lessonToEdit && (
                        <div className="border-b pb-4 text-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelected}
                                accept=".json"
                                className="hidden"
                            />
                            <button
                                onClick={handleFileImportClick}
                                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-lg shadow-md transition-transform transform hover:scale-105"
                            >
                                Import from Backup File
                            </button>
                            <p className="text-sm text-gray-500 mt-2">or enter manually below</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="lessonName" className="block text-sm font-medium text-gray-700">Lesson Name</label>
                            <input
                                type="text"
                                id="lessonName"
                                value={lessonName}
                                onChange={(e) => setLessonName(e.target.value)}
                                placeholder="e.g., Chapter 1"
                                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="wordsText" className="block text-sm font-medium text-gray-700">Words</label>
                            <textarea
                                id="wordsText"
                                value={wordsText}
                                onChange={(e) => setWordsText(e.target.value)}
                                rows={10}
                                placeholder="Enter words, one per line, in the format:&#10;你好,ni3 hao3&#10;谢谢,xie4 xie"
                                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm font-mono transition-colors"
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck="false"
                            />
                        </div>
                    </div>
                </>
            )}

            {message && (
                <div className={`p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            
            {!importAnalysis && (
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onGoHome}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-md transition-transform transform hover:scale-105"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-400"
                        disabled={!lessonName.trim() || !wordsText.trim()}
                    >
                        {lessonToEdit ? 'Update Lesson' : 'Save Lesson'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImportScreen;