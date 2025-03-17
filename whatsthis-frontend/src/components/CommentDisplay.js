import React from 'react';
import { useUser } from '../context/UserContext';
import { COMMENT_TYPES, CONFIDENCE_LEVELS } from '../services/commentService';
import { 
  MessageSquare, 
  Reply, 
  CheckCircle, 
  ThumbsUp, 
  ThumbsDown,
  Info, 
  AlertCircle, 
  HelpCircle,
  Link as LinkIcon,
  Calendar,
  Award,
  Maximize
} from 'lucide-react';
import { getFullImageUrl } from '../utils/urlHelper';

const CommentDisplay = ({ 
  comment, 
  isReply = false, 
  isExpanded = false,
  onReply, 
  onMarkSolution,
  onUpvote,
  onDownvote,
  onToggleExpand,
  currentPostUserId,
  isSolution = false,
  userVoteStatus = null,
  onImageClick
}) => {
  const { user } = useUser();
  
  // Format the date
  const formattedDate = comment.createdAt 
    ? new Date(comment.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  // Helper to render the appropriate icon for comment type
  const renderTypeIcon = () => {
    switch(comment.commentType) {
      case COMMENT_TYPES.IDENTIFICATION:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case COMMENT_TYPES.ADDITIONAL_INFO:
        return <Info className="h-4 w-4 text-teal-500" />;
      case COMMENT_TYPES.CORRECTION:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case COMMENT_TYPES.REQUEST_INFO:
        return <HelpCircle className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  // Helper to render confidence badge
  const renderConfidenceBadge = () => {
    if (!comment.confidenceLevel || comment.commentType !== COMMENT_TYPES.IDENTIFICATION) return null;
    
    let color, label;
    switch(comment.confidenceLevel) {
      case CONFIDENCE_LEVELS.MAYBE:
        color = "bg-yellow-500/20 text-yellow-400";
        label = "Maybe";
        break;
      case CONFIDENCE_LEVELS.LIKELY:
        color = "bg-blue-500/20 text-blue-400";
        label = "Likely";
        break;
      case CONFIDENCE_LEVELS.VERY_CONFIDENT:
        color = "bg-green-500/20 text-green-400";
        label = "Very Confident";
        break;
      default:
        return null;
    }
    
    return (
      <span className={`${color} px-2 py-0.5 rounded-full text-xs flex items-center gap-1`}>
        {label}
      </span>
    );
  };

  return (
    <div className={`${isReply ? 'ml-6' : ''} ${isSolution ? 'relative' : ''}`}>
      {/* Solution badge - simpler now since the main solution display is handled elsewhere */}
      {isSolution && (
        <div className="absolute -top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold z-10 flex items-center gap-1 shadow-md">
          <CheckCircle className="h-3 w-3" />
          Solution
        </div>
      )}
      
      <div className="flex gap-3">
        <img
          src={comment.profilePicture || "/placeholder.svg"}
          alt={`${comment.commenterUsername}'s profile`}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div
            className={`bg-gray-750 rounded-lg p-3 ${
              isSolution ? "border border-green-500/40 bg-green-500/5" : ""
            }`}
          >
            {/* Header with username, badges, and date */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  {comment.isExpertOpinion && (
                    <Award className="h-4 w-4 text-amber-400" />
                  )}
                  <a href={`/profile/${comment.userId}`} className={`font-medium hover:underline ${isSolution ? 'text-green-400' : 'text-teal-400'}`}>
                    {comment.commenterUsername}
                  </a>
                </div>
                
                {/* Display comment type badge */}
                {comment.commentType && comment.commentType !== COMMENT_TYPES.GENERAL && (
                  <div className="flex items-center gap-1 bg-gray-700 px-2 py-0.5 rounded-full">
                    {renderTypeIcon()}
                    <span className="text-xs text-white">
                      {comment.commentType.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </span>
                  </div>
                )}
                
                {/* Display confidence level for identifications */}
                {renderConfidenceBadge()}
                
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>
            </div>
            
            {/* Comment content */}
            <p className={`text-sm mb-2 ${isSolution ? 'text-white' : 'text-gray-300'}`}>{comment.text}</p>
            
            {/* Reference links */}
            {comment.referenceLinks && comment.referenceLinks.length > 0 && (
              <div className="mt-2 space-y-1 p-2 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">References:</div>
                {comment.referenceLinks.map((link, index) => (
                  <div key={index} className="flex items-center">
                    <LinkIcon className="h-3 w-3 text-teal-400 mr-2" />
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-teal-400 hover:underline truncate"
                    >
                      {link}
                    </a>
                  </div>
                ))}
              </div>
            )}
            
            {/* Image Attachments */}
            {comment.imageUrls && comment.imageUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {comment.imageUrls.map((url, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square group"
                    onClick={() => onImageClick && onImageClick(index)}
                    role="button"
                    aria-label="View full size image"
                    tabIndex={0}
                  >
                    <img
                      src={getFullImageUrl(url)}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg cursor-zoom-in"
                      onError={(e) => {
                        console.log(`Error loading image: ${url}`);
                        e.target.src = "https://www.gravatar.com/avatar/default?d=mp";
                        e.target.className += " bg-gray-700 p-4";
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none">
                      <Maximize className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment actions */}
          <div className="mt-2 flex items-center flex-wrap gap-3 text-xs">
            {/* Voting buttons - now with visual indication of user's vote */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onUpvote(comment.id)} 
                className={`transition-colors p-1 rounded ${
                  userVoteStatus === 'upvote' 
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-400 hover:text-teal-400'
                }`}
                aria-label="Upvote comment"
              >
                <ThumbsUp className="h-3 w-3" />
              </button>
              
              <span className={`${
                comment.votes > 0 ? 'text-teal-400' : 
                comment.votes < 0 ? 'text-red-400' : 
                'text-gray-400'
              }`}>{comment.votes || 0}</span>
              
              <button 
                onClick={() => onDownvote(comment.id)} 
                className={`transition-colors p-1 rounded ${
                  userVoteStatus === 'downvote' 
                    ? 'bg-red-500 text-white'
                    : 'text-gray-400 hover:text-red-400'
                }`}
                aria-label="Downvote comment"
              >
                <ThumbsDown className="h-3 w-3" />
              </button>
            </div>

            {/* Reply button */}
            {user && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-1"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            )}
            
            {/* Mark as solution button (only visible to post owner and not already a solution) */}
            {user && user.id === currentPostUserId && !isSolution && (
              <button
                onClick={() => onMarkSolution(comment.id)}
                className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                Mark as Solution
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentDisplay; 