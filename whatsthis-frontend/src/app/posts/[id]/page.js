"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import postService from "../../../services/postService";
import commentService from "../../../services/commentService";
import { useUser } from "../../../context/UserContext";
import Link from "next/link";
import axiosInstance from "../../../services/axiosInstance";
import { getFullImageUrl } from "../../../utils/urlHelper";
import LoginModal from '../../../components/LoginModal';

export default function DetailedPostPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useUser();

  const [post, setPost] = useState(null);
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [loginWarning, setLoginWarning] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [tagDetails, setTagDetails] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchUserVote = async () => {
        try {
          const currentUserVote = await postService.getUserVote(id, user.id);
          setUserVote(currentUserVote);
        } catch (error) {
          console.error("Error fetching user vote:", error);
        }
      };
      fetchUserVote();
    }
  }, [id, user]);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const fetchedPost = await postService.getPostById(id);
        setPost(fetchedPost);

        const userRes = await axiosInstance.get(`/users/${fetchedPost.userId}`);
        const userData = userRes.data;
        setUsername(userData.username);
        setProfilePicture(getFullImageUrl(userData.profilePictureUrl));

        const fetchedComments = await commentService.getCommentsByPostId(id);
        const commentsWithUserData = await Promise.all(
          fetchedComments.map(async (comment) => {
            try {
              const userRes = await axiosInstance.get(`/users/${comment.userId}`);
              const userData = userRes.data;
              return {
                ...comment,
                commenterUsername: userData.username,
                profilePicture: getFullImageUrl(userData.profilePictureUrl)
              };
            } catch (error) {
              return {
                ...comment,
                commenterUsername: "Unknown User",
                profilePicture: "https://www.gravatar.com/avatar/default?d=mp"
              };
            }
          })
        );
        setComments(commentsWithUserData);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load post and comments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id, user]);

  useEffect(() => {
    const fetchTagDetails = async () => {
      if (post?.tags) {
        const details = {};
        for (const tag of post.tags) {
          try {
            const tagInfo = await postService.getTagDetails(tag);
            if (tagInfo && tagInfo.length > 0) {
              details[tag] = tagInfo[0];
            }
          } catch (error) {
            console.error(`Error fetching details for tag ${tag}:`, error);
          }
        }
        setTagDetails(details);
      }
    };
    
    fetchTagDetails();
  }, [post?.tags]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleVote = async (voteType) => {
    if (!user) {
      setLoginWarning(true);
      setTimeout(() => setLoginWarning(false), 3000);
      return;
    }

    try {
      const updatedPost = await postService.votePost(post.id, user.id, voteType);
      setPost(updatedPost);
      const newUserVote = await postService.getUserVote(post.id, user.id);
      setUserVote(newUserVote);
    } catch (error) {
      console.error(`Error ${voteType}ing post:`, error);
    }
  };

  const handleCommentSubmit = async (parentCommentId = null, text = null) => {
    const commentText = text || newComment;
    
    if (!commentText.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    if (!user) {
      return (
        <div className="text-center mt-4">
          <p className="text-gray-400 mb-2">You must be logged in to comment.</p>
          <Link 
            href="/login" 
            className="text-teal-400 hover:text-teal-300 underline"
          >
            Click here to login
          </Link>
        </div>
      );
    }

    const commentData = {
      text: commentText.trim(),
      userId: user.id,
      username: user.username,
      postId: parseInt(post.id),
      parentCommentId: parentCommentId ? parseInt(parentCommentId) : null
    };

    try {
      const comment = await commentService.addComment(commentData);
      const newComment = {
        ...comment,
        commenterUsername: user.username,
        profilePicture: user.profilePicture || "https://www.gravatar.com/avatar/default?d=mp",
      };
      
      setComments(prev => [...prev, newComment]);
      
      if (parentCommentId) {
        setReplyText("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      setError("Failed to submit comment. Please try again.");
    }
  };

  const handleImageClick = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleMarkSolution = async (commentId) => {
    if (!user || user.id !== post.userId) {
      return;
    }

    try {
      const isRemoving = commentId === post.solutionCommentId;
      const updatedPost = await commentService.toggleSolution(post.id, commentId, isRemoving);
      setPost(updatedPost);
    } catch (error) {
      console.error('Error marking solution:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!user || user.id !== post?.userId) {
      return;
    }

    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await postService.deletePost(id);
        router.push('/');
      } catch (error) {
        console.error('Error deleting post:', error);
        if (error.response?.status === 403) {
          setError('You are not authorized to delete this post.');
        } else {
          setError('Failed to delete post. Please try again.');
        }
      }
    }
  };

  const handleEditPost = () => {
    router.push(`/create-post?edit=${post.id}`);
  };

  const renderComment = (comment, level = 0) => {
    const replies = comments.filter(c => c.parentCommentId === comment.id);
    const isSolution = comment.id === post.solutionCommentId;
    
    return (
      <div key={`comment-content-${comment.id}`} className={`${level > 0 ? 'ml-8' : ''}`}>
        <div className="flex gap-3">
          <img
            src={comment.profilePicture}
            alt={`${comment.commenterUsername}'s profile`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className={`bg-gray-750 rounded-lg p-4 ${
              isSolution ? 'ring-1 ring-green-500/50' : ''
            }`}>
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/profile/${comment.userId}`}
                  className="text-teal-400 font-medium hover:underline"
                >
                  {comment.commenterUsername}
                </Link>
                {isSolution && (
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Solution
                  </span>
                )}
              </div>
              <p className="text-gray-300">{comment.text}</p>
            </div>
            
            <div className="mt-2 flex items-center gap-4">
              {user && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Reply
                </button>
              )}
              {user && user.id === post.userId && !post.isSolved && (
                <button
                  onClick={() => handleMarkSolution(comment.id)}
                  className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  Mark as Solution
                </button>
              )}
            </div>

            {replyingTo === comment.id && (
              <div className="mt-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Write your reply..."
                  rows="2"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleCommentSubmit(comment.id, replyText)}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {replies.length > 0 && (
          <div className="mt-4">
            {replies.map(reply => (
              <div key={`reply-${reply.id}`}>
                {renderComment(reply, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === post.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? post.imageUrls.length - 1 : prev - 1
    );
  };

  const handleFullscreenNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === post.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const handleFullscreenPrevious = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? post.imageUrls.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return <div className="text-teal-300 text-center text-xl mt-10">Loading...</div>;
  }

  if (!post) {
    return <div className="text-center mt-10 text-red-500">Post not found.</div>;
  }

  const renderAttributes = () => {
    const excludedKeys = [
      "id", "userId", "title", "description", "imageUrls", "tags", "votes", "comments", "_links",
      "size", "sizeValue", "sizeUnit", 
      "widthValue", "widthUnit", "heightValue", "heightUnit", "depthValue", "depthUnit", 
      "parts", 
      "weight", "weightValue", "weightUnit",
      "solutionCommentId",
      "isSolved",
      "solved",
      "createdAt"
    ];

    return (
      <div className="space-y-2">
        {/* Table Layout */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {(post.widthValue || post.heightValue || post.depthValue) && (
            <div className="flex items-center border-b border-gray-700/50 last:border-0">
              <div className="w-1/3 p-4 bg-gray-800/50">
                <span className="text-gray-400 text-sm">Dimensions</span>
              </div>
              <div className="w-2/3 p-4 flex gap-4">
                {post.widthValue && (
                  <span key="width" className="text-white">
                    {post.widthValue}{post.widthUnit} 
                  </span>
                )}
                {post.heightValue && (
                  <span key="height" className="text-white">
                    {post.heightValue}{post.heightUnit} × 
                  </span>
                )}
                {post.depthValue && (
                  <span key="depth" className="text-white">
                    {post.depthValue}{post.depthUnit}
                  </span>
                )}
              </div>
            </div>
          )}

          {post.weightValue && post.weightValue.trim() !== '' && (
            <div className="flex items-center border-b border-gray-700/50 last:border-0">
              <div className="w-1/3 p-4 bg-gray-800/50">
                <span className="text-gray-400 text-sm">Weight</span>
              </div>
              <div className="w-2/3 p-4">
                <span className="text-white">{post.weightValue}{post.weightUnit}</span>
              </div>
            </div>
          )}

          {Object.entries(post)
            .filter(([key, value]) => 
              !excludedKeys.includes(key) && 
              value && 
              value.toString().trim() !== '' &&
              value !== 'null' &&
              value !== 'undefined'
            )
            .map(([key, value]) => (
              <div key={key} className="flex items-center border-b border-gray-700/50 last:border-0">
                <div className="w-1/3 p-4 bg-gray-800/50">
                  <span className="text-gray-400 text-sm">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                <div className="w-2/3 p-4">
                  <span className="text-white">
                    {typeof value === 'boolean' 
                      ? (value ? 'Yes' : 'No') 
                      : value.toString()}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const formatVotes = (votes) => {
    if (votes === 0) return "0";
    return votes > 0 ? `+${votes}` : `${votes}`;
  };

  const renderPartAttribute = (part, key, value) => {
    if (key.endsWith('Value')) {
      const dimensionType = key.replace('Value', '');
      const unitValue = part[`${dimensionType}Unit`];
      if (unitValue) {
        return `${value} ${unitValue}`;
      }
    }
    return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={profilePicture}
                alt={`${username}'s profile`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <Link href={`/profile/${post.userId}`} className="text-teal-400 font-medium hover:underline">
                  {username || "Unknown User"}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote("upvote")}
                className={`p-1.5 rounded-md ${
                  userVote === "upvote"
                    ? "bg-teal-600 text-white" 
                    : "bg-gray-700 hover:bg-teal-500 text-teal-400 hover:text-white"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <span className={`font-medium ${
                post.votes > 0 ? 'text-teal-400' : 
                post.votes < 0 ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                {formatVotes(post.votes)}
              </span>

              <button
                onClick={() => handleVote("downvote")}
                className={`p-1.5 rounded-md ${
                  userVote === "downvote"
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 hover:bg-red-500 text-red-400 hover:text-white"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {user && user.id === post?.userId && (
                <div className="relative menu-container ml-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Post options"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-gray-400 hover:text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" 
                      />
                    </svg>
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            handleEditPost();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-700 flex items-center gap-2"
                          role="menuitem"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit Post
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            handleDeletePost();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                          role="menuitem"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
            {post.title}
            {post.isSolved && (
              <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-sm font-normal">
                Solved
              </span>
            )}
          </h1>

          <p className="text-gray-300 mb-4">{post.description}</p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => {
                const tagInfo = tagDetails[tag];
                return (
                  <div key={`tag-${index}`} className="relative group">
                    <a
                      href={tagInfo?.wikipediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`bg-gray-700 text-teal-400 px-2 py-1 rounded-full text-sm 
                        hover:bg-gray-600 transition-colors inline-flex items-center gap-1
                        ${!tagInfo ? 'opacity-50' : 'cursor-pointer'}`}
                    >
                      {tagInfo?.label || tag}
                      {!tagInfo && (
                        <div className="w-3 h-3 border-t-2 border-teal-400 animate-spin rounded-full"></div>
                      )}
                    </a>
                    {tagInfo?.description && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        {tagInfo.description}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-6">
                <div className="relative aspect-[16/9]">
                  <img
                    src={getFullImageUrl(post.imageUrls[currentImageIndex])}
                    alt={`Post Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain bg-gray-900"
                    onClick={handleImageClick}
                  />
                  
                  {post.imageUrls.length > 1 && (
                    <>
                      {/* Navigation Arrows */}
                      <button
                        onClick={previousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        {currentImageIndex + 1} / {post.imageUrls.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  Comments ({comments.length})
                </h3>
              </div>
              {user ? (
                <div className="p-4 border-b border-gray-700 bg-gray-750">
                  <div className="flex gap-3">
                    <img
                      src={user.profilePicture || "https://www.gravatar.com/avatar/default?d=mp"}
                      alt="Your profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        rows="3"
                      />
                      {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleCommentSubmit()}
                          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-gray-400 mb-2">You must be logged in to comment.</p>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="text-teal-400 hover:text-teal-300 underline"
                  >
                    Click here to login
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="divide-y divide-gray-700">
                {comments
                  .filter(comment => !comment.parentCommentId)
                  .sort((a, b) => {
                    // Put solution comment first
                    if (a.id === post.solutionCommentId) return -1;
                    if (b.id === post.solutionCommentId) return 1;
                    // Then sort by creation date (assuming there's a createdAt field)
                    return new Date(b.createdAt) - new Date(a.createdAt);
                  })
                  .map((comment) => (
                    <div key={`comment-${comment.id}`} className={`p-4 ${
                      comment.id === post.solutionCommentId ? 'ring-2 ring-green-500/50 bg-green-500/5' : ''
                    }`}>
                      {renderComment(comment)}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:w-80 xl:w-96">
            <div className="bg-gray-800 rounded-lg shadow-lg sticky top-4">
              {/* Main Tabs */}
              <div className="flex border-b border-gray-700">
                <button
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === "details"
                      ? "text-teal-400 border-b-2 border-teal-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
                {post.parts && post.parts.length > 0 && (
                  <button
                    className={`flex-1 py-3 text-sm font-medium ${
                      activeTab === "parts"
                        ? "text-teal-400 border-b-2 border-teal-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveTab("parts")}
                  >
                    Parts
                  </button>
                )}
              </div>

              {/* Content Area */}
              <div className="p-4">
                {activeTab === "details" ? (
                  <div className="space-y-2">
                    {renderAttributes()}
                  </div>
                ) : (
                  <div>
                    {/* Part Tabs */}
                    {post.parts && post.parts.length > 0 && (
                      <>
                        <div className="flex overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4 border-b border-gray-700">
                          {post.parts.map((part, index) => (
                            <button
                              key={index}
                              onClick={() => setActivePartIndex(index)}
                              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                                activePartIndex === index
                                  ? "text-teal-400 border-b-2 border-teal-400"
                                  : "text-gray-400 hover:text-white"
                              }`}
                            >
                              {part.name || `Part ${index + 1}`}
                            </button>
                          ))}
                        </div>

                        {/* Active Part Content */}
                        {post.parts[activePartIndex] && (
                          <div className="space-y-4">
                            {Object.entries(post.parts[activePartIndex])
                              .filter(([key, value]) => 
                                !key.endsWith('Unit') && 
                                key !== 'id' && 
                                key !== 'name' &&  
                                value && 
                                value.toString().trim() !== '' &&
                                value !== 'null' &&
                                value !== 'undefined'
                              )
                              .map(([key, value]) => (
                                <div key={key} className="flex items-center border-b border-gray-700/50 last:border-0">
                                  <div className="w-1/3 p-4 bg-gray-800/50">
                                    <span className="text-gray-400 text-sm">
                                      {key.replace(/([A-Z])/g, " $1").trim()}
                                    </span>
                                  </div>
                                  <div className="w-2/3 p-4">
                                    <span className="text-white">
                                      {renderPartAttribute(post.parts[activePartIndex], key, value)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    )}

                    {(!post.parts || post.parts.length === 0) && (
                      <div className="text-center text-gray-400 py-8">
                        No parts information available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2"
            onClick={closeFullscreen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={getFullImageUrl(post.imageUrls[currentImageIndex])}
              alt="Fullscreen view"
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()} 
            />

            {post.imageUrls.length > 1 && (
              <>
                {/* Navigation Arrows */}
                <button
                  onClick={handleFullscreenPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-4 rounded-full backdrop-blur-sm transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleFullscreenNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-4 rounded-full backdrop-blur-sm transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                  {currentImageIndex + 1} / {post.imageUrls.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {loginWarning && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in cursor-pointer" onClick={() => setShowLoginModal(true)}>
          Click here to login to vote
        </div>
      )}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}