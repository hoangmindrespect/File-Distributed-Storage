import { createContext, useContext, useState } from 'react';
import ProgressBar from '../ProgressBar';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [progresses, setProgresses] = useState([]);

  const addProgress = (progress) => {
    setProgresses(prev => [...prev, progress]);
  };

  const updateProgress = (id, updates) => {
    setProgresses(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  const removeProgress = (id) => {
    setProgresses(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProgressContext.Provider value={{ 
      progresses, 
      addProgress, 
      updateProgress, 
      removeProgress 
    }}>
      {children}
      {progresses.length > 0 && (
        <ProgressBar 
          progresses={progresses} 
          onCancel={(id) => removeProgress(id)} 
        />
      )}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);