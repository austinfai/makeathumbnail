'use client';

import { SignUpButton } from "@clerk/nextjs";

export function SignUpButtonClient() {
  return (
    <SignUpButton mode="modal">
      <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
        Get Started Free
      </button>
    </SignUpButton>
  );
} 