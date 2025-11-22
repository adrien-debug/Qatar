import Navigation from "@/components/Navigation";
import DealACalculator from "@/components/DealACalculator";

export default function DealAPage() {
  return (
    <div className="min-h-screen bg-hearst-light">
      <Navigation />
      <main className="max-w-7xl mx-auto px-8 py-12">
        <DealACalculator />
      </main>
    </div>
  );
}


