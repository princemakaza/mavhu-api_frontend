// editContentComponents/LoadingShimmer.tsx
import React from "react";
import Sidebar from "@/components/Sidebar";

export const LoadingShimmer: React.FC = () => (
  <div className="min-h-screen w-full bg-gray-100 flex">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <div className="p-6 space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse md:col-span-2"></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3].map((i) => <div key={i} className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>)}
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-1/3"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);