export const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }
  
  localStorage.setItem('festflow_theme', theme);
};

export const initTheme = () => {
  const savedTheme = localStorage.getItem('festflow_theme') as 'light' | 'dark' | 'system' | null;
  if (savedTheme === 'dark') {
    applyTheme('dark');
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
