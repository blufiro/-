import React from 'react';
import { Background } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { StarIcon } from './icons/StarIcon';


interface ShopScreenProps {
    onGoHome: () => void;
    screenTime: number;
    backgrounds: Background[];
    purchasedIds: string[];
    activeId: string;
    onPurchase: (background: Background) => void;
    onApply: (backgroundId: string) => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ onGoHome, screenTime, backgrounds, purchasedIds, activeId, onPurchase, onApply }) => {
    return (
        <div className="flex flex-col p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-blue-600">Background Shop</h2>
                <div className="bg-yellow-100 border-2 border-yellow-300 rounded-full px-4 py-2 flex items-center space-x-2 shadow-md">
                    <StarIcon className="w-6 h-6 text-yellow-500" />
                    <span className="text-xl font-bold text-yellow-700">{screenTime}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[26rem] overflow-y-auto pr-2 pb-2">
                {backgrounds.filter(bg => bg.id !== 'default').map(bg => {
                    const isPurchased = purchasedIds.includes(bg.id);
                    const isActive = activeId === bg.id;
                    const canAfford = screenTime >= bg.cost;

                    return (
                        <div key={bg.id} className="border rounded-lg p-3 flex flex-col items-center space-y-3 bg-white/70 shadow">
                            <div className="w-full h-24 rounded-md border" style={bg.style}></div>
                            <h3 className="font-bold text-center">{bg.name}</h3>
                            {isPurchased ? (
                                <button
                                    onClick={() => onApply(bg.id)}
                                    disabled={isActive}
                                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isActive ? (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5"/> Applied
                                        </>
                                    ) : 'Apply'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => onPurchase(bg)}
                                    disabled={!canAfford}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    <StarIcon className="w-5 h-5"/>
                                    <span>{bg.cost}</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <button
                onClick={onGoHome}
                className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-md transition-transform transform hover:scale-105"
            >
                <HomeIcon className="w-6 h-6" />
                <span>Back to Home</span>
            </button>
        </div>
    );
};

export default ShopScreen;
