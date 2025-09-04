"use client";

import React from "react";


export default function EditorPage() {
  return (
    <div className="flex h-screen w-screen">
      <div className="flex-1 flex">
        {/* Left panel */}
        <div className="flex flex-col h-full w-10 border-r border-gray-200">
          <div className="flex flex-col w-full justify-center items-center">
            <div className="flex justify-center items-center h-10 w-full border-b border-gray-200">1</div>
            <div className="flex justify-center items-center h-10 w-full border-b border-gray-200">2</div>
          </div>
        </div>
        {/* Main content */}
        <div className="flex h-full w-full justify-center items-center">main content</div>
      </div>
    </div>
  );
}


