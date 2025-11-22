import Navigation from "@/components/Navigation";
import DealBCalculator from "@/components/DealBCalculator";

export default function DealBPage() {
  return (
    <div className="min-h-screen bg-hearst-light">
      <Navigation />
      <main className="max-w-7xl mx-auto px-8 py-12">
        <DealBCalculator />
      </main>
    </div>
  );
}


