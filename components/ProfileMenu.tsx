"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProfileMenuProps {
  userEmail: string;
  onLogout: () => void;
}

export default function ProfileMenu({ userEmail, onLogout }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Extract initials from email
  const initials = userEmail
    .split("@")[0]
    .split(".")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await onLogout();
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    router.push("/profile");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Circular Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
        title={userEmail}
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-black mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-black truncate">{userEmail}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full text-left px-4 py-2 text-black hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>View Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center gap-2 border-t border-gray-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
