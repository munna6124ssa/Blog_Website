const PostSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-300 dark:bg-slate-600 rounded-full animate-shimmer"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-1/4 mb-2 animate-shimmer"></div>
          <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-1/3 animate-shimmer"></div>
        </div>
      </div>
      
      {/* Title Skeleton */}
      <div className="h-6 bg-gray-300 dark:bg-slate-600 rounded w-3/4 mb-3 animate-shimmer"></div>
      
      {/* Content Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded animate-shimmer"></div>
        <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-5/6 animate-shimmer"></div>
        <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-4/5 animate-shimmer"></div>
      </div>
      
      {/* Image Skeleton */}
      <div className="h-64 bg-gray-300 dark:bg-slate-600 rounded-lg mb-6 animate-shimmer"></div>
      
      {/* Actions Skeleton */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-300 dark:bg-slate-600 rounded animate-shimmer"></div>
            <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-12 animate-shimmer"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-300 dark:bg-slate-600 rounded animate-shimmer"></div>
            <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-16 animate-shimmer"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-300 dark:bg-slate-600 rounded animate-shimmer"></div>
          <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-12 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;
