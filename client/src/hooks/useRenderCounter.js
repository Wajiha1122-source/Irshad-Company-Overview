import { useEffect, useRef } from 'react';

const useRenderCounter = (componentName) => {
  const renderCount = useRef(0);
  const mountTime = useRef(null);

  useEffect(() => {
    renderCount.current += 1;
    
    if (renderCount.current === 1) {
      mountTime.current = performance.now();
      console.log(`[PERF] ${componentName} MOUNTED at ${mountTime.current.toFixed(2)}ms`);
    }
    
    console.log(`[PERF] ${componentName} RENDER #${renderCount.current}`);
  });

  return { renderCount: renderCount.current, mountTime: mountTime.current };
};

export default useRenderCounter;
