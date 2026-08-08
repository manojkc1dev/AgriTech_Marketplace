import {
  TrendingUp,
  UserCheck,
  BarChart2,
  Users,
  MessageSquare,
  Plus,
  Calendar,
  Shield,
  RefreshCw,
} from "lucide-react";

const SecondaryNav = () => (
  <div className="flex flex-wrap gap-4 mb-8">
    <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-full bg-emerald-600 shadow-sm">
      <TrendingUp size={18} /> Price Entry
    </button>
    <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
      <UserCheck size={18} /> Verification (2)
      <span className="w-2 h-2 ml-1 bg-red-500 rounded-full"></span>
    </button>
    <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
      <BarChart2 size={18} /> Market Analysis
    </button>
    <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
      <Users size={18} /> User Management (7)
    </button>
    <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
      <MessageSquare size={18} /> Feedback (3)
    </button>
  </div>
);

const PriceEntryForm = () => (
  <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl h-fit">
    <div className="flex items-center gap-2 mb-6 text-gray-800">
      <Plus size={20} className="text-emerald-600" />
      <h3 className="font-bold tracking-wide uppercase">
        Log Daily Crop Indices
      </h3>
    </div>

    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
          Crop Name
        </label>
        <select className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>Tomato (Golbheda)</option>
          <option>Potato (Alu)</option>
          <option>Onion (Pyaj)</option>
        </select>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
            Region
          </label>
          <select className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Kathmandu</option>
            <option>Dhading</option>
          </select>
        </div>
        <div className="w-1/2">
          <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
            Rate (NRs/KG)
          </label>
          <input
            type="number"
            placeholder="e.g. 72"
            className="w-full py-2.5 px-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
          Source Market Origin
        </label>
        <select className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option>Kalimati Market</option>
          <option>Balkhu Agriculture Market</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
          Logging Date
        </label>
        <div className="relative">
          <input
            type="text"
            defaultValue="08/08/2026"
            className="w-full py-2.5 px-4 border border-gray-200 rounded-lg text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <Calendar
            size={18}
            className="absolute text-gray-400 right-3 top-3"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 mt-4 text-sm font-bold text-white uppercase rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Publish Wholesale Price
      </button>
    </form>
  </div>
);

const InternalGuildCard = () => (
  <div className="flex flex-col h-full p-6 border shadow-sm bg-gray-50/50 border-gray-100/50 rounded-2xl">
    <div className="flex items-center gap-2 mb-4 text-gray-800">
      <Shield size={20} className="text-emerald-600" />
      <h3 className="font-bold tracking-wide uppercase">
        Light Code Internal Entry Guild
      </h3>
    </div>

    <p className="mb-6 text-sm leading-relaxed text-gray-600">
      As the authorized administrative lead, you are responsible for updating
      daily market price indexes. These values immediately populate the{" "}
      <strong className="text-gray-800">
        Price Directory Trend Visualizers
      </strong>
      , allowing regional co-ops and smallholder farmers to list and price their
      harvests with maximum leverage.
    </p>

    <div className="p-5 mb-auto bg-white border border-gray-100 rounded-xl">
      <ul className="space-y-3 text-sm text-gray-600">
        <li className="flex gap-2">
          <span className="text-gray-400">•</span>
          <span>
            <strong className="text-gray-700">Kathmandu Index:</strong>{" "}
            Collected from Kalimati wholesale yard.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-gray-400">•</span>
          <span>
            <strong className="text-gray-700">Hill Index:</strong> Collected
            from Dhading Besi and Makwanpur local Mandis.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-gray-400">•</span>
          <span>
            <strong className="text-gray-700">Terai Index:</strong> Collected
            from Itahari and Birgunj bulk yards.
          </span>
        </li>
      </ul>
    </div>

    <div className="flex items-center justify-between px-4 py-3 mt-6 bg-white border border-gray-100 rounded-lg">
      <span className="font-mono text-xs text-gray-400 uppercase">
        Authorized Session Role:{" "}
        <span className="font-semibold text-gray-600">admin</span>
      </span>
      <button className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
        <RefreshCw size={14} /> Reload Queue
      </button>
    </div>
  </div>
);

export default function PriceEntryDashboard() {
  return (
    <div className="w-full">
      <SecondaryNav />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PriceEntryForm />
        <InternalGuildCard />
      </div>
    </div>
  );
}
