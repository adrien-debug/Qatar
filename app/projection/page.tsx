"use client";

import Navigation from "@/components/Navigation";
import ProjectionCalculator from "@/components/ProjectionCalculator";

export default function ProjectionPage() {
  return (
    <div className="min-h-screen bg-hearst-dark">
      <Navigation />
      
      <main className="pt-4 p-8 overflow-y-auto min-h-screen">
        <ProjectionCalculator />
      </main>
    </div>
  );
}

