import { Background } from '../types';

export const defaultBackground: Background = {
  id: 'default',
  name: 'Default',
  cost: 0,
  style: { background: '#f0f9ff' /* bg-blue-50 */ }
};

export const backgrounds: Background[] = [
  {
    id: 'grid',
    name: 'Blueprint Grid',
    cost: 50,
    style: {
      backgroundColor: '#e0f2fe', // light blue
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }
  },
  {
    id: 'cool',
    name: 'Icy Cool',
    cost: 50,
    style: {
      background: 'linear-gradient(to top, #a1c4fd 0%, #c2e9fb 100%)',
    }
  },
  {
    id: 'hot',
    name: 'Fiery Hot',
    cost: 50,
    style: {
      background: 'linear-gradient(to right, #ff8177 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)',
    }
  },
  {
    id: 'forest',
    name: 'Dark Forest',
    cost: 50,
    style: {
      background: 'linear-gradient(to top, #0f2027, #203a43, #2c5364)',
    }
  },
];
