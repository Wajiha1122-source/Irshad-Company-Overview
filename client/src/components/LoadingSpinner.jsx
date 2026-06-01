const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-blue-600 border-t-transparent ${sizeClasses[size]}`} />
  );
};

export default LoadingSpinner;
