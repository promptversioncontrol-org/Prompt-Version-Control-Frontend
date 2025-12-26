'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo from public/icon/logo.svg */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/icon/logo.svg"
              alt="PVC"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <span className="font-semibold tracking-tight text-lg text-white">
              PVC
            </span>
          </Link>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <Link href="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
          <Link
            href="/#features"
            className="hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#integrations"
            className="hover:text-white transition-colors"
          >
            Integrations
          </Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/help" className="hover:text-white transition-colors">
            Help
          </Link>
        </div>

        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center"
          >
            Log In
          </Link>
          <button className="px-4 py-2 bg-white text-black text-sm font-semibold rounded hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};
