"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import postService from "../../../services/postService"
import commentService from "../../../services/commentService"
import { useUser } from "../../../context/UserContext"
import Link from "next/link"
import axiosInstance from "../../../services/axiosInstance"
import { getFullImageUrl } from "../../../utils/urlHelper"
import LoginModal from "../../../components/LoginModal"
import EnhancedCommentForm from "../../../components/EnhancedCommentForm"
import CommentDisplay from "../../../components/CommentDisplay"
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Reply,
  Info,
  HelpCircle,
  AlertCircle,
  Calendar,
  Tag,
  ChevronDown,
  Maximize,
} from "lucide-react"

export default function DetailedPostPage() {
  const router = useRouter()
  const { id } = useParams()
  const { user } = useUser()

  const [post, setPost] = useState(null)
  const [username, setUsername] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [error, setError] = useState("")
  const [comments, setComments] = useState([])
  const [userVote, setUserVote] = useState(null)
  const [userCommentVotes, setUserCommentVotes] = useState({})
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activePartIndex, setActivePartIndex] = useState(0)
  const [tagDetails, setTagDetails] = useState({})
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [loginWarning, setLoginWarning] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [showAttributeInfo, setShowAttributeInfo] = useState(null)
  const [commentSortBy, setCommentSortBy] = useState("newest")
  const [showCommentGuidelines, setShowCommentGuidelines] = useState(false)
  const [expandedComments, setExpandedComments] = useState([])
  const [fullscreenImageUrls, setFullscreenImageUrls] = useState([])
  const [fullscreenSource, setFullscreenSource] = useState('post') // 'post' or 'comment'

  useEffect(() => {
    if (user) {
      const fetchUserVote = async () => {
        try {
          const currentUserVote = await postService.getUserVote(id, user.id)
          setUserVote(currentUserVote)
        } catch (error) {
          console.error("Error fetching user vote:", error)
        }
      }
      fetchUserVote()
    }
  }, [id, user])

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const fetchedPost = await postService.getPostById(id)

        // Debug parts data
        console.log("Parts data received:", fetchedPost.parts)
        
        // Ensure parts is always an array
        if (fetchedPost.parts === null || fetchedPost.parts === undefined) {
          fetchedPost.parts = []
        }
        
        // Add debug indicator to show parts array length
        console.log(`Post has ${fetchedPost.parts.length} parts`)
        
        // Log the first part if available for debugging
        if (fetchedPost.parts && fetchedPost.parts.length > 0) {
          console.log("First part data:", fetchedPost.parts[0])
        }

        setPost(fetchedPost)

        const userRes = await axiosInstance.get(`/users/${fetchedPost.userId}`)
        const userData = userRes.data
        setUsername(userData.username)
        setProfilePicture(getFullImageUrl(userData.profilePictureUrl))

        const fetchedComments = await commentService.getCommentsByPostId(id)
        const commentsWithUserData = await Promise.all(
          fetchedComments.map(async (comment) => {
            try {
              const userRes = await axiosInstance.get(`/users/${comment.userId}`)
              const userData = userRes.data
              return {
                ...comment,
                commenterUsername: userData.username,
                profilePicture: getFullImageUrl(userData.profilePictureUrl),
              }
            } catch (error) {
              return {
                ...comment,
                commenterUsername: "Unknown User",
                profilePicture: "https://www.gravatar.com/avatar/default?d=mp",
              }
            }
          }),
        )
        setComments(commentsWithUserData)
        
        // If user is logged in, initialize vote map from localStorage
        if (user) {
          try {
            // Use the exact same key format as in handleVoteComment
            const storageKey = `commentVotes_${user.id}_${id}`;
            let savedVoteState = {};
            
            try {
              const savedData = localStorage.getItem(storageKey);
              if (savedData) {
                savedVoteState = JSON.parse(savedData);
                console.log(`Loaded vote state from localStorage (key: ${storageKey}):`, savedVoteState);
              } else {
                console.log(`No saved vote state found in localStorage for key: ${storageKey}`);
              }
            } catch (err) {
              console.error('Error parsing saved vote state from localStorage:', err);
            }
            
            // Set the vote state from localStorage or initialize empty
            setUserCommentVotes(savedVoteState);
          } catch (error) {
            console.error("Error loading saved votes:", error);
            // Initialize empty vote state as fallback
            const emptyVoteMap = {};
            commentsWithUserData.forEach(comment => {
              emptyVoteMap[comment.id] = null;
            });
            setUserCommentVotes(emptyVoteMap);
          }
        }
      } catch (error) {
        console.error("Error:", error)
        setError("Failed to load post and comments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPostAndComments()
  }, [id, user])

  useEffect(() => {
    const fetchTagDetails = async () => {
      if (post?.tags) {
        const details = {}
        for (const tag of post.tags) {
          try {
            const tagInfo = await postService.getTagDetails(tag)
            if (tagInfo && tagInfo.length > 0) {
              details[tag] = tagInfo[0]
            }
          } catch (error) {
            console.error(`Error fetching details for tag ${tag}:`, error)
          }
        }
        setTagDetails(details)
      }
    }

    fetchTagDetails()
  }, [post?.tags])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest(".menu-container")) {
        setShowMenu(false)
      }

      if (showAttributeInfo && !event.target.closest(".attribute-info")) {
        setShowAttributeInfo(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu, showAttributeInfo])

  const handleVote = async (voteType) => {
    if (!user) {
      setLoginWarning(true)
      setTimeout(() => setLoginWarning(false), 3000)
      return
    }

    try {
      const updatedPost = await postService.votePost(post.id, user.id, voteType)
      setPost(updatedPost)
      const newUserVote = await postService.getUserVote(post.id, user.id)
      setUserVote(newUserVote)
    } catch (error) {
      console.error(`Error ${voteType}ing post:`, error)
    }
  }

  const handleCommentSubmit = async (commentData, images = []) => {
    if (!commentData.text.trim() && images.length === 0) {
      setError("Comment cannot be empty.")
      return
    }

    if (!user) {
      setShowLoginModal(true)
      return
    }

    // First upload any images and get their URLs
    let imageUrls = []
    if (images && images.length > 0) {
      try {
        console.log('Uploading images, count:', images.length);
        
        const formData = new FormData()
        images.forEach((image, index) => {
          console.log(`Adding image ${index} to form:`, image.name, image.type, image.size);
          formData.append('images', image)
        });
        
        const uploadResponse = await axiosInstance.post('/uploads/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        if (uploadResponse.data && Array.isArray(uploadResponse.data)) {
          // These are the raw image filenames returned from the server
          const rawImageFiles = uploadResponse.data;
          console.log('Raw image filenames from server:', rawImageFiles);
          
          // We need to convert these to properly formatted image URLs
          imageUrls = rawImageFiles.map(filename => `/uploads/${filename}`);
          console.log('Formatted image URLs for comment:', imageUrls);
        } else {
          console.error('Image upload response is not in expected format:', uploadResponse.data);
          setError('Received unexpected response format from image upload service');
          return;
        }
      } catch (error) {
        console.error('Error uploading images:', error);
        console.error('Error response:', error.response?.data);
        setError('Failed to upload images. Please try again.');
        return
      }
    }

    const fullCommentData = {
      text: commentData.text.trim(),
      userId: user.id,
      username: user.username,
      postId: Number.parseInt(post.id),
      parentCommentId: commentData.parentCommentId || null,
      commentType: commentData.commentType || 'GENERAL',
      confidenceLevel: commentData.confidenceLevel || null,
      referenceLinks: commentData.referenceLinks || [],
      imageUrls: imageUrls
    }

    console.log('Submitting comment with data:', fullCommentData)

    try {
      const comment = await commentService.addComment(fullCommentData)
      console.log('Comment added successfully:', comment)
      
      const newComment = {
        ...comment,
        commenterUsername: user.username,
        profilePicture: user.profilePicture || "https://www.gravatar.com/avatar/default?d=mp",
      }

      setComments((prev) => [...prev, newComment])

      if (fullCommentData.parentCommentId) {
        setReplyingTo(null)
        setReplyText("")
      } else {
        setNewComment("")
      }
      
      // Check if the comment was saved but images were not processed
      if (imageUrls.length > 0 && (!comment.imageUrls || comment.imageUrls.length === 0)) {
        setError("Your comment was posted, but we couldn't process the images. You may need to edit your comment to add the images again.");
      } else {
        // Clear any previous errors
        setError("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      if (error.response?.data?.message) {
        setError(`Failed to submit comment: ${error.response.data.message}`);
      } else {
        setError("Failed to submit comment. Please try again.")
      }
    }
  }

  const handleImageClick = () => {
    setFullscreenImageUrls(post.imageUrls.map(url => getFullImageUrl(url)))
    setFullscreenSource('post')
    setCurrentImageIndex(0)
    setIsFullscreen(true)
  }
  
  const handleCommentImageClick = (commentImageUrls, startIndex = 0) => {
    setFullscreenImageUrls(commentImageUrls.map(url => getFullImageUrl(url)))
    setFullscreenSource('comment')
    setCurrentImageIndex(startIndex)
    setIsFullscreen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  const handleMarkSolution = async (commentId) => {
    if (!user || user.id !== post.userId) {
      return
    }

    try {
      const isRemoving = commentId === post.solutionCommentId
      const updatedPost = await commentService.toggleSolution(post.id, commentId, isRemoving)
      setPost(updatedPost)
    } catch (error) {
      console.error("Error marking solution:", error)
    }
  }

  const handleDeletePost = async () => {
    if (!user || user.id !== post?.userId) {
      return
    }

    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await postService.deletePost(id)
        router.push("/")
      } catch (error) {
        console.error("Error deleting post:", error)
        if (error.response?.status === 403) {
          setError("You are not authorized to delete this post.")
        } else {
          setError("Failed to delete post. Please try again.")
        }
      }
    }
  }

  const handleEditPost = () => {
    router.push(`/create-post?edit=${post.id}`)
  }

  const toggleExpandComment = (commentId) => {
    setExpandedComments((prev) =>
      prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId],
    )
  }

  const nextImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === post.imageUrls.length - 1 ? 0 : prev + 1))
  }

  const previousImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? post.imageUrls.length - 1 : prev - 1))
  }

  const handleFullscreenNext = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === fullscreenImageUrls.length - 1 ? 0 : prev + 1))
  }

  const handleFullscreenPrevious = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? fullscreenImageUrls.length - 1 : prev - 1))
  }

  const handleVoteComment = async (commentId, isUpvote = true) => {
    if (!user) {
      setLoginWarning(true)
      setTimeout(() => setLoginWarning(false), 3000)
      return
    }

    try {
      // Get current vote state for this comment
      const currentVote = userCommentVotes[commentId] || null
      console.log(`Current vote state for comment ${commentId}: ${currentVote}, attempting to ${isUpvote ? 'upvote' : 'downvote'}`);
      
      // Determine if this is a toggle (clicking same button twice)
      const isToggle = isUpvote ? currentVote === 'upvote' : currentVote === 'downvote'
      console.log(`Is toggle? ${isToggle} (${currentVote} vs ${isUpvote ? 'upvote' : 'downvote'})`);
      
      // Calculate the new vote state
      const newVoteStatus = isToggle ? null : (isUpvote ? 'upvote' : 'downvote');
      
      // Call API to update vote
      const updatedComment = isUpvote 
        ? await commentService.upvoteComment(commentId, user.id)
        : await commentService.downvoteComment(commentId, user.id);
      
      console.log(`Comment ${isUpvote ? 'upvoted' : 'downvoted'} successfully:`, updatedComment);
      
      // Update the comment in the state to reflect the new vote count
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, votes: updatedComment.votes } : comment
      ));
      
      // Update the UI state after the API call
      setUserCommentVotes(prev => {
        const updated = {
          ...prev,
          [commentId]: newVoteStatus
        };
        console.log(`Updated vote map for comment ${commentId} to:`, newVoteStatus);
        
        // Store the ENTIRE vote state in localStorage - this ensures consistency
        if (user) {
          try {
            const storageKey = `commentVotes_${user.id}_${id}`;
            localStorage.setItem(storageKey, JSON.stringify(updated));
            console.log(`Saved vote state to localStorage with key ${storageKey}:`, updated);
          } catch (err) {
            console.error('Error saving vote state to localStorage:', err);
          }
        }
        
        return updated;
      });
    } catch (error) {
      console.error(`Error ${isUpvote ? 'upvoting' : 'downvoting'} comment:`, error);
    }
  }

  const renderComment = (comment, level = 0) => {
    const replies = comments.filter((c) => c.parentCommentId === comment.id)
    const isSolution = comment.id === post.solutionCommentId
    const isExpanded = expandedComments.includes(comment.id)
    const userVoteOnComment = userCommentVotes[comment.id] || null
    
    // Debug the vote state
    console.log(`Rendering comment ${comment.id} with vote state: ${userVoteOnComment}`);

    return (
      <div key={`comment-content-${comment.id}`} className={`${level > 0 ? "pl-6 border-l border-gray-700" : ""} mb-4`}>
        <CommentDisplay
          comment={comment}
          isReply={level > 0}
          isExpanded={isExpanded}
          onReply={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          onMarkSolution={() => handleMarkSolution(comment.id)}
          onUpvote={() => handleVoteComment(comment.id, true)}
          onDownvote={() => handleVoteComment(comment.id, false)}
          onToggleExpand={() => toggleExpandComment(comment.id)}
          currentPostUserId={post.userId}
          isSolution={isSolution}
          userVoteStatus={userVoteOnComment}
          onImageClick={(imageIndex) => {
            if (comment.imageUrls && comment.imageUrls.length > 0) {
              handleCommentImageClick(comment.imageUrls, imageIndex);
            }
          }}
        />

        {replyingTo === comment.id && (
          <div className="mt-3 ml-6">
            <EnhancedCommentForm
              onSubmit={(commentData, images) => 
                handleCommentSubmit({...commentData, parentCommentId: comment.id}, images)
              }
              isReply={true}
              user={user}
              initialText=""
            />
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-2 ml-6">
            <button
              onClick={() => toggleExpandComment(comment.id)}
              className="text-xs text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-1 mb-2"
            >
              <MessageSquare className="h-3 w-3" />
              {replies.length} {replies.length === 1 ? "reply" : "replies"} {isExpanded ? "(hide)" : "(show)"}
            </button>

            {isExpanded && (
              <div className="mt-2 space-y-4">
                {replies.map((reply) => renderComment(reply, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-teal-300 text-center text-xl mt-10">Loading...</div>
  }

  if (!post) {
    return <div className="text-center mt-10 text-red-500">Post not found.</div>
  }

  const getAttributeDescription = (key) => {
    const descriptions = {
      material: "The primary material the item is made from. This can help identify the era, origin, and value.",
      origin: "The country or region where the item was likely manufactured or created.",
      period: "The historical period or era when the item was likely created.",
      condition: "The current physical state of the item, from mint/perfect to poor/damaged.",
      markings: "Any stamps, signatures, or other identifying marks on the item.",
      patina: "The surface appearance that develops with age, especially on metal, wood, or leather items.",
      provenance: "The documented history of ownership, which can add to authenticity and value.",
      style: "The artistic or design style that characterizes the item.",
      technique: "The method used to create or manufacture the item.",
      age: "The approximate age or date of creation of the item.",
      pattern: "Repeated or regular arrangement of shapes, colors, numbers, or behaviors that can be recognized and sometimes predicted.",
      brand:"A brand is the identity of a company or product, represented by a name, logo, design, or reputation that distinguishes it from others in the market.",
      color: "Color is the visual perception of different wavelengths of light, described using terms like red, blue, green, and so on.",
      print: "Print of the object.",
      icon:"Small image or symbol.",
      shape:"Form or outline of an object, defined by its boundaries, such as circles, squares, or triangles etc...",
      hardness:"Measure of how resistant a material is.",
      functionality: "Tasks or operations performed by/with the object.",
      taste:"Sense that allows us to detect flavors like sweet, sour, salty, bitter, and umami through our tongue.",
      smell:"Sense that allows us to detect and recognize odors through our nose.",
      Price:"Value of object in US dollars",
      location:"Location of the object",
      texture:"How the surface of an object feels or looks, such as smooth, rough, soft, or bumpy.",
      timeperiod:"Specific duration of time in which the object made",
      textandlanguage:"Written text on the abject and language"





    }

    return descriptions[key.toLowerCase()] || "Additional information about this attribute."
  }

  const renderAttributes = () => {
    const excludedKeys = [
      "id",
      "userId",
      "title",
      "description",
      "imageUrls",
      "tags",
      "votes",
      "comments",
      "_links",
      "size",
      "sizeValue",
      "sizeUnit",
      "widthValue",
      "widthUnit",
      "heightValue",
      "heightUnit",
      "depthValue",
      "depthUnit",
      "parts",
      "weight",
      "weightValue",
      "weightUnit",
      "solutionCommentId",
      "isSolved",
      "solved",
      "createdAt",
    ]

    // Group attributes into categories
    const categories = {
      "Physical Characteristics": ["material", "color", "patina", "texture", "finish", "condition"],
      Dimensions: ["widthValue", "heightValue", "depthValue", "weightValue"],
      "Origin & History": ["origin", "period", "age", "style", "provenance"],
      Identification: ["markings", "signature", "hallmarks", "inscriptions", "serial"],
      "Other Details": [],
    }

    const categorizedAttributes = {}

    // Initialize categories
    Object.keys(categories).forEach((category) => {
      categorizedAttributes[category] = []
    })

    // Categorize attributes
    Object.entries(post)
      .filter(
        ([key, value]) =>
          !excludedKeys.includes(key) &&
          value &&
          value.toString().trim() !== "" &&
          value !== "null" &&
          value !== "undefined",
      )
      .forEach(([key, value]) => {
        let placed = false

        // Check if attribute belongs to a specific category
        Object.entries(categories).forEach(([category, attributes]) => {
          if (attributes.some((attr) => key.toLowerCase().includes(attr.toLowerCase()))) {
            categorizedAttributes[category].push([key, value])
            placed = true
          }
        })

        // If not placed in any category, put in "Other Details"
        if (!placed) {
          categorizedAttributes["Other Details"].push([key, value])
        }
      })

    return (
      <div className="space-y-4">
        {/* Dimensions Section */}
        {(post.widthValue || post.heightValue || post.depthValue) && (
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 mb-4">
            <h3 className="text-lg font-semibold mb-3 text-teal-400">Dimensions</h3>
            <div className="flex flex-wrap gap-2 items-center">
              {post.widthValue && (
                <div className="bg-gray-750 px-4 py-3 rounded-lg">
                  <span className="text-gray-400 text-sm block">Width</span>
                  <span className="text-white font-medium text-base">
                    {post.widthValue}
                    {post.widthUnit}
                  </span>
                </div>
              )}
              {post.heightValue && (
                <div className="bg-gray-750 px-4 py-3 rounded-lg">
                  <span className="text-gray-400 text-sm block">Height</span>
                  <span className="text-white font-medium text-base">
                    {post.heightValue}
                    {post.heightUnit}
                  </span>
                </div>
              )}
              {post.depthValue && (
                <div className="bg-gray-750 px-4 py-3 rounded-lg">
                  <span className="text-gray-400 text-sm block">Depth</span>
                  <span className="text-white font-medium text-base">
                    {post.depthValue}
                    {post.depthUnit}
                  </span>
                </div>
              )}
              {post.weightValue && post.weightValue.trim() !== "" && (
                <div className="bg-gray-750 px-4 py-3 rounded-lg">
                  <span className="text-gray-400 text-sm block">Weight</span>
                  <span className="text-white font-medium text-base">
                    {post.weightValue}
                    {post.weightUnit}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Render each category */}
        {Object.entries(categorizedAttributes).map(([category, attributes]) => {
          if (attributes.length === 0) return null

          return (
            <div key={category} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 mb-4">
              <h3 className="text-lg font-semibold mb-3 text-teal-400">{category}</h3>
              <div className="space-y-2">
                {attributes.map(([key, value]) => (
                  <div key={key} className="flex items-start mb-2">
                    <div className="w-2/5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 font-medium text-sm md:text-base">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <button
                          className="text-gray-400 hover:text-teal-400 attribute-info"
                          onClick={() => setShowAttributeInfo(key)}
                        >
                          <Info className="h-4 w-4" />
                        </button>

                        {showAttributeInfo === key && (
                          <div className="absolute z-10 mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg max-w-xs text-sm text-gray-300 attribute-info">
                            {getAttributeDescription(key)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-3/5">
                      <span className="text-white text-sm md:text-base">
                        {typeof value === "boolean" ? (value ? "Yes" : "No") : value.toString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const formatVotes = (votes) => {
    if (votes === 0) return "0"
    return votes > 0 ? `+${votes}` : `${votes}`
  }

  const renderPartAttribute = (part, key, value) => {
    if (key.endsWith("Value")) {
      const dimensionType = key.replace("Value", "")
      const unitValue = part[`${dimensionType}Unit`]
      if (unitValue) {
        return `${value} ${unitValue}`
      }
    }
    return typeof value === "boolean" ? (value ? "Yes" : "No") : value
  }

  // Add dedicated function to debug and render parts
  const renderPartsSection = () => {
    console.log("Rendering parts section with parts:", post.parts);
    
    // Safety check - return early with message if no parts data
    if (!post.parts || !Array.isArray(post.parts) || post.parts.length === 0) {
      return (
        <div className="no-data-message text-center py-8">
          <div className="text-gray-400 text-base mb-2">No parts information available</div>
          <p className="text-gray-500 text-sm">This item doesn't have any parts information added.</p>
        </div>
      );
    }
    
    // We have parts data, render it properly
    return (
      <>
        <div className="flex overflow-x-auto scrollbar-hide mb-3 -mx-3 px-3 border-b border-gray-700">
          {post.parts.map((part, index) => {
            // Debug part names
            console.log(`Part ${index} name:`, part.partName);
            
            return (
              <button
                key={index}
                onClick={() => setActivePartIndex(index)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  activePartIndex === index
                    ? "text-teal-400 border-b-2 border-teal-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {part.partName || `Part ${index + 1}`}
              </button>
            );
          })}
        </div>

        {/* Active Part Content */}
        {post.parts[activePartIndex] && (
          <div className="space-y-3">
            {Object.entries(post.parts[activePartIndex])
              .filter(
                ([key, value]) =>
                  !key.endsWith("Unit") &&
                  key !== "id" &&
                  key !== "partName" &&
                  value &&
                  value.toString().trim() !== "" &&
                  value !== "null" &&
                  value !== "undefined",
              )
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start border-b border-gray-700/50 last:border-0 py-2"
                >
                  <div className="w-2/5 p-2 bg-gray-800/50">
                    <span className="text-gray-300 text-sm">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </div>
                  <div className="w-3/5 p-2">
                    <span className="text-white text-sm">
                      {renderPartAttribute(post.parts[activePartIndex], key, value)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </>
    );
  };

  const sortComments = (comments) => {
    const rootComments = comments.filter((comment) => !comment.parentCommentId)

    // Always put solution first regardless of sort method
    return rootComments.sort((a, b) => {
      // Solution comments always come first
      if (a.id === post.solutionCommentId) return -1;
      if (b.id === post.solutionCommentId) return 1;
      
      // Then apply the selected sorting method
      switch (commentSortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt)
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    });
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* First column - Title, Description, Details */}
          <div className="lg:col-span-3 order-1">
            {/* Header Section */}
            <div className="bg-gray-800 rounded-lg p-5 mb-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={profilePicture || "/placeholder.svg"}
                    alt={`${username}'s profile`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      href={`/profile/${post.userId}`}
                      className="text-teal-400 font-medium hover:underline text-base"
                    >
                      {username || "Unknown User"}
                    </Link>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote("upvote")}
                    className={`p-1 rounded-md ${
                      userVote === "upvote"
                        ? "bg-teal-600 text-white"
                        : "bg-gray-700 hover:bg-teal-500 text-teal-400 hover:text-white"
                    }`}
                    aria-label="Upvote"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>

                  <span
                    className={`font-medium text-sm ${
                      post.votes > 0 ? "text-teal-400" : post.votes < 0 ? "text-red-400" : "text-gray-400"
                    }`}
                  >
                    {formatVotes(post.votes)}
                  </span>

                  <button
                    onClick={() => handleVote("downvote")}
                    className={`p-1 rounded-md ${
                      userVote === "downvote"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 hover:bg-red-500 text-red-400 hover:text-white"
                    }`}
                    aria-label="Downvote"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>

                  {user && user.id === post?.userId && (
                    <div className="relative menu-container ml-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowMenu(!showMenu)
                        }}
                        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Post options"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-400 hover:text-white" />
                      </button>

                      {showMenu && (
                        <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowMenu(false)
                                handleEditPost()
                              }}
                              className="w-full text-left px-3 py-1 text-xs text-gray-100 hover:bg-gray-700 flex items-center gap-2"
                              role="menuitem"
                            >
                              <Edit className="h-3 w-3" />
                              Edit Post
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowMenu(false)
                                handleDeletePost()
                              }}
                              className="w-full text-left px-3 py-1 text-xs text-red-400 hover:bg-gray-700 flex items-center gap-2"
                              role="menuitem"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
                {post.title}
                {post.isSolved && (
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-normal">
                    Solved
                  </span>
                )}
              </h1>

              <p className="text-gray-300 mb-5 text-base leading-relaxed">
                {post.description}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.tags.map((tag, index) => {
                    const tagInfo = tagDetails[tag]
                    return (
                      <div key={`tag-${index}`} className="relative group">
                        <a
                          href={tagInfo?.wikipediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`bg-gray-700 text-teal-400 px-2 py-0.5 rounded-full text-xs 
                            hover:bg-gray-600 transition-colors inline-flex items-center gap-1
                            ${!tagInfo ? "opacity-50" : "cursor-pointer"}`}
                        >
                          {tagInfo?.label || tag}
                          {!tagInfo && (
                            <div className="w-2 h-2 border-t-2 border-teal-400 animate-spin rounded-full"></div>
                          )}
                        </a>
                        {tagInfo?.description && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg shadow-lg w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            {tagInfo.description}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="bg-gray-800 rounded-lg shadow-lg sticky top-4">
              {/* Main Tabs */}
              <div className="flex border-b border-gray-700">
                <button
                  className={`flex-1 py-4 text-base font-medium ${
                    activeTab === "details"
                      ? "text-teal-400 border-b-2 border-teal-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
                {post.parts && Array.isArray(post.parts) && post.parts.length > 0 ? (
                  <button
                    className={`flex-1 py-4 text-base font-medium ${
                      activeTab === "parts"
                        ? "text-teal-400 border-b-2 border-teal-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveTab("parts")}
                  >
                    Parts ({post.parts.length})
                  </button>
                ) : null}
              </div>

              {/* Content Area */}
              <div className="p-5">
                {activeTab === "details" ? (
                  <div>{renderAttributes()}</div>
                ) : (
                  <div>
                    {renderPartsSection()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Second column - Images */}
          <div className="lg:col-span-4 order-2">
            {/* Item Images */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                {/* Vertical stacked images */}
                <div className="flex flex-col gap-4 p-4">
                  {post.imageUrls.map((url, index) => (
                    <div 
                      key={index} 
                      className="relative group cursor-zoom-in"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        handleImageClick();
                      }}
                      role="button"
                      aria-label="View full size image"
                      tabIndex={0}
                    >
                      <img
                        src={getFullImageUrl(url) || "/placeholder.svg"}
                        alt={`Post Image ${index + 1}`}
                        className="w-full object-contain bg-gray-900 p-2 rounded-lg"
                      />
                      <div className="absolute bottom-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        {index + 1} / {post.imageUrls.length}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none">
                        <Maximize className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Third column - Enhanced Comment Section */}
          <div className="lg:col-span-5 order-3">
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-1">
                  <MessageSquare className="h-5 w-5 text-teal-400" />
                  Discussion ({comments.length})
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <select
                    value={commentSortBy}
                    onChange={(e) => setCommentSortBy(e.target.value)}
                    className="bg-gray-700 text-white text-sm rounded-md px-3 py-1 border-0 focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="solution">Solution first</option>
                  </select>
                </div>
              </div>

              {/* SOLUTION DISPLAY - Golden framed section above comments */}
              {post.solutionCommentId && comments.some(c => c.id === post.solutionCommentId) && (
                <div className="p-4 bg-gradient-to-r from-amber-900/30 via-yellow-800/20 to-amber-900/30 border-t-2 border-b-2 border-yellow-500/70">
                  <div className="text-center mb-2">
                    <h2 className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-2">
                      <CheckCircle className="h-6 w-6" />
                      THIS IS:
                    </h2>
                    <div className="h-1 w-32 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 mx-auto mt-1 rounded-full"></div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-900/20 to-amber-800/10 p-4 rounded-lg border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    {comments.filter(c => c.id === post.solutionCommentId).map(comment => (
                      <div key={`solution-display-${comment.id}`}>
                        {renderComment(comment)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment Guidelines */}
              <div className="border-b border-gray-700 bg-gray-750/50">
                <button
                  onClick={() => setShowCommentGuidelines(!showCommentGuidelines)}
                  className="w-full p-2 text-left flex items-center justify-between text-teal-400 hover:text-teal-300"
                >
                  <span className="font-medium flex items-center gap-1 text-sm">
                    <Info className="h-3 w-3" />
                    Tips for helpful identification comments
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${showCommentGuidelines ? "rotate-180" : ""}`}
                  />
                </button>

                {showCommentGuidelines && (
                  <div className="p-3 text-sm text-gray-300 space-y-1">
                    <p>To help identify this item, consider including:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Specific details about similar items you've seen</li>
                      <li>Historical context or time period information</li>
                      <li>Possible uses or functions of the item</li>
                      <li>References to markings, styles, or manufacturing techniques</li>
                      <li>Links to similar items or reference materials (if available)</li>
                    </ul>
                    <p>The more specific your observations, the more helpful they'll be!</p>
                  </div>
                )}
              </div>

              {/* Comment Input */}
              {user ? (
                <div className="p-3 border-b border-gray-700 bg-gray-750">
                  <EnhancedCommentForm 
                    onSubmit={handleCommentSubmit}
                    user={user}
                    initialText=""
                  />
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-750">
                  <p className="text-gray-400 text-sm mb-2">You must be logged in to comment.</p>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Login to Comment
                  </button>
                </div>
              )}

              {/* Comments List - Now excluding solution comment */}
              <div className="divide-y divide-gray-700 max-h-[800px] overflow-y-auto">
                {sortComments(comments)
                  .filter(comment => comment.id !== post.solutionCommentId) // Remove solution from regular comments list
                  .map((comment) => (
                    <div key={`comment-${comment.id}`} className="p-4">
                      {renderComment(comment)}
                    </div>
                  ))}

                {comments.filter((comment) => !comment.parentCommentId).length === 0 && (
                  <div className="p-6 text-center">
                    <div className="text-gray-400 text-sm mb-2">No comments yet</div>
                    <p className="text-sm text-gray-500">Be the first to share your knowledge about this item!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={closeFullscreen}>
            <button className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2 bg-black/40 rounded-full backdrop-blur-sm" onClick={closeFullscreen}>
              <X className="h-8 w-8" />
            </button>

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={fullscreenImageUrls[currentImageIndex] || "/placeholder.svg"}
                alt="Fullscreen view"
                className="max-w-[95vw] max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {fullscreenImageUrls.length > 1 && (
                <>
                  {/* Navigation Arrows */}
                  <button
                    onClick={handleFullscreenPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-4 rounded-full backdrop-blur-sm transition-all"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={handleFullscreenNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-4 rounded-full backdrop-blur-sm transition-all"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-8 right-8 bg-black/50 text-white px-4 py-2 rounded-lg text-base backdrop-blur-sm">
                    {currentImageIndex + 1} / {fullscreenImageUrls.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {loginWarning && (
          <div
            className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg animate-fade-in cursor-pointer"
            onClick={() => setShowLoginModal(true)}
          >
            Click here to login to vote
          </div>
        )}
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </div>
    </div>
  )
}
