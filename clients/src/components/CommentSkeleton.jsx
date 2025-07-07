const CommentSkeleton = () => {
  return (
    <div className="flex space-x-3 animate-pulse">
      <div className="w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full flex-shrink-0"></div>
      <div className="flex-1">
        <div className="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-20"></div>
              <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-16"></div>
            </div>
          </div>
          <div className="space-y-2 mb-2">
            <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded"></div>
            <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-3/4"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 dark:bg-slate-600 rounded"></div>
            <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSkeleton;
