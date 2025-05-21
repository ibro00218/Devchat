// Theme management utility

// Define theme types
export type ThemeType = 'dark' | 'light' | 'dim';

// Theme color values
interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  accentColor: string;
  borderColor: string;
}

// Theme definitions
const themes: Record<ThemeType, ThemeColors> = {
  dark: {
    bgPrimary: '#1E1E1E',
    bgSecondary: '#2b2d31',
    bgTertiary: '#313338',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    accentColor: '#5865F2',
    borderColor: '#3b3d43'
  },
  light: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F2F3F5',
    bgTertiary: '#E3E5E8',
    textPrimary: '#000000',
    textSecondary: '#747f8d',
    accentColor: '#5865F2',
    borderColor: '#D4D7DC'
  },
  dim: {
    bgPrimary: '#313338',
    bgSecondary: '#2b2d31',
    bgTertiary: '#1e1f22',
    textPrimary: '#FFFFFF',
    textSecondary: '#B8B9BF',
    accentColor: '#5865F2',
    borderColor: '#3b3d43'
  }
};

// Function to apply theme
export function applyTheme(theme: ThemeType): void {
  // Store theme preference
  localStorage.setItem('userTheme', theme);
  
  // Apply CSS variables to document root
  const root = document.documentElement;
  
  // Apply theme colors
  const colors = themes[theme];
  for (const [key, value] of Object.entries(colors)) {
    // Convert camelCase to kebab-case for CSS variables
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--${cssVarName}`, value);
  }
  
  // Add theme class
  document.body.className = '';
  document.body.classList.add(`theme-${theme}`);
  
  // Additional theme-specific adjustments
  if (theme === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  
  console.log(`Theme '${theme}' applied successfully`);
}

// Initialize theme from local storage or default to dark
export function initializeTheme(): void {
  const savedTheme = localStorage.getItem('userTheme') as ThemeType | null;
  applyTheme(savedTheme || 'dark');
}

// Function to get the current theme
export function getCurrentTheme(): ThemeType {
  return (localStorage.getItem('userTheme') as ThemeType) || 'dark';
}

// Change font size
export function setFontSize(size: number): void {
  document.documentElement.style.fontSize = `${size}px`;
  localStorage.setItem('fontSize', size.toString());
  console.log(`Font size changed to ${size}px`);
}

// Initialize font size
export function initializeFontSize(): number {
  const savedSize = localStorage.getItem('fontSize');
  const size = savedSize ? parseInt(savedSize) : 14;
  setFontSize(size);
  return size;
}