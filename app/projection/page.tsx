"use client";

import Navigation from "@/components/Navigation";
import ProjectionCalculator from "@/components/ProjectionCalculator";

export default function ProjectionPage() {
  return (
    <div className="min-h-screen bg-hearst-dark">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <ProjectionCalculator />
      </main>
    </div>
  );
}

