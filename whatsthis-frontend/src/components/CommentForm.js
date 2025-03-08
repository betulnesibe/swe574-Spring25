import React, { useState } from 'react';

const CommentForm = ({ onSubmit, isReply = false }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) return;

    await onSubmit(text, images);
    setText('');
    setImages([]);
    setPreviewUrls([]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isReply ? "Write a reply..." : "Write a comment..."}
        className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        rows={3}
      />

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
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
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex justify-between items-center">
        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
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
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
        >
          {isReply ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm; 