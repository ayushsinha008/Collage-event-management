export const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
  
  localStorage.setItem('festflow_theme', theme);
};

export const initTheme = () => {
  const savedTheme = localStorage.getItem('festflow_theme') as 'light' | 'dark' | 'system' | null;
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme('light');
  }
};

export const applyDensity = (density: 'comfortable' | 'compact') => {
  const root = window.document.documentElement;
  root.classList.remove('density-comfortable', 'density-compact');
  root.classList.add(`density-${density}`);
  localStorage.setItem('festflow_density', density);
};

export const initDensity = () => {
  const savedDensity = localStorage.getItem('festflow_density') as 'comfortable' | 'compact' | null;
  if (savedDensity) {
    applyDensity(savedDensity);
  } else {
    applyDensity('comfortable');
  }
};
