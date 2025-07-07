import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import { toast } from 'react-toastify';
import CommentSection from './CommentSection';
import EditPostModal from './EditPostModal';
import SocialShare from './SocialShare';

const PostCard = ({ post, onLike, onUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if the current user is the author of the post
  const isOwnPost = isAuthenticated && user?._id === post.createdBy?._id;

  // Check if the current user has liked the post
  const isLiked = isAuthenticated && post.likes?.some(like => 
    typeof like === 'string' ? like === user?._id : like._id === user?._id
  );

  const handleLike = async () => {
    if (!isAuthenticated) {
      return; // onLike will handle the error message
    }
    
    if (isOwnPost) {
      return; // Don't allow self-liking
    }
    
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      await onLike(post._id);
    } catch (error) {
      // Error handled
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await postAPI.deletePost(post._id);
      if (response.data?.success) {
        toast.success('Post deleted successfully');
        onUpdate(); // Refresh the posts list
      }
    } catch (error) {
      // Error handled
      toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Content truncation logic
  const CONTENT_LIMIT = 150;
  const shouldTruncate = post.content && post.content.length > CONTENT_LIMIT;
  const displayContent = shouldTruncate && !showFullContent 
    ? post.content.substring(0, CONTENT_LIMIT) + '...'
    : post.content;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg dark:shadow-slate-900/50 transition-shadow duration-300">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {post.createdBy?.profile && (
              <img
                src={post.createdBy.profile}
                alt={post.createdBy.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                  {post.createdBy?.name || 'Anonymous'}
                </h3>
                {isOwnPost && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                    Your Post
                  </span>
                )}
                {post.isEdited && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-full">
                    Edited
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                @{post.createdBy?.userName || 'unknown'} • {formatDate(post.createdAt)}
                {post.isEdited && post.editedAt && (
                  <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
                    • Edited {formatDate(post.editedAt)}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Edit/Delete buttons for own posts */}
          {isOwnPost && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                title="Edit post"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 disabled:opacity-50"
                title="Delete post"
              >
                {isDeleting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Post Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">
          {post.title}
        </h2>

        {/* Post Content */}
        {post.content && (
          <div className="mb-4">
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              {displayContent}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium transition-colors duration-200"
              >
                {showFullContent ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        )}

        {/* Post Image */}
        {post.image && (
          <div className="mb-6 -mx-6">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px', minHeight: '250px' }}
            />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking || !isAuthenticated || isOwnPost}
              className={`flex items-center space-x-2 transition-all duration-200 ${
                isOwnPost 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : !isAuthenticated
                  ? 'text-gray-500 hover:text-gray-600'
                  : isLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
              title={
                isOwnPost 
                  ? "You can't like your own post" 
                  : !isAuthenticated 
                  ? "Login to like posts" 
                  : isLiked 
                  ? "Unlike this post" 
                  : "Like this post"
              }
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${isLiking ? 'scale-110' : ''}`}
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">
                {post.likes?.length || 0} {(post.likes?.length || 0) === 1 ? 'Like' : 'Likes'}
              </span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.255-.949L5 20l1.395-3.72C5.512 15.042 5 13.574 5 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <span className="text-sm font-medium">
                {post.comments?.length || 0} Comments
              </span>
            </button>
          </div>

          {/* Share Button */}
          <SocialShare post={post} />
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection 
          postId={post._id} 
          postAuthorId={post.createdBy?._id}
          onUpdate={onUpdate}
        />
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        post={post}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default PostCard;
