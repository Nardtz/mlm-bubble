import BubbleVisualization from "@/components/bubble-visualization";
import { dummyMLMData } from "@/data/dummy-data";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative">
      <Link
        href="/admin"
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold shadow-lg"
      >
        Admin Panel
      </Link>
      <BubbleVisualization data={dummyMLMData} />
    </div>
  );
}

