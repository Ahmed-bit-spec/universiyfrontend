import React from "react";

const SearchBar = ({ value = "", onChange = () => { }, onClear = () => { }, variant = "default", placeholder = "Search..." }) => {
    const baseClass = `w-full pl-3 pr-3 py-2 rounded-xl text-sm bg-[#1A1A1A] border border-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]/40`;
    return (
        <div className={variant === "header" ? "w-full max-w-sm" : "w-full"}>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={baseClass}
                />
                {value && (
                    <button
                        onClick={() => onClear()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400"
                        aria-label="clear"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
