"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../context/UserContext";
import axiosInstance from "../../services/axiosInstance";
import { getFullImageUrl } from "../../utils/urlHelper";

function CreatePostContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    material: "",
    textAndLanguage: "",
    color: "",
    shape: "",
    price: "",
    location: "",
    timePeriod: "",
    smell: "",
    taste: "",
    texture: "",
    hardness: "",
    pattern: "",
    brand: "",
    print: "",
    icons: "",
    handmade: false,
    functionality: "",
    tags: [],
    imageUrls: [],
    widthValue: "",
    widthUnit: "cm",
    heightValue: "",
    heightUnit: "cm",
    depthValue: "",
    depthUnit: "cm",
    weightValue: "",
    weightUnit: "kg"
  });

  
  const predefinedShapes = [
    "Round/Circle", 
    "Square/Box", 
    "Rectangle/Long Box", 
    "Triangle", 
    "Oval/Egg-shaped",
    "Ball/Sphere",
    "Cylinder/Tube",
    "Cone/Triangle 3D",
    "Star",
    "Heart",
    "Cross",
    "Irregular/Random"
  ];

  const predefinedMaterials = [
    "Plastic",
    "Metal (General)",
    "Wood",
    "Glass",
    "Fabric/Cloth",
    "Paper/Cardboard",
    "Gold/Gold-colored",
    "Silver/Silver-colored",
    "Copper/Bronze",
    "Stone/Rock",
    "Leather",
    "Rubber",
    "Clay/Ceramic",
    "Foam",
    "Carbon Fiber"
  ];

  const predefinedColors = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Purple",
    "Orange",
    "Pink",
    "Black",
    "White",
    "Gray",
    "Brown",
    "Beige/Tan",
    "Gold-colored",
    "Silver-colored",
    "Bronze-colored",
    "Multi-colored"
  ];

  const predefinedPatterns = [
    "Plain/Solid Color",
    "Stripes",
    "Dots",
    "Squares/Checkered",
    "Floral/Flowers",
    "Animal Print",
    "Abstract/Random",
    "Geometric Shapes",
    "Camouflage",
    "Nature/Landscape",
    "Text/Letters",
    "No Pattern"
  ];

  const predefinedTimePeriods = [
    "Very Old (100+ years)",
    "Old (50-100 years)",
    "Recent (10-50 years)",
    "New (0-10 years)",
    "Not Sure",
    "1800s",
    "1900-1950",
    "1950-2000",
    "2000-Present"
  ];

  const predefinedHardness = [
    "Very Soft (like cotton)",
    "Soft (like rubber)",
    "Medium (like wood)",
    "Hard (like metal)",
    "Very Hard (like diamond)",
    "Flexible/Bendable"
  ];

  const predefinedFunctions = [
    "Decoration Only",
    "Tool/Useful Object",
    "Both Decoration and Tool",
    "Container/Storage",
    "Clothing/Wearable",
    "Furniture/Home Item",
    "Kitchen/Cooking",
    "Game/Toy",
    "Machine Part",
    "Not Sure"
  ];

  const sizeUnits = ["cm", "in", "mm", "m"];
  const weightUnits = ["kg", "g", "lb", "oz"];
  const dimensionUnits = ["mm", "cm", "m", "in", "ft"];

  const [tagsInput, setTagsInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [parts, setParts] = useState([]);
  const [activePartIndex, setActivePartIndex] = useState(null);
  const [editingPartName, setEditingPartName] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [previewUrls, setPreviewUrls] = useState([]);

  const [debouncedTagSearch] = useState(() => {
    let timeoutId;
    return (query) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      return new Promise((resolve) => {
        timeoutId = setTimeout(async () => {
          if (query.length >= 2) { // Only search if 2 or more characters
            try {
              const response = await axiosInstance.get(`/tags/search?query=${encodeURIComponent(query)}`);
              resolve(response.data);
            } catch (error) {
              console.error("Error fetching tag suggestions:", error);
              resolve([]);
            }
          } else {
            resolve([]);
          }
        }, 500); // Wait 500ms after last keystroke
      });
    };
  });

  const createEmptyPart = () => ({
    partName: `Part ${parts.length + 1}`,
    material: "",
    textAndLanguage: "",
    color: "",
    shape: "",
    price: "",
    location: "",
    timePeriod: "",
    smell: "",
    taste: "",
    texture: "",
    hardness: "",
    pattern: "",
    brand: "",
    print: "",
    icons: "",
    handmade: false,
    functionality: "",
    widthValue: "",
    widthUnit: "cm",
    heightValue: "",
    heightUnit: "cm",
    depthValue: "",
    depthUnit: "cm",
    weightValue: "",
    weightUnit: "kg"
  });

  const addNewPart = () => {
    setParts([...parts, createEmptyPart()]);
    setActivePartIndex(parts.length);
  };

  const handlePartInputChange = (index, name, value, type = "text") => {
    const updatedParts = [...parts];
    updatedParts[index] = {
      ...updatedParts[index],
      [name]: type === "checkbox" ? value.target.checked : value,
    };
    setParts(updatedParts);
  };

  const removePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
    setActivePartIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTagInputChange = async (e) => {
    const query = e.target.value;
    setTagsInput(query);
    
    if (!query.trim()) {
      setTagSuggestions([]);
      return;
    }

    setLoadingTags(true);
    try {
      const suggestions = await debouncedTagSearch(query);
      setTagSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching tag suggestions:", error);
    } finally {
      setLoadingTags(false);
    }
  };

  const addTag = (suggestion) => {
    const tagLabel = suggestion.label;
    if (!formData.tags.includes(tagLabel)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagLabel]
      }));
    }
    setTagsInput("");
    setTagSuggestions([]);
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setError("Please select only image files.");
      return;
    }

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("images", file));

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/uploads/images", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadedUrls = response.data;
      console.log('Uploaded URLs from server:', uploadedUrls); // Debug log
      
      // Create preview URLs for new images
      const newPreviewUrls = uploadedUrls.map(serverUrl => {
        const fullUrl = getFullImageUrl(serverUrl);
        console.log('New upload URL conversion:', { serverUrl, fullUrl }); // Debug log
        return {
          url: fullUrl,
          file: null,
          isExisting: true,
          serverUrl: serverUrl
        };
      });

      console.log('Current preview URLs:', previewUrls); // Debug log
      console.log('Adding new preview URLs:', newPreviewUrls); // Debug log

      // Update preview URLs and form data
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploadedUrls]
      }));
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Image upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removePreview = (index) => {
    console.log('Removing preview at index:', index); // Debug log
    console.log('Current preview URLs:', previewUrls); // Debug log
    console.log('Current form imageUrls:', formData.imageUrls); // Debug log

    // Remove from preview URLs
    setPreviewUrls(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      console.log('New preview URLs after removal:', newPreviews); // Debug log
      return newPreviews;
    });
    
    // Remove corresponding URL from form data
    setFormData(prev => {
      const newFormData = {
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index)
      };
      console.log('New form imageUrls after removal:', newFormData.imageUrls); // Debug log
      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Required field validation
    const requiredFields = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      images: previewUrls.length
    };

    // Check all required fields
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return;
      }
    }

    // Check description length
    if (formData.description.trim().length < 10) {
      setError("Description must be at least 10 characters long");
      return;
    }

    // Check user authentication
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }

    setLoading(true);

    try {
      const imageUrls = previewUrls.map(preview => {
        if (preview.isExisting) {
          return preview.serverUrl.split('/').pop();
        }
        return preview.serverUrl;
      });

      const postData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        userId: user.id,
        imageUrls: imageUrls,
        parts: parts.length > 0 ? parts : null // Include parts data if it exists
      };
      
      console.log("Submitting parts data:", parts); // Debug log to verify parts are included

      const method = isEditing ? 'put' : 'post';
      const endpoint = isEditing ? `/posts/${editId}` : '/posts';
      
      const response = await axiosInstance[method](endpoint, postData);
      router.push(`/posts/${response.data.id}`);
    } catch (err) {
      console.error("Post creation/update failed:", err);
      setError(err.message || "Failed to save post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderComboBox = ({ name, options, label, value, onChange }) => (
    <div>
      <label className="block text-lg font-semibold mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          list={`${name}-options`}
          className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder={`Enter or select ${label.toLowerCase()}`}
        />
        <datalist id={`${name}-options`}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
    </div>
  );

  const DimensionInput = ({ label, value, unit, onValueChange, onUnitChange, units }) => (
    <div className="flex space-x-2">
      <div className="flex-grow">
        <label className="block text-lg font-semibold mb-2">{label}</label>
        <input
          type="text"
          value={value}
          onChange={onValueChange}
          className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
      <div className="w-24">
        <label className="block text-lg font-semibold mb-2">Unit</label>
        <select
          value={unit}
          onChange={onUnitChange}
          className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const handlePartNameEdit = (index, newName) => {
    const updatedParts = [...parts];
    updatedParts[index] = {
      ...updatedParts[index],
      partName: newName || `Part ${index + 1}`
    };
    setParts(updatedParts);
    setEditingPartName(null);
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const fetchPostData = async () => {
      if (editId && user) {
        setIsEditing(true);
        try {
          const response = await axiosInstance.get(`/posts/${editId}`);
          const postData = response.data;
          
          if (postData.userId !== user.id) {
            router.push('/404');
            return;
          }
          
          console.log('Fetched post data:', postData); // Debug log
          const imageUrls = postData.imageUrls || [];
          console.log('Image URLs from backend:', imageUrls); // Debug log
          
          // Set form data with original URLs
          setFormData({
            ...postData,
            imageUrls: imageUrls
          });

          // Set preview URLs with full URLs for existing images
          if (imageUrls.length > 0) {
            const newPreviewUrls = imageUrls.map(url => {
              const fullUrl = getFullImageUrl(url);
              console.log('Converting URL:', { original: url, full: fullUrl }); // Debug log
              return {
                url: fullUrl,
                file: null,
                isExisting: true,
                serverUrl: url
              };
            });
            console.log('Setting preview URLs:', newPreviewUrls); // Debug log
            setPreviewUrls(newPreviewUrls);
          }
        } catch (error) {
          console.error("Error fetching post data:", error);
          if (error.response?.status === 404) {
            router.push('/404');
          } else {
            setError("Failed to load post data");
          }
        }
      }
    };

    fetchPostData();
  }, [editId, user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="container mx-auto py-8">
        <div className="max-w-full mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Top Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-4">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h1>
            {error && (
              <div className="bg-red-600 text-white p-4 rounded mb-4">
                {error}
              </div>
            )}
          </div>

          {/* Form Section */}
          <form
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <label htmlFor="title" className="block text-lg font-semibold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div className="lg:col-span-3">
                <label htmlFor="description" className="block text-lg font-semibold mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter a detailed description (minimum 10 characters)"
                  rows={6}
                  required
                  minLength={10}
                />
              </div>
            </div>

            {/* Parts Navigation and Content */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
              <div className="px-6 pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setActivePartIndex(null)}
                      className={`px-6 py-3 rounded-t-lg transition duration-150 ${
                        activePartIndex === null
                          ? "bg-gray-700 text-white"
                          : "bg-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      General
                    </button>
                    {parts.map((part, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActivePartIndex(index)}
                        className={`px-6 py-3 rounded-t-lg transition duration-150 ${
                          activePartIndex === index
                            ? "bg-gray-700 text-white"
                            : "bg-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center">
                          {editingPartName === index ? (
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              onBlur={() => handlePartNameEdit(index, editedName)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handlePartNameEdit(index, editedName);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-gray-600 text-white px-2 py-1 rounded w-24"
                              autoFocus
                            />
                          ) : (
                            <span
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingPartName(index);
                                setEditedName(part.partName);
                              }}
                              className="cursor-text"
                            >
                              {part.partName}
                            </span>
                          )}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              removePart(index);
                            }}
                            className="ml-3 text-red-400 hover:text-red-600 rounded-full hover:bg-gray-800 w-6 h-6 flex items-center justify-center"
                          >
                            ×
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addNewPart}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md transition duration-150"
                  >
                    Add Part
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="bg-gray-700 p-6">
                {activePartIndex === null ? (
                  <div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                      <div className="lg:col-span-3 bg-gray-700 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Dimensions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Width */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                name="widthValue"
                                value={formData.widthValue || ''}
                                onChange={handleInputChange}
                                placeholder="Width"
                                className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                            <select
                              name="widthUnit"
                              value={formData.widthUnit || 'cm'}
                              onChange={handleInputChange}
                              className="w-24 px-2 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              {dimensionUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>

                          {/* Height */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                name="heightValue"
                                value={formData.heightValue || ''}
                                onChange={handleInputChange}
                                placeholder="Height"
                                className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                            <select
                              name="heightUnit"
                              value={formData.heightUnit || 'cm'}
                              onChange={handleInputChange}
                              className="w-24 px-2 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              {dimensionUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>

                          {/* Depth */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                name="depthValue"
                                value={formData.depthValue || ''}
                                onChange={handleInputChange}
                                placeholder="Depth"
                                className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                            <select
                              name="depthUnit"
                              value={formData.depthUnit || 'cm'}
                              onChange={handleInputChange}
                              className="w-24 px-2 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              {dimensionUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>

                          {/* Weight */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                name="weightValue"
                                value={formData.weightValue || ''}
                                onChange={handleInputChange}
                                placeholder="Weight"
                                className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                            <select
                              name="weightUnit"
                              value={formData.weightUnit || 'kg'}
                              onChange={handleInputChange}
                              className="w-24 px-2 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              {weightUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Column 1 */}
                      <div className="space-y-6">
                        {[
                          { name: "material", options: predefinedMaterials, label: "Material" },
                          { name: "color", options: predefinedColors, label: "Color" },
                          { name: "shape", options: predefinedShapes, label: "Shape" },
                        ].map((field) => (
                          <div key={field.name}>
                            {renderComboBox({
                              name: field.name,
                              options: field.options,
                              label: field.label,
                              value: formData[field.name],
                              onChange: handleInputChange
                            })}
                          </div>
                        ))}

                        {["textAndLanguage", "location", "smell"].map((field) => (
                          <div key={field}>
                            <label className="block text-lg font-semibold mb-2 capitalize">
                              {field.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                              type="text"
                              name={field}
                              value={formData[field]}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-6">
                        {[
                          { name: "pattern", options: predefinedPatterns, label: "Pattern" },
                          { name: "timePeriod", options: predefinedTimePeriods, label: "Time Period" },
                          { name: "hardness", options: predefinedHardness, label: "Hardness" },
                        ].map((field) => (
                          <div key={field.name}>
                            {renderComboBox({
                              name: field.name,
                              options: field.options,
                              label: field.label,
                              value: formData[field.name],
                              onChange: handleInputChange
                            })}
                          </div>
                        ))}

                        {["taste", "texture", "price"].map((field) => (
                          <div key={field}>
                            <label className="block text-lg font-semibold mb-2 capitalize">
                              {field.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                              type="text"
                              name={field}
                              value={formData[field]}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Column 3 */}
                      <div className="space-y-6">
                        {["brand", "print", "icons", "functionality"].map((field) => (
                          <div key={field}>
                            <label className="block text-lg font-semibold mb-2 capitalize">
                              {field.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                              type="text"
                              name={field}
                              value={formData[field]}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                            />
                          </div>
                        ))}

                        <div>
                          <label className="flex items-center text-lg font-semibold">
                            <input
                              type="checkbox"
                              name="handmade"
                              checked={formData.handmade}
                              onChange={handleInputChange}
                              className="mr-2 w-5 h-5 rounded bg-gray-600 text-teal-500 focus:outline-none"
                            />
                            Handmade
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Dimensions Section for Parts */}
                    <div className="mb-8">
                      <div className="lg:col-span-3 bg-gray-700 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Part Dimensions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Width */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                value={parts[activePartIndex]?.widthValue || ''}
                                onChange={(e) => handlePartInputChange(activePartIndex, "widthValue", e.target.value)}
                                placeholder="Width"
                                className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                            <select
                              value={parts[activePartIndex]?.widthUnit || 'cm'}
                              onChange={(e) => handlePartInputChange(activePartIndex, "widthUnit", e.target.value)}
                              className="w-24 px-2 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              {dimensionUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>

                          {/* Height */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                value={parts[activePartIndex]?.heightValue || ''}
                                onChange={(e) => handlePartInputChange(activePartIndex, "heightValue", e.target.value)}
                                placeholder="Height"
                                className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                            <select
                              value={parts[activePartIndex]?.heightUnit || 'cm'}
                              onChange={(e) => handlePartInputChange(activePartIndex, "heightUnit", e.target.value)}
                              className="w-24 px-2 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              {dimensionUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>

                          {/* Depth */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                value={parts[activePartIndex]?.depthValue || ''}
                                onChange={(e) => handlePartInputChange(activePartIndex, "depthValue", e.target.value)}
                                placeholder="Depth"
                                className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                            <select
                              value={parts[activePartIndex]?.depthUnit || 'cm'}
                              onChange={(e) => handlePartInputChange(activePartIndex, "depthUnit", e.target.value)}
                              className="w-24 px-2 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              {dimensionUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>

                          {/* Weight */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="number"
                                value={parts[activePartIndex]?.weightValue || ''}
                                onChange={(e) => handlePartInputChange(activePartIndex, "weightValue", e.target.value)}
                                placeholder="Weight"
                                className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                            <select
                              value={parts[activePartIndex]?.weightUnit || 'kg'}
                              onChange={(e) => handlePartInputChange(activePartIndex, "weightUnit", e.target.value)}
                              className="w-24 px-2 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              {weightUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main three-column grid for other fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Column 1 */}
                      <div className="space-y-6">
                        {[
                          { name: "material", options: predefinedMaterials, label: "Material" },
                          { name: "color", options: predefinedColors, label: "Color" },
                          { name: "shape", options: predefinedShapes, label: "Shape" },
                        ].map((field) => (
                          <div key={field.name}>
                            <label className="block text-lg font-semibold mb-2">
                              {field.label}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={parts[activePartIndex][field.name]}
                                onChange={(e) => handlePartInputChange(activePartIndex, field.name, e.target.value)}
                                list={`part-${field.name}-options`}
                                className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={`Enter or select ${field.label.toLowerCase()}`}
                              />
                              <datalist id={`part-${field.name}-options`}>
                                {field.options.map((option) => (
                                  <option key={option} value={option} />
                                ))}
                              </datalist>
                            </div>
                          </div>
                        ))}

                        {["textAndLanguage", "location", "smell"].map((field) => (
                          <div key={field}>
                            <label className="block text-lg font-semibold mb-2 capitalize">
                              {field.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                              type="text"
                              value={parts[activePartIndex][field]}
                              onChange={(e) => handlePartInputChange(activePartIndex, field, e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-6">
                        {[
                          { name: "pattern", options: predefinedPatterns, label: "Pattern" },
                          { name: "timePeriod", options: predefinedTimePeriods, label: "Time Period" },
                          { name: "hardness", options: predefinedHardness, label: "Hardness" },
                        ].map((field) => (
                          <div key={field.name}>
                            <label className="block text-lg font-semibold mb-2">
                              {field.label}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={parts[activePartIndex][field.name]}
                                onChange={(e) => handlePartInputChange(activePartIndex, field.name, e.target.value)}
                                list={`part-${field.name}-options`}
                                className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={`Enter or select ${field.label.toLowerCase()}`}
                              />
                              <datalist id={`part-${field.name}-options`}>
                                {field.options.map((option) => (
                                  <option key={option} value={option} />
                                ))}
                              </datalist>
                            </div>
                          </div>
                        ))}

                        {["taste", "texture", "price"].map((field) => (
                          <div key={field}>
                            <label className="block text-lg font-semibold mb-2 capitalize">
                              {field.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                              type="text"
                              value={parts[activePartIndex][field]}
                              onChange={(e) => handlePartInputChange(activePartIndex, field, e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Column 3 */}
                      <div className="space-y-6">
                        {["brand", "print", "icons", "functionality"].map((field) => (
                          <div key={field}>
                            <label className="block text-lg font-semibold mb-2 capitalize">
                              {field.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                              type="text"
                              name={field}
                              value={parts[activePartIndex][field]}
                              onChange={(e) => handlePartInputChange(activePartIndex, field, e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                            />
                          </div>
                        ))}

                        <div>
                          <label className="flex items-center text-lg font-semibold">
                            <input
                              type="checkbox"
                              checked={parts[activePartIndex].handmade}
                              onChange={(e) => handlePartInputChange(activePartIndex, "handmade", e, "checkbox")}
                              className="mr-2 w-5 h-5 rounded bg-gray-600 text-teal-500 focus:outline-none"
                            />
                            Handmade
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
              <label className="block text-lg font-semibold mb-2">Tags</label>
              <div className="relative">
                <input
                  type="text"
                  value={tagsInput}
                  onChange={handleTagInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Add tags"
                />
                {tagSuggestions.length > 0 && (
                  <div 
                    className="absolute left-0 right-0 z-[100] mt-1 bg-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto border border-gray-600"
                    style={{ top: '100%' }}
                  >
                    {tagSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-600 text-white"
                        onClick={() => addTag(suggestion)}
                      >
                        <div className="font-semibold">{suggestion.label}</div>
                        <div className="text-sm text-gray-300">{suggestion.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Tags */}
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-teal-600 text-white px-3 py-1 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-white hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
              <div className="lg:col-span-3">
                <label htmlFor="images" className="block text-lg font-semibold mb-2">
                  Images {!isEditing && <span className="text-red-500">*</span>}
                  {isEditing && <span className="text-gray-400 text-sm ml-2">(Optional when editing)</span>}
                </label>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                  required={!isEditing || previewUrls.length === 0}
                />
                {previewUrls.length === 0 && !isEditing && (
                  <p className="text-red-500 text-sm mt-1">At least one image is required</p>
                )}
              </div>
              
              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {previewUrls.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePreview(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 focus:outline-none"
                disabled={loading}
              >
                 {isEditing ? 'Edit Post' : 'Create New Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function CreatePostPage() {
	return (
		 <Suspense fallback={<div>Loading...</div>}>
      <CreatePostContent />
    </Suspense>
	);
}
