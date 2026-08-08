import { useState, useEffect } from "react";
import PriceEntryDashboard from "./components/PriceEntryDashboard";
import {
  Bell,
  ShoppingCart,
  Sun,
  TrendingUp,
  BellRing,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 1. Define the TypeScript interface for your Django backend response
interface ChartDataPoint {
  name: string; // e.g., "07-10"
  price: number;
}

// --- COMPONENTS ---

const TopNavigation = () => (
  <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
    <div className="flex items-center gap-2">
      <div className="p-2 text-white rounded-lg bg-emerald-700">
        <TrendingUp size={24} />
      </div>
      <span className="text-xl font-bold text-gray-900">AgriTech</span>
    </div>

    <div className="hidden space-x-2 md:flex bg-gray-50 p-1 rounded-full border border-gray-200">
      <button className="px-6 py-2 text-sm font-semibold text-gray-600 rounded-full hover:bg-gray-100">
        DASHBOARD
      </button>
      <button className="px-6 py-2 text-sm font-semibold text-white rounded-full bg-emerald-700">
        MARKET RATE
      </button>
      <button className="px-6 py-2 text-sm font-semibold text-emerald-700 rounded-full hover:bg-emerald-50">
        SUPPLY CHAIN
      </button>
    </div>

    <div className="flex items-center gap-4">
      <button className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100">
        <Bell size={20} />
        <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
          2
        </span>
      </button>
      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full bg-emerald-600 hover:bg-emerald-700">
        <ShoppingCart size={16} /> Cart
      </button>
      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50">
        <Sun size={16} /> Light
      </button>
    </div>
  </nav>
);

const HeroBanner = () => (
  <div className="p-8 mb-6 text-white rounded-2xl bg-emerald-950">
    <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-sm font-medium border rounded-full text-emerald-300 border-emerald-700 bg-emerald-900/50">
          <TrendingUp size={14} /> National Market Price Index (राष्ट्रिय दैनिक
          बजार मूल्य प्रणाली)
        </span>
        <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
          Daily Wholesale Produce Price Index & Rate Tracker
        </h1>
        <p className="text-emerald-100/80">
          Authorized real-time mandi rates from Kalimati, Tokha, Dhading,
          Narayangarh, and regional wholesale markets. Set threshold price
          alerts and analyze multi-crop historical price trends.
        </p>
      </div>
      <div className="flex gap-3 mt-6 md:mt-0">
        <button className="flex items-center gap-2 px-6 py-3 font-semibold text-orange-900 bg-orange-400 rounded-xl hover:bg-orange-500">
          <BellRing size={18} /> Set Price Alert
        </button>
        <button className="flex items-center gap-2 px-6 py-3 font-semibold text-white border border-white/20 rounded-xl bg-white/10 hover:bg-white/20">
          <RefreshCw size={18} /> Refresh
        </button>
      </div>
    </div>
  </div>
);

const FilterDirectory = () => (
  <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl h-fit">
    <div className="flex items-center gap-2 mb-6 text-gray-800">
      <Search size={20} className="text-emerald-600" />
      <h3 className="font-bold tracking-wide uppercase">
        Search & Filter Directory
      </h3>
    </div>

    <div className="space-y-5">
      <div>
        <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
          Product Name (Crop)
        </label>
        <div className="relative">
          <Search size={16} className="absolute text-gray-400 left-3 top-3" />
          <input
            type="text"
            placeholder="Search product name..."
            className="w-full py-2.5 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select className="w-full py-2.5 px-4 mt-3 border border-gray-200 rounded-lg text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>-- Quick Product Select --</option>
          <option>Tomato (Golbheda)</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
          Filter By Region
        </label>
        <select className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>All Regions</option>
          <option>Kathmandu</option>
        </select>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
          Pricing Options
        </label>
        <select className="w-full py-2.5 px-4 mb-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>All Prices</option>
        </select>

        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Min"
            className="w-1/2 py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="number"
            placeholder="Max"
            className="w-1/2 py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  </div>
);

// 2. Accept data as props instead of using a local variable
const PriceChartArea = ({ data }: { data: ChartDataPoint[] }) => (
  <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
    <div className="flex items-start justify-between pb-6 mb-6 border-b border-gray-100">
      <div>
        <h2 className="flex items-center gap-2 font-bold tracking-wide text-gray-800 uppercase">
          <TrendingUp size={20} className="text-emerald-600" /> Price Trend Line
          Chart
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Historical pricing indices based on district regions
        </p>
      </div>
      <div className="flex gap-3">
        <select className="py-2 pl-4 pr-8 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>Tomato (Golbheda)</option>
        </select>
        <select className="py-2 pl-4 pr-8 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>Kathmandu District</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-6 mb-8 text-center">
      <div>
        <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">
          Avg Rate
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          NRs. 83{" "}
          <span className="text-sm font-normal text-gray-500">/ KG</span>
        </p>
      </div>
      <div className="px-6 border-x border-gray-100">
        <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">
          Weekly Range
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900">NRs. 77-89</p>
      </div>
      <div>
        <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">
          Volatility
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-600">12 NRs</p>
      </div>
    </div>

    <div className="w-full h-72">
      {data.length === 0 ? (
        <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-50 rounded-xl">
          Loading market data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              dx={-10}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "#6b7280", marginBottom: "4px" }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#059669"
              strokeWidth={3}
              dot={{ r: 4, fill: "#059669", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  // 3. Initialize state to hold data from Django
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // 4. Fetch the data when the component mounts
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/admin/analytics/trending-crops/",
        );
        if (response.ok) {
          const data = await response.json();
          setChartData(data);
        } else {
          console.error(`Django API returned a ${response.status} error.`);
        }
      } catch (error) {
        console.error("Failed to fetch from Django backend:", error);
      }
    };

    fetchMarketData();
  }, []);

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <TopNavigation />

      <main className="px-6 py-8 mx-auto max-w-7xl">
        {/* Render your custom Price Entry Dashboard right here */}
        <div className="mb-8">
          <PriceEntryDashboard />
        </div>

        <HeroBanner />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PriceChartArea data={chartData} />
          </div>

          <div className="lg:col-span-1">
            <FilterDirectory />
          </div>
        </div>
      </main>
    </div>
  );
}
