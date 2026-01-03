'use client';

import React from 'react';

// Landing page for Vercel deployment explaining PWA installation

export function VercelLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6FBF8] to-[#E8F5F1] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4">🦡</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Badger
          </h1>
          <p className="text-xl text-gray-600">
            Personal Finance Manager - Privacy First
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            📱 Install Badger as a PWA
          </h2>

          <div className="space-y-6 text-gray-700">
            <p className="text-lg">
              Badger is a <strong>Progressive Web App (PWA)</strong> that stores all your data locally on your device for maximum privacy.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="font-semibold text-blue-800">🔒 Your data stays on YOUR device</p>
              <p className="text-sm text-blue-700 mt-1">
                No servers, no accounts, no cloud storage - complete privacy
              </p>
            </div>

            {/* Installation Instructions */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4">How to Install:</h3>

              {/* Desktop */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-2 flex items-center">
                  <span className="text-2xl mr-2">🖥️</span>
                  On Desktop (Chrome/Edge):
                </h4>
                <ol className="list-decimal list-inside space-y-2 ml-8">
                  <li>Look for the install icon (⊕) in the address bar</li>
                  <li>Click "Install Badger"</li>
                  <li>App opens in standalone window</li>
                  <li>Start tracking your expenses!</li>
                </ol>
              </div>

              {/* Android */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-2 flex items-center">
                  <span className="text-2xl mr-2">📱</span>
                  On Android (Chrome):
                </h4>
                <ol className="list-decimal list-inside space-y-2 ml-8">
                  <li>Tap the menu (⋮) → "Install app"</li>
                  <li>Or tap the install banner that appears</li>
                  <li>App icon added to home screen</li>
                  <li>Launch and use offline!</li>
                </ol>
              </div>

              {/* iOS */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-2 flex items-center">
                  <span className="text-2xl mr-2">🍎</span>
                  On iOS (Safari):
                </h4>
                <ol className="list-decimal list-inside space-y-2 ml-8">
                  <li>Tap the Share button (□↑)</li>
                  <li>Scroll down → "Add to Home Screen"</li>
                  <li>Name it "Badger" and tap "Add"</li>
                  <li>Icon appears on home screen</li>
                </ol>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4">✨ Features:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📊</span>
                  <div>
                    <p className="font-semibold">Track Expenses</p>
                    <p className="text-sm text-gray-600">Daily expense logging with categories</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">💰</span>
                  <div>
                    <p className="font-semibold">Income Management</p>
                    <p className="text-sm text-gray-600">Track all income sources</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📈</span>
                  <div>
                    <p className="font-semibold">Analytics</p>
                    <p className="text-sm text-gray-600">Insights and spending trends</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📱</span>
                  <div>
                    <p className="font-semibold">Works Offline</p>
                    <p className="text-sm text-gray-600">No internet needed after install</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">🌐</span>
                  <div>
                    <p className="font-semibold">Dual Language</p>
                    <p className="text-sm text-gray-600">English + मराठी</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📖</span>
                  <div>
                    <p className="font-semibold">Monthly Diary</p>
                    <p className="text-sm text-gray-600">Export financial diary as PDF</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <div className="inline-block bg-green-100 border-2 border-green-500 rounded-lg p-6">
                <p className="text-lg font-semibold text-green-800 mb-2">
                  👆 Install now using the button above ☝️
                </p>
                <p className="text-sm text-green-700">
                  Or check your browser's address bar for the install icon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-2">
            Open Source • Privacy First • No Account Required
          </p>
          <p className="text-sm">
            <a
              href="https://github.com/om-j-chavan/Badger"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
