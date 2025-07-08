export interface ThemeColor {
  name: string;
  value: string;
  class: string;
  glow: string;
  glowShadow: string;
  glowShadowLg: string;
}

export const THEME_COLORS: ThemeColor[] = [
  { 
    name: 'Lime', 
    value: '#65A30D', 
    class: 'bg-lime-600',
    glow: 'rgba(101, 163, 13, 0.2)',
    glowShadow: 'rgba(101, 163, 13, 0.3)',
    glowShadowLg: 'rgba(101, 163, 13, 0.4)'
  },
  { 
    name: 'Blue', 
    value: '#2563EB', 
    class: 'bg-blue-600',
    glow: 'rgba(37, 99, 235, 0.2)',
    glowShadow: 'rgba(37, 99, 235, 0.3)',
    glowShadowLg: 'rgba(37, 99, 235, 0.4)'
  },
  { 
    name: 'Purple', 
    value: '#7C3AED', 
    class: 'bg-purple-600',
    glow: 'rgba(124, 58, 237, 0.2)',
    glowShadow: 'rgba(124, 58, 237, 0.3)',
    glowShadowLg: 'rgba(124, 58, 237, 0.4)'
  },
  { 
    name: 'Pink', 
    value: '#DB2777', 
    class: 'bg-pink-600',
    glow: 'rgba(219, 39, 119, 0.2)',
    glowShadow: 'rgba(219, 39, 119, 0.3)',
    glowShadowLg: 'rgba(219, 39, 119, 0.4)'
  },
  { 
    name: 'Orange', 
    value: '#EA580C', 
    class: 'bg-orange-600',
    glow: 'rgba(234, 88, 12, 0.2)',
    glowShadow: 'rgba(234, 88, 12, 0.3)',
    glowShadowLg: 'rgba(234, 88, 12, 0.4)'
  },
  { 
    name: 'Teal', 
    value: '#0D9488', 
    class: 'bg-teal-600',
    glow: 'rgba(13, 148, 136, 0.2)',
    glowShadow: 'rgba(13, 148, 136, 0.3)',
    glowShadowLg: 'rgba(13, 148, 136, 0.4)'
  },
];

export const applyThemeColor = (color: ThemeColor) => {
  document.documentElement.style.setProperty('--lime-accent', color.value);
  document.documentElement.style.setProperty('--lime-glow', color.glow);
  document.documentElement.style.setProperty('--lime-glow-shadow', color.glowShadow);
  document.documentElement.style.setProperty('--lime-glow-shadow-lg', color.glowShadowLg);
};