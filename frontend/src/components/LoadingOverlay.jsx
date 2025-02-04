const LoadingOverlay = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="absolute inset-0 bg-gray-600 opacity-70"></div>
      <div className="flex flex-col items-center relative z-10">
        {/* Adjust the size of the spinner based on screen size */}
        <div className="w-15 h-15 sm:w-20 sm:h-20 border-4 border-transparent border-t-white border-b-white rounded-full animate-spin"></div>
        {/* Adjust the font size for "Loading..." text */}
        <p className="text-white mt-5 text-2xl sm:text-3xl font-extrabold animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
