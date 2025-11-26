"use client";

import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import ProjectionCalculator from "@/components/ProjectionCalculator";

export default function ProjectionPage() {
  return (
    <div className="min-h-screen bg-hearst-dark">
      <Navigation />
      <Sidebar />
      
      <main className="ml-64 pt-4 p-8 overflow-y-auto min-h-screen">
        <ProjectionCalculator />
      </main>
    </div>
  );
}

