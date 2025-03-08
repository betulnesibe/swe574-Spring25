"use client";
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const ChevronUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

function NavigationBar({ onOpenLogin, onOpenSignup, onSearch }) {
  const { user, logout } = useUser();
  const router = useRouter();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: "",
    material: "",
    color: "",
    shape: "",
    timePeriod: "",
    pattern: "",
    hardness: "",
    functionality: "",
    handmade: false,
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
    "Red", "Blue", "Green", "Yellow",
    "Purple", "Orange", "Pink",
    "Black", "White", "Gray",
    "Brown", "Beige/Tan",
    "Gold-colored", "Silver-colored",
    "Bronze-colored", "Multi-colored"
  ];

  const predefinedPatterns = [
    "Plain/Solid Color",
    "Stripes", "Dots",
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
    "1800s", "1900-1950",
    "1950-2000", "2000-Present"
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

  const handleSearchParamChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
    setIsAdvancedOpen(false);
    window._currentPage = 1;
    window._totalPages = 1;
  };

  const handleLogoClick = () => {
    router.push('/');
    setSearchParams({
      query: "",
      material: "",
      color: "",
      shape: "",
      timePeriod: "",
      pattern: "",
      hardness: "",
      functionality: "",
      handmade: false,
    });
    if (onSearch) {
      onSearch({});
    }
    window._currentPage = 1;
    window._totalPages = null;
    window._loadPosts && window._loadPosts(1, "newest");
  };

  const renderComboBox = ({ name, options, label, value, onChange }) => (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          list={`search-${name}-options`}
          className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder={`Any ${label}`}
        />
        <datalist id={`search-${name}-options`}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
    </div>
  );

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <button 
            onClick={handleLogoClick}
            className="text-white text-xl font-bold cursor-pointer hover:text-teal-400 transition-colors"
          >
            What's This?
          </button>

          <div className="flex-grow mx-8">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center">
                <input
                  type="text"
                  name="query"
                  value={searchParams.query}
                  onChange={handleSearchParamChange}
                  placeholder="Search mysteries..."
                  className="bg-gray-700 text-white rounded-l-lg px-4 py-2 w-full focus:outline-none focus:bg-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 flex items-center"
                >
                  <span className="mr-2">Filters</span>
                  {isAdvancedOpen ? <ChevronUp /> : <ChevronDown />}
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-r-lg font-medium"
                >
                  Search
                </button>
              </div>

              {isAdvancedOpen && (
                <div className="absolute left-0 right-0 mt-2 mx-4 p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                  <h3 className="text-white text-lg font-semibold mb-4">Advanced Search Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
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
                            value: searchParams[field.name],
                            onChange: handleSearchParamChange
                          })}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {[
                        { name: "pattern", options: predefinedPatterns, label: "Pattern" },
                        { name: "hardness", options: predefinedHardness, label: "Hardness" },
                        { name: "functionality", options: predefinedFunctions, label: "Function" },
                      ].map((field) => (
                        <div key={field.name}>
                          {renderComboBox({
                            name: field.name,
                            options: field.options,
                            label: field.label,
                            value: searchParams[field.name],
                            onChange: handleSearchParamChange
                          })}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {renderComboBox({
                        name: "timePeriod",
                        options: predefinedTimePeriods,
                        label: "Time Period",
                        value: searchParams.timePeriod,
                        onChange: handleSearchParamChange
                      })}

                      <div className="mt-4">
                        <label className="flex items-center space-x-2 text-gray-300">
                          <input
                            type="checkbox"
                            name="handmade"
                            checked={searchParams.handmade}
                            onChange={handleSearchParamChange}
                            className="form-checkbox h-5 w-5 text-teal-500 rounded focus:ring-2 focus:ring-teal-500"
                          />
                          <span>Handmade Only</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href={`/profile/${user.id}`}>
                  <span className="text-white cursor-pointer">{user.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={onOpenSignup}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Signup
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;