import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { postAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import LoadingSpinner from '../components/LoadingSpinner';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import BlogLogo from '../components/BlogLogo';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      // For now, we'll simulate pagination (you can implement backend pagination later)
      const response = isAuthenticated 
        ? await postAPI.getAllPosts()
        : await postAPI.getPublicPosts();
      
      // Simulate pagination logic - in real app, backend should handle this
      if (posts.length >= response.data.length) {
        setHasMore(false);
      }
      
      setPage(nextPage);
    } catch (error) {
      // Error handled
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore, isAuthenticated, posts.length]);

  const [isFetchingMore] = useInfiniteScroll(fetchMorePosts, hasMore);

  const fetchPosts = async () => {
    try {
      // Add 1 second delay to show skeleton loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use public API for unauthenticated users, authenticated API for logged-in users
      const response = isAuthenticated 
        ? await postAPI.getAllPosts()
        : await postAPI.getPublicPosts();
      
      setPosts(response.data);
      setPage(1);
      setHasMore(true);
    } catch (error) {
      // Error handled
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);



  const handleRefresh = () => {
    setRefreshing(true);
    setLoading(true); // Show skeleton loading on refresh
    fetchPosts();
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await postAPI.likePost(postId);
      
      // Update the posts state with the response data
      if (response.data && response.data.success) {
        // Refresh posts to get updated like status and counts
        fetchPosts();
        
        // Show appropriate message based on the action
        if (response.data.message === 'Post unliked') {
          toast.success('Post unliked!');
        } else if (response.data.message === 'Post liked') {
          toast.success('Post liked!');
        }
      }
    } catch (error) {
      // Error handled
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to like post');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16">
      {/* Hero Section for unauthenticated users */}
      {!isAuthenticated && (
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800"></div>
          <div className="absolute inset-0 bg-black opacity-20 dark:opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black opacity-30 dark:opacity-50"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-blue-300 rounded-full opacity-20 animate-bounce delay-1000"></div>
          
          <div className="relative text-white py-20 px-4">
            <div className="max-w-6xl mx-auto text-center">
              {/* Main Heading */}
              <div className="mb-8">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-pulse">
                  BlogSphere
                </h1>
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <div className="h-1 w-16 bg-gradient-to-r from-yellow-400 to-pink-400 rounded"></div>
                  <BlogLogo className="w-12 h-12 text-yellow-300 animate-pulse" />
                  <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded"></div>
                </div>
              </div>
              
              {/* Subtitle */}
              <p className="text-xl md:text-3xl mb-8 text-gray-100 max-w-4xl mx-auto leading-relaxed">
                Where <span className="text-yellow-300 font-semibold">Stories</span> Come to Life, 
                <span className="text-pink-300 font-semibold"> Ideas</span> Find Their Voice, and 
                <span className="text-purple-300 font-semibold"> Communities</span> Connect
              </p>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                  <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Share Your Story</h3>
                  <p className="text-sm text-gray-200">Express yourself with beautifully crafted posts and stunning visuals</p>
                </div>
                
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                  <div className="w-12 h-12 bg-pink-400 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Connect & Engage</h3>
                  <p className="text-sm text-gray-200">Like, comment, and interact with a vibrant community of creators</p>
                </div>
                
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                  <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Discover & Inspire</h3>
                  <p className="text-sm text-gray-200">Explore trending content and get inspired by amazing creators</p>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center px-8 py-4 text-base font-medium rounded-xl text-gray-800 bg-gradient-to-r from-yellow-300 to-pink-300 hover:from-yellow-400 hover:to-pink-400 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Join the Community
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-base font-medium rounded-xl text-white bg-transparent hover:bg-white hover:text-gray-800 transition-all duration-300 shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Latest Stories
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-1"></div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
              {isAuthenticated 
                ? `Welcome back, ${user?.name}! 🌟 Discover what's trending in our amazing community` 
                : "Explore incredible content from our talented community of writers and creators"
              }
              {!isAuthenticated && (
                <span className="block text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">
                  💡 <Link to="/login" className="hover:underline transition-colors">Login</Link> or <Link to="/register" className="hover:underline transition-colors">join us</Link> to like and comment on posts
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <Link
                to="/create-post"
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </Link>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 dark:border-slate-600 disabled:opacity-50 transform hover:scale-105"
            >
              <svg 
                className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>



        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-400 rounded-full"></div>
              <div className="absolute top-20 right-16 w-16 h-16 bg-purple-400 rounded-full"></div>
              <div className="absolute bottom-16 left-20 w-12 h-12 bg-pink-400 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-14 h-14 bg-yellow-400 rounded-full"></div>
            </div>
            
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                <svg className="h-12 w-12 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Stories Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                {isAuthenticated 
                  ? "🚀 Ready to share your first amazing story? The community is waiting to hear from you!" 
                  : "✨ Be the first to share your incredible thoughts and inspire others in our growing community!"
                }
              </p>
              
              {isAuthenticated && (
                <div className="space-y-4">
                  <Link
                    to="/create-post"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Create Your First Post
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Share your story in just a few clicks</p>
                </div>
              )}
              
              {!isAuthenticated && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Link
                      to="/register"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Join Community
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Join thousands of writers and readers</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {loading ? (
              // Show skeleton loading
              Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={index} />
              ))
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-24 h-24 text-gray-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-300 mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-slate-400">Be the first to share something amazing!</p>
              </div>
            ) : (
              <>
                {posts.map((post, index) => (
                  <div 
                    key={post._id}
                    className="transform hover:scale-[1.02] transition-all duration-300"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <PostCard
                      post={post}
                      onLike={handleLike}
                      onUpdate={fetchPosts}
                    />
                  </div>
                ))}
                
                {/* Infinite scroll loading indicator */}
                {(isFetchingMore || loadingMore) && (
                  <div className="flex justify-center py-8">
                    <PostSkeleton />
                  </div>
                )}
                
                {/* End of posts indicator */}
                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-slate-400">
                      <div className="h-px bg-gray-300 dark:bg-slate-600 w-16"></div>
                      <span className="text-sm">You've reached the end</span>
                      <div className="h-px bg-gray-300 dark:bg-slate-600 w-16"></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
