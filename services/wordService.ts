import { Word, TestResult, Lesson } from '../types';

const INITIAL_WORDS: Omit<Word, 'id'>[] = [
    { character: '你好', pinyin: 'ni3 hao3' },
    { character: '谢谢', pinyin: 'xie4 xie' },
    { character: '不客气', pinyin: 'bu2 ke4 qi' },
    { character: '再见', pinyin: 'zai4 jian4' },
    { character: '老师', pinyin: 'lao3 shi1' },
    { character: '学生', pinyin: 'xue2 sheng' },
];

const LESSONS_KEY = 'lessons';
const MISTAKES_KEY = 'mistakes'; // Stored as Record<number, number> { wordId: count }
const SEEN_WORDS_KEY = 'seenWords';
const LAST_WORD_ID_KEY = 'lastWordId';


const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error(`Error reading from localStorage key "${key}":`, e);
        return defaultValue;
    }
};

const saveToStorage = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e)
        {
        console.error(`Error saving to localStorage key "${key}":`, e);
    }
};

const getAllWordsFromLessons = (lessons: Lesson[]): Word[] => {
    return lessons.flatMap(lesson => lesson.words);
};


export const wordService = {
    initializeWords: () => {
        const lessons = getFromStorage<Lesson[]>(LESSONS_KEY, []);
        if (lessons.length === 0) {
            let lastId = 0;
            const initialWordsWithIds = INITIAL_WORDS.map((word, index) => {
                lastId = index + 1;
                return { ...word, id: lastId };
            });
            const defaultLesson: Lesson = {
                id: 1,
                name: "Default Lesson",
                words: initialWordsWithIds
            };
            saveToStorage(LESSONS_KEY, [defaultLesson]);
            saveToStorage(LAST_WORD_ID_KEY, lastId);
        }
    },
    
    getLessons: (): Lesson[] => {
        return getFromStorage<Lesson[]>(LESSONS_KEY, []);
    },

    deleteLesson: (lessonId: number): void => {
        let lessons = getFromStorage<Lesson[]>(LESSONS_KEY, []);
        lessons = lessons.filter(lesson => lesson.id !== lessonId);
        saveToStorage(LESSONS_KEY, lessons);
    },

    getDailyTestWords: (lessonIds: number[]): Word[] => {
        const TEST_SIZE = 5;
        const MISTAKE_COUNT = 2; // Prioritize up to 2 mistakes

        const allLessons = getFromStorage<Lesson[]>(LESSONS_KEY, []);
        const selectedLessons = allLessons.filter(lesson => lessonIds.includes(lesson.id));
        const wordPool = getAllWordsFromLessons(selectedLessons);

        if (wordPool.length === 0) return [];
        
        const testSize = Math.min(TEST_SIZE, wordPool.length);

        const mistakes = getFromStorage<Record<number, number>>(MISTAKES_KEY, {});
        
        // Get all words from the pool that are marked as mistakes
        const mistakeWords = wordPool.filter(word => mistakes[word.id] > 0);
        const shuffledMistakes = shuffleArray(mistakeWords);

        // Select some mistakes to revise, up to MISTAKE_COUNT
        const revisionMistakes = shuffledMistakes.slice(0, MISTAKE_COUNT);
        const revisionMistakeIds = new Set(revisionMistakes.map(w => w.id));

        // Get other words from the pool that are not in our revision list
        const otherWords = wordPool.filter(word => !revisionMistakeIds.has(word.id));
        const shuffledOtherWords = shuffleArray(otherWords);

        // Fill the rest of the test with other words
        const remainingCount = testSize - revisionMistakes.length;
        const randomWords = shuffledOtherWords.slice(0, remainingCount);
        
        // Combine and shuffle for the final test list
        const testWords = [...revisionMistakes, ...randomWords];
        return shuffleArray(testWords);
    },
    
    saveTestResults: (results: TestResult[]) => {
        let mistakes = getFromStorage<Record<number, number>>(MISTAKES_KEY, {});
        let seenWordIds = getFromStorage<number[]>(SEEN_WORDS_KEY, []);
        
        results.forEach(result => {
            const wordId = result.word.id;
            
            if (!seenWordIds.includes(wordId)) {
                seenWordIds.push(wordId);
            }
            
            if (result.correct) {
                if (mistakes[wordId]) {
                    mistakes[wordId]--;
                    if (mistakes[wordId] <= 0) {
                        delete mistakes[wordId];
                    }
                }
            } else {
                mistakes[wordId] = (mistakes[wordId] || 0) + 1;
            }
        });
        
        saveToStorage(MISTAKES_KEY, mistakes);
        saveToStorage(SEEN_WORDS_KEY, seenWordIds);
    },

    getTopMistakes: (count: number): Word[] => {
        const allWords = getAllWordsFromLessons(getFromStorage<Lesson[]>(LESSONS_KEY, []));
        const mistakes = getFromStorage<Record<number, number>>(MISTAKES_KEY, {});
        
        const sortedMistakeIds = Object.keys(mistakes)
            .map(id => parseInt(id))
            .sort((a, b) => mistakes[b] - mistakes[a]);
        
        return allWords
            .filter(word => sortedMistakeIds.includes(word.id))
            .sort((a, b) => sortedMistakeIds.indexOf(a.id) - sortedMistakeIds.indexOf(b.id))
            .slice(0, count);
    },

    saveLesson: (lessonName: string, wordsText: string, lessonIdToUpdate?: number): { success: boolean, message: string } => {
        if (!lessonName.trim()) {
            return { success: false, message: "Lesson name cannot be empty." };
        }
        
        const lines = wordsText.trim().split('\n');
        const newWords: Omit<Word, 'id'>[] = [];

        for (const line of lines) {
            if (!line.trim()) continue;
            const parts = line.split(/[,，]/);
            if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
                return { success: false, message: `Invalid format on line: "${line}". Please use "character,pinyin".` };
            }
            newWords.push({ character: parts[0].trim(), pinyin: parts[1].trim() });
        }

        if (newWords.length === 0) {
            return { success: false, message: "No valid words found to import." };
        }

        let lessons = getFromStorage<Lesson[]>(LESSONS_KEY, []);
        let lastId = getFromStorage<number>(LAST_WORD_ID_KEY, 0);

        if (lessonIdToUpdate) { // Updating existing lesson
            const lessonIndex = lessons.findIndex(l => l.id === lessonIdToUpdate);
            if (lessonIndex === -1) {
                return { success: false, message: "Lesson not found for updating." };
            }
            // Keep existing word IDs if possible, create new ones for new words
            const existingWords = lessons[lessonIndex].words;
            const wordsWithIds = newWords.map((word, index) => {
                const existing = existingWords.find(ew => ew.character === word.character && ew.pinyin === word.pinyin);
                if (existing) return existing;
                lastId++;
                return { ...word, id: lastId };
            });

            lessons[lessonIndex].name = lessonName.trim();
            lessons[lessonIndex].words = wordsWithIds;
            saveToStorage(LESSONS_KEY, lessons);
            saveToStorage(LAST_WORD_ID_KEY, lastId);
            return { success: true, message: `Successfully updated lesson "${lessonName}".` };
        } else { // Creating new lesson
            const wordsWithIds = newWords.map(word => {
                lastId++;
                return { ...word, id: lastId };
            });

            const newLesson: Lesson = {
                id: Date.now(), // Simple unique ID
                name: lessonName.trim(),
                words: wordsWithIds,
            };

            lessons.push(newLesson);
            saveToStorage(LESSONS_KEY, lessons);
            saveToStorage(LAST_WORD_ID_KEY, lastId);
            return { success: true, message: `Successfully imported ${newWords.length} words into "${newLesson.name}".` };
        }
    },

    importLessons: (importedLessons: unknown): { success: boolean, message: string } => {
        if (!Array.isArray(importedLessons)) {
            return { success: false, message: "Import failed: File content is not a valid lesson array." };
        }

        let lessons = getFromStorage<Lesson[]>(LESSONS_KEY, []);
        let lastWordId = getFromStorage<number>(LAST_WORD_ID_KEY, 0);
        let lessonsAdded = 0;

        for (const importedLesson of importedLessons) {
            // Basic validation for each lesson object
            if (typeof importedLesson !== 'object' || importedLesson === null || !importedLesson.name || !Array.isArray(importedLesson.words)) {
                console.warn("Skipping invalid lesson object during import:", importedLesson);
                continue;
            }

            // Avoid duplicates by name
            if (lessons.some(l => l.name === importedLesson.name)) {
                console.warn(`Skipping lesson with duplicate name: "${importedLesson.name}"`);
                continue;
            }

            const wordsWithNewIds = importedLesson.words.map((word: any) => {
                lastWordId++;
                return {
                    id: lastWordId,
                    character: word.character || '',
                    pinyin: word.pinyin || ''
                };
            });

            const newLesson: Lesson = {
                id: Date.now() + lessonsAdded, // Simple unique ID
                name: importedLesson.name,
                words: wordsWithNewIds
            };

            lessons.push(newLesson);
            lessonsAdded++;
        }

        if (lessonsAdded === 0) {
            return { success: false, message: "No new lessons were imported. They might be duplicates or invalid." };
        }

        saveToStorage(LESSONS_KEY, lessons);
        saveToStorage(LAST_WORD_ID_KEY, lastWordId);
        return { success: true, message: `Successfully imported ${lessonsAdded} new lesson(s).` };
    }
};