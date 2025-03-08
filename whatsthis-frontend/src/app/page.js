"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import postService from "../services/postService";
import PostCard from "../components/PostCard";
import { useUser } from "../context/UserContext";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useUser();
  const [sortBy, setSortBy] = useState("newest");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState(null);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    if (Object.values(searchParams).every(value => !value)) {
      setIsSearchMode(false);
      loadPosts(1, sortBy);
      return;
    }
    setIsSearchMode(true);
    setCurrentSearchParams(searchParams);
    try {
      const searchResults = await postService.searchPosts(searchParams);
      setPosts(searchResults._embedded?.postDtoes || searchResults);
    } catch (error) {
      console.error("Error searching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (page, sort = sortBy) => {
    setLoading(true);
    try {
      const response = await postService.getAllPosts(page, 12, sort);
      setPosts(response.posts);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSearchMode) {
      loadPosts(currentPage, sortBy);
    }
  }, [currentPage, sortBy, isSearchMode]);

  useEffect(() => {
    window._handleSearch = handleSearch;
    window._loadPosts = loadPosts;
    loadPosts(1, "newest");
    setSortBy("newest");
    return () => {
      delete window._handleSearch;
      delete window._loadPosts;
    };
  }, []);

  const PaginationControls = () => {
    if (isSearchMode) return null;
    
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-lg ${
            currentPage === 1
              ? "bg-gray-700 text-gray-500"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          Previous
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded-lg ${
              currentPage === page
                ? "bg-teal-500 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-lg ${
            currentPage === totalPages
              ? "bg-gray-700 text-gray-500"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="p-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSortBy("newest");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortBy === "newest"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => {
                  setSortBy("mostVoted");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortBy === "mostVoted"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Most Voted
              </button>
              <button
                onClick={() => {
                  setSortBy("solved");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortBy === "solved"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Solved
              </button>
              <button
                onClick={() => {
                  setSortBy("unsolved");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortBy === "unsolved"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Unsolved
              </button>
            </div>

            {user && (
              <Link href="create-post">
                <button className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition shadow-lg">
                  New Mystery
                </button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center">
              <div className="text-teal-300 text-xl">Loading...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <PaginationControls />
            </>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center mt-10">
              <h3 className="text-gray-500 text-lg">No posts found.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
