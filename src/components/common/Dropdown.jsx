import React, { useState, useRef, useEffect } from "react";

const Dropdown = ({ id, value, options, onChange, className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div id={id} className={`relative w-full bg-white ${className}`} ref={ref}>
        <button
        onClick={() => setOpen(!open)}
        className="w-full text-gray-800 rounded-lg px-4 py-2 text-left flex justify-between items-center hover:border-gray-400 focus:outline-none"
        >
        <span className="text-gray-800">{value}</span>
        <svg
          className={`w-4 h-4 ml-2 transform transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-10 mt-2 w-full bg-white text-gray-800 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                opt === value ? "bg-blue-50 font-medium" : ""
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
