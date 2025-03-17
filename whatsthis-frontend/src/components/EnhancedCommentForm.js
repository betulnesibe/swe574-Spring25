import React, { useState } from 'react';
import { COMMENT_TYPES, CONFIDENCE_LEVELS } from '../services/commentService';
import { MessageSquare, Info, AlertCircle, HelpCircle, Link as LinkIcon } from 'lucide-react';

const EnhancedCommentForm = ({ onSubmit, isReply = false, user }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [commentType, setCommentType] = useState(COMMENT_TYPES.GENERAL);
  const [confidenceLevel, setConfidenceLevel] = useState(null);
  const [referenceLinks, setReferenceLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [error, setError] = useState('');
  const [showConfidenceSelector, setShowConfidenceSelector] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleAddLink = () => {
    if (!newLink.trim()) return;
    
    try {
      // Basic URL validation
      new URL(newLink);
      setReferenceLinks([...referenceLinks, newLink]);
      setNewLink('');
      setError('');
    } catch (e) {
      setError('Please enter a valid URL including http:// or https://');
    }
  };

  const handleRemoveLink = (index) => {
    setReferenceLinks(referenceLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) {
      setError('Please add text or an image to your comment');
      return;
    }

    // Only require confidence level for identification attempts
    if (commentType === COMMENT_TYPES.IDENTIFICATION && !confidenceLevel) {
      setError('Please select a confidence level for your identification');
      return;
    }

    const comment = {
      text,
      commentType,
      confidenceLevel: commentType === COMMENT_TYPES.IDENTIFICATION ? confidenceLevel : null,
      referenceLinks
    };

    await onSubmit(comment, images);
    
    // Reset form
    setText('');
    setImages([]);
    setPreviewUrls([]);
    setCommentType(COMMENT_TYPES.GENERAL);
    setConfidenceLevel(null);
    setReferenceLinks([]);
    setShowConfidenceSelector(false);
    setError('');
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleTypeChange = (type) => {
    setCommentType(type);
    setShowConfidenceSelector(type === COMMENT_TYPES.IDENTIFICATION);
    if (type !== COMMENT_TYPES.IDENTIFICATION) {
      setConfidenceLevel(null);
    }
  };

  // Comment type selector cards with appropriate icons
  const typeSelectors = [
    { 
      type: COMMENT_TYPES.IDENTIFICATION, 
      label: 'Identification', 
      icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
      description: 'I know what this item is'
    },
    { 
      type: COMMENT_TYPES.ADDITIONAL_INFO, 
      label: 'Additional Info', 
      icon: <Info className="h-4 w-4 text-teal-500" />,
      description: 'I have more context to add'
    },
    { 
      type: COMMENT_TYPES.CORRECTION, 
      label: 'Correction', 
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
      description: 'I disagree with an identification'
    },
    { 
      type: COMMENT_TYPES.REQUEST_INFO, 
      label: 'Request Info', 
      icon: <HelpCircle className="h-4 w-4 text-purple-500" />,
      description: 'I need more details'
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="mt-2 bg-gray-800 rounded-lg p-4 border border-gray-700">
      {/* Comment Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Comment Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {typeSelectors.map(selector => (
            <button
              key={selector.type}
              type="button"
              className={`p-2 rounded-lg text-left text-xs flex flex-col items-center justify-center h-20 transition-colors border ${
                commentType === selector.type 
                  ? 'bg-gray-700 border-teal-500' 
                  : 'bg-gray-750 border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => handleTypeChange(selector.type)}
            >
              <div className="flex items-center justify-center mb-1">
                {selector.icon}
                <span className="ml-1 font-medium">{selector.label}</span>
              </div>
              <p className="text-gray-400 text-center text-xs">{selector.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Confidence Level Selector (only for Identification comments) */}
      {showConfidenceSelector && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">How confident are you?</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 p-2 rounded-lg border text-center text-xs ${
                confidenceLevel === CONFIDENCE_LEVELS.MAYBE 
                  ? 'bg-gray-700 border-yellow-500 text-yellow-400' 
                  : 'bg-gray-750 border-gray-600 hover:border-gray-500 text-gray-300'
              }`}
              onClick={() => setConfidenceLevel(CONFIDENCE_LEVELS.MAYBE)}
            >
              Maybe
            </button>
            <button
              type="button"
              className={`flex-1 p-2 rounded-lg border text-center text-xs ${
                confidenceLevel === CONFIDENCE_LEVELS.LIKELY 
                  ? 'bg-gray-700 border-blue-500 text-blue-400' 
                  : 'bg-gray-750 border-gray-600 hover:border-gray-500 text-gray-300'
              }`}
              onClick={() => setConfidenceLevel(CONFIDENCE_LEVELS.LIKELY)}
            >
              Likely
            </button>
            <button
              type="button"
              className={`flex-1 p-2 rounded-lg border text-center text-xs ${
                confidenceLevel === CONFIDENCE_LEVELS.VERY_CONFIDENT 
                  ? 'bg-gray-700 border-green-500 text-green-400' 
                  : 'bg-gray-750 border-gray-600 hover:border-gray-500 text-gray-300'
              }`}
              onClick={() => setConfidenceLevel(CONFIDENCE_LEVELS.VERY_CONFIDENT)}
            >
              Very Confident
            </button>
          </div>
        </div>
      )}

      {/* Comment Text Area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isReply ? "Write a reply..." : "Share your knowledge about this item..."}
        className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 mb-3"
        rows={3}
      />

      {/* Reference Links */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-300 mb-2">Add Reference Links</label>
        <div className="flex">
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 p-2 rounded-l-lg bg-gray-700 text-white border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
          <button
            type="button"
            onClick={handleAddLink}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-r-lg"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>
        
        {/* Display existing links */}
        {referenceLinks.length > 0 && (
          <div className="mt-2 space-y-1">
            {referenceLinks.map((link, index) => (
              <div key={index} className="flex items-center bg-gray-700 rounded p-2">
                <LinkIcon className="h-3 w-3 text-teal-400 mr-2" />
                <span className="text-xs text-gray-300 truncate flex-1">{link}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  className="text-red-400 hover:text-red-300 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2 mb-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && <div className="text-red-400 text-xs mb-3">{error}</div>}

      {/* Submit Controls */}
      <div className="mt-2 flex justify-between items-center">
        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          Add Images
        </label>

        <button
          type="submit"
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          {isReply ? 'Reply' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default EnhancedCommentForm; 