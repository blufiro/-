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
      // Layered background: falling snow (repeat) and base gradient.
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3e%3ccircle cx='20' cy='30' r='3' fill='rgba(255,255,255,0.9)'/%3e%3ccircle cx='100' cy='80' r='2' fill='rgba(255,255,255,0.8)'/%3e%3ccircle cx='160' cy='20' r='1.5' fill='rgba(255,255,255,0.9)'/%3e%3ccircle cx='60' cy='140' r='2.5' fill='rgba(255,255,255,0.75)'/%3e%3ccircle cx='180' cy='180' r='2' fill='rgba(255,255,255,0.85)'/%3e%3ccircle cx='50' cy='90' r='1' fill='rgba(255,255,255,0.9)'/%3e%3c/svg%3e"), linear-gradient(to top, #a1c4fd 0%, #c2e9fb 100%)`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundPosition: '0 0, center',
      backgroundSize: '200px 200px, cover',
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
  {
    id: 'space',
    name: 'Outer Space',
    cost: 50,
    style: {
      backgroundColor: '#0d1b2a',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3e%3ccircle cx='50' cy='50' r='1.5' fill='rgba(255,255,255,0.7)'/%3e%3ccircle cx='250' cy='80' r='1' fill='rgba(255,255,255,0.9)'/%3e%3ccircle cx='120' cy='200' r='2' fill='rgba(255,255,255,0.6)'/%3e%3ccircle cx='180' cy='150' r='10' fill='rgba(173, 216, 230, 0.5)'/%3e%3cellipse cx='180' cy='150' rx='16' ry='5' stroke='rgba(255, 255, 255, 0.4)' stroke-width='1' fill='none'/%3e%3cpath d='M 40 250 L 50 245 L 60 255 L 55 260 Z' fill='rgba(200,200,200,0.3)'/%3e%3c/svg%3e"), linear-gradient(to bottom, #000000, #0d1b2a)`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundPosition: '0 0, center',
      backgroundSize: '300px 300px, cover',
    }
  },
  {
    id: 'station',
    name: 'Space Station Interior',
    cost: 50,
    style: {
      backgroundColor: '#F9FAFB', // very light grey fallback
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3e%3crect width='350' height='350' fill='%23F9FAFB'/%3e%3crect x='30' y='50' width='80' height='120' fill='%23F3F4F6' rx='5' stroke='%23E5E7EB' stroke-width='1.5' /%3e%3crect x='40' y='60' width='60' height='30' fill='%23E5E7EB' rx='2' /%3e%3ccircle cx='45' cy='105' r='3' fill='%23D1D5DB' /%3e%3ccircle cx='60' cy='105' r='3' fill='%23D1D5DB' /%3e%3ccircle cx='75' cy='105' r='3' fill='%23D1D5DB' /%3e%3crect x='40' y='120' width='40' height='3' fill='%23D1D5DB' /%3e%3crect x='40' y='130' width='40' height='3' fill='%23D1D5DB' /%3e%3crect x='180' y='200' width='140' height='90' fill='%23F3F4F6' rx='5' stroke='%23E5E7EB' stroke-width='1.5'/%3e%3crect x='190' y='210' width='120' height='4' fill='%23D1D5DB' /%3e%3crect x='190' y='220' width='120' height='4' fill='%23D1D5DB' /%3e%3crect x='190' y='230' width='120' height='4' fill='%23D1D5DB' /%3e%3crect x='280' y='250' width='20' height='20' fill='%23E5E7EB' rx='2'/%3e%3ccircle cx='290' cy='260' r='4' fill='%23D1D5DB'/%3e%3crect x='250' y='40' width='40' height='15' fill='%23E5E7EB' rx='3' /%3e%3ccircle cx='80' cy='250' r='10' stroke='%23E5E7EB' stroke-width='2' fill='none' /%3e%3ccircle cx='80' cy='250' r='4' fill='%23E5E7EB' /%3e%3c/svg%3e")`,
      backgroundSize: '350px 350px',
      backgroundRepeat: 'repeat',
    }
  },
];