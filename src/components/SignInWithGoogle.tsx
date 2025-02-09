"use client";

import { useAuth } from '../lib/hooks/useAuth';
import Image from "next/image";

export default function SignInWithGoogle() {
  const { signInWithGoogle } = useAuth();

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center justify-center bg-white text-gray-700 font-semibold py-2 px-4 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300 ease-in-out"
    >
      <Image
        src="/google-logo.png"
        alt="Google sign-in"
        width={24}
        height={24}
        priority
      />
      Sign in with Google
    </button>
  );
}
