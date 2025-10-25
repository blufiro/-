import { Word, TestResult, Lesson } from '../types';

const INITIAL_WORDS: Omit<Word, 'id'>[] = [
    { character: '你好', pinyin: 'ni3 hao3' },
    { character: '谢谢', pinyin: 'xie4 xie' },
    { character: '不客气', pinyin: 'bu2 ke4 qi' },
    { character: '再见', pinyin: 'zai4 jian4' },
    { character: '老师', pinyin: 'lao3 shi1' },
    { character: '学生', pinyin: 'xue2 sheng' },
    { character: '是', pinyin: 'shi4' },
    { character: '不是', pinyin: 'bu2 shi4' },
    { character: '我', pinyin: 'wo3' },
    { character: '你', pinyin: 'ni3' },
    { character: '他', pinyin: 'ta1' },
    { character: '她', pinyin: 'ta1' },
    { character: '我们', pinyin: 'wo3 men' },
    { character: '你们', pinyin: 'ni3 men' },
    { character: '他们', pinyin: 'ta1 men' },
    { character: '早上好', pinyin: 'zao3 shang hao' },
    { character: '晚上好', pinyin: 'wan3 shang hao' },
    { character: '对不起', pinyin: 'dui4 bu qi3' },
    { character: '没关系', pinyin: 'mei2 guan1 xi' },
    { character: '什么', pinyin: 'shen2 me' },
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
        const allLessons = getFromStorage<Lesson[]>(LESSONS_KEY, []);
        const selectedLessons = allLessons.filter(lesson => lessonIds.includes(lesson.id));
        const wordPool = getAllWordsFromLessons(selectedLessons);

        if (wordPool.length === 0) return [];

        const mistakes = getFromStorage<Record<number, number>>(MISTAKES_KEY, {});
        const seenWordIds = getFromStorage<number[]>(SEEN_WORDS_KEY, []);
        
        const sortedMistakeIds = Object.keys(mistakes)
            .map(id => parseInt(id))
            .sort((a, b) => mistakes[b] - mistakes[a]);

        const mistakesToRevise = wordPool
            .filter(word => sortedMistakeIds.includes(word.id))
            .sort((a, b) => sortedMistakeIds.indexOf(a.id) - sortedMistakeIds.indexOf(b.id))
            .slice(0, 5);
        
        const newWords = wordPool.filter(word => !seenWordIds.includes(word.id));
        const shuffledNewWords = shuffleArray(newWords).slice(0, 5);

        const combinedList = [...mistakesToRevise, ...shuffledNewWords];
        
        if (combinedList.length === 0) {
            return shuffleArray(wordPool).slice(0, 10);
        }

        return shuffleArray(combinedList);
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
    }
};
