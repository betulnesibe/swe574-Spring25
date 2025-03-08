import React, { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from '../services/axiosInstance';
import { getFullImageUrl } from '../utils/urlHelper';

const PostCard = ({ post }) => {
  const [username, setUsername] = useState(post.username || "Unknown");
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!post.username) {
      axiosInstance.get(`/users/${post.userId}`)
        .then((response) => {
          const data = response.data;
          if (data && data.username) {
            setUsername(data.username);
          }
        })
        .catch((error) => console.error("Failed to fetch username:", error));
    }

    axiosInstance.get(`/comments/posts/${post.id}/comments`)
      .then((response) => {
        const data = response.data;
        const count = data._embedded?.commentDtoes?.length || 0;
        setCommentCount(count);
      })
      .catch((error) => console.error("Failed to fetch comment count:", error));
  }, [post.username, post.userId, post.id]);

  const formatVotes = (votes) => {
    if (votes === 0) return "0";
    return votes > 0 ? `+${votes}` : `${votes}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link href={`/posts/${post.id}`} passHref>
      <div className="bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105 w-full h-[500px] flex flex-col relative">
        {/* Solved Badge */}
        {post.solved && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm font-semibold z-10">
            SOLVED
          </div>
        )}

        {/* Image Section */}
        <div className="h-[200px] bg-gray-700 flex-shrink-0">
          {post.imageUrls && post.imageUrls.length > 0 ? (
            <img
              src={getFullImageUrl(post.imageUrls[0])}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No Image
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow overflow-hidden">
          {/* Title */}
          <h2 className="text-lg font-bold truncate">{post.title}</h2>

          {/* Description */}
          <p className="text-gray-300 text-sm mt-2 overflow-auto h-[60px]">
            {post.description}
          </p>

          {/* Username and Date */}
          <div className="flex justify-between items-center text-sm mt-2">
            <p className="text-teal-400 truncate">
              <span 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/profile/${post.userId}`;
                }}
                className="hover:underline cursor-pointer"
              >
                {username}
              </span>
            </p>
            <p className="text-gray-400">
              {post.createdAt && formatDate(post.createdAt)}
            </p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Votes and Comments */}
          <div className="flex justify-between items-center mt-auto px-4 pb-4">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={`font-bold text-base ${
                post.votes > 0 ? 'text-teal-400' : 
                post.votes < 0 ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                {formatVotes(post.votes)}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-400 font-bold text-base">
                {commentCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
