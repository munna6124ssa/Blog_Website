import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import { toast } from 'react-toastify';
import CommentSkeleton from './CommentSkeleton';

const CommentSection = ({ postId, postAuthorId, onUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if the current user is the author of the post
  const isOwnPost = isAuthenticated && user?._id === postAuthorId;

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Add 1 second delay to show skeleton loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use public API for unauthenticated users, authenticated API for logged-in users
      const response = isAuthenticated 
        ? await postAPI.getComments(postId)
        : await postAPI.getPublicComments(postId);
      setComments(response.data.data || response.data || []);
    } catch (error) {
      // Error handled
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (isOwnPost) {
      toast.error("You can't comment on your own post");
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await postAPI.addComment({
        content: newComment,
        postId: postId
      });
      
      setNewComment('');
      await fetchComments();
      if (onUpdate) onUpdate();
      
      if (response.data?.success) {
        toast.success('Comment added successfully');
      }
    } catch (error) {
      // Error handled
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add comment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border-t border-gray-100 dark:border-slate-700 p-6 bg-gray-50 dark:bg-slate-800/50">
      {/* Add Comment Form - Only show for authenticated users who aren't the post author */}
      {isAuthenticated && !isOwnPost && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex space-x-3">
            {user?.profile && (
              <img
                src={user.profile}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting...
                    </div>
                  ) : (
                    'Post Comment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Login prompt for unauthenticated users */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <Link to="/login" className="font-medium hover:underline">Login</Link> or{' '}
            <Link to="/register" className="font-medium hover:underline">register</Link> to join the conversation
          </p>
        </div>
      )}

      {/* Message for own post */}
      {isAuthenticated && isOwnPost && (
        <div className="mb-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
          <p className="text-gray-600 text-sm">This is your post. You can view comments but cannot add new ones.</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          // Show skeleton loading for comments
          Array.from({ length: 2 }).map((_, index) => (
            <CommentSkeleton key={index} />
          ))
        ) : comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment._id} 
              comment={comment}
              isAuthenticated={isAuthenticated}
              user={user}
              postAuthorId={postAuthorId}
              onCommentUpdate={fetchComments}
              onUpdate={onUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};

const CommentItem = ({ comment, isAuthenticated, user, postAuthorId, onCommentUpdate, onUpdate }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isOwnComment = isAuthenticated && user?._id === comment.createdBy?._id;
  const isCommentLiked = isAuthenticated && comment.likes?.some(like => 
    typeof like === 'string' ? like === user?._id : like._id === user?._id
  );

  const handleLikeComment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like comments');
      return;
    }

    setIsLiking(true);
    try {
      const response = await postAPI.likeComment(comment._id);
      if (response.data?.success) {
        toast.success(response.data.message);
        onCommentUpdate(); // Refresh comments
      }
    } catch (error) {
      // Error handled
      toast.error(error.response?.data?.message || 'Failed to like comment');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await postAPI.deleteComment(comment._id);
      if (response.data?.success) {
        toast.success('Comment deleted successfully');
        onCommentUpdate(); // Refresh comments list
        if (onUpdate) onUpdate(); // Refresh parent post data to update comment count
      }
    } catch (error) {
      // Error handled
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex space-x-3">
      {comment.createdBy?.profile && (
        <img
          src={comment.createdBy.profile}
          alt={comment.createdBy.name}
          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
        />
      )}
      <div className="flex-1">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-gray-900">
                {comment.createdBy?.name || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            
            {/* Delete button for comment author only */}
            {isOwnComment && (
              <button
                onClick={handleDeleteComment}
                disabled={isDeleting}
                className="text-gray-400 hover:text-red-600 transition-colors duration-200 disabled:opacity-50"
                title="Delete comment"
              >
                {isDeleting ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mb-2">
            {comment.content}
          </p>
          
          {/* Comment like button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLikeComment}
              disabled={isLiking || !isAuthenticated}
              className={`flex items-center space-x-1 text-xs transition-colors duration-200 ${
                isCommentLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-500 hover:text-red-600'
              } ${!isAuthenticated ? 'cursor-not-allowed opacity-50' : ''}`}
              title={!isAuthenticated ? 'Login to like comments' : isCommentLiked ? 'Unlike comment' : 'Like comment'}
            >
              <svg 
                className={`w-3 h-3 ${isLiking ? 'animate-pulse' : ''}`}
                fill={isCommentLiked ? 'currentColor' : 'none'}
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{comment.likes?.length || 0}</span>
            </button>
          </div>
        </div>
        
        {/* Nested comments would go here if implementing replies */}
        {comment.comments && comment.comments.length > 0 && (
          <div className="ml-4 mt-2 space-y-2">
            {comment.comments.map((nestedComment) => (
              <CommentItem 
                key={nestedComment._id} 
                comment={nestedComment}
                isAuthenticated={isAuthenticated}
                user={user}
                postAuthorId={postAuthorId}
                onCommentUpdate={onCommentUpdate}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
