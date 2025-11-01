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
      backgroundColor: '#3f3f46', // A mid-dark grey (zinc-700)
      // A more muted grey background with a subtle, deep red glow and slightly more visible cracks.
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3e%3cpath d='M 20 5 L 25 15 L 15 25 L 20 35 L 30 45' stroke='rgba(239, 68, 68, 0.2)' stroke-width='1.5' fill='none'/%3e%3cpath d='M 40 10 L 35 20 L 45 30 L 30 40' stroke='rgba(249, 115, 22, 0.15)' stroke-width='1' fill='none' /%3e%3c/svg%3e"), radial-gradient(ellipse at 70% 90%, #7f1d1d 0%, #3f3f46 70%)`,
    }
  },
  {
    id: 'forest',
    name: 'Dark Forest',
    cost: 50,
    style: {
      backgroundColor: '#0f2027',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3e%3cpath d='M 50,10 L 10,100 L 25,100 L 25,120 L 75,120 L 75,100 L 90,100 Z' fill='rgba(255,255,255,0.07)' /%3e%3cpath d='M 150,40 L 110,130 L 125,130 L 125,150 L 175,150 L 175,130 L 190,130 Z' fill='rgba(255,255,255,0.05)' /%3e%3c/svg%3e"), linear-gradient(to top, #0f2027, #203a43, #2c5364)`,
    }
  },
];
