import React, { useState } from 'react';
import { TrendingUp, Calendar, ChevronDown } from 'lucide-react';

interface TopStapleCropsChartProps {
  selectedCrop?: string;
  selectedRegion?: string;
  onCropChange?: (crop: string) => void;
  onRegionChange?: (region: string) => void;
}

const HISTORICAL_DATA = [
  { date: '07-10', rate: 75 },
  { date: '07-12', rate: 82 },
  { date: '07-13', rate: 78 },
  { date: '07-15', rate: 85 },
  { date: '07-16', rate: 77 },
  { date: '07-18', rate: 83 },
  { date: '07-19', rate: 79 },
  { date: '07-21', rate: 86 },
  { date: '07-23', rate: 81 },
  { date: '07-25', rate: 87 },
  { date: '07-27', rate: 84 },
  { date: '07-29', rate: 80 },
  { date: '07-31', rate: 85 },
  { date: '08-02', rate: 82 },
  { date: '08-04', rate: 88 },
  { date: '08-06', rate: 83 },
  { date: '08-08', rate: 86 }
];

export const TopStapleCropsChart: React.FC<TopStapleCropsChartProps> = ({
  selectedCrop = 'Tomato (Golbheda)',
  selectedRegion = 'Kathmandu District',
  onCropChange,
  onRegionChange
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; rate: number } | null>(null);

  // SVG dimensions
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const minRate = 0;
  const maxRate = 100;

  const points = HISTORICAL_DATA.map((d, index) => {
    const x = paddingX + (index / (HISTORICAL_DATA.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((d.rate - minRate) / (maxRate - minRate)) * (svgHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-xs space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Price Trend Line Chart
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Historical pricing indices based on district regions
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedCrop}
              onChange={(e) => onCropChange?.(e.target.value)}
              className="appearance-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Tomato (Golbheda)">Tomato (Golbheda)</option>
              <option value="Ginger (Aduwa)">Ginger (Aduwa)</option>
              <option value="Red Potato (Rato Aalu)">Red Potato (Rato Aalu)</option>
              <option value="Dry Onion">Dry Onion</option>
              <option value="Cauliflower">Cauliflower</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange?.(e.target.value)}
              className="appearance-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-1.5 pr-8 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Kathmandu District">Kathmandu District</option>
              <option value="Dhading District">Dhading District</option>
              <option value="Makwanpur District">Makwanpur District</option>
              <option value="Chitwan District">Chitwan District</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Metrics Row (Matching Image 2) */}
      <div className="grid grid-cols-3 gap-4 bg-stone-50/80 dark:bg-stone-850/60 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800 text-center">
        <div>
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Avg Rate</div>
          <div className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
            NRs. 83 <span className="text-xs text-stone-500 font-normal">/ KG</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Weekly Range</div>
          <div className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">NRs. 77-89</div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Volatility</div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">12 NRs</div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible font-mono text-[10px]">
          {/* Horizontal Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = svgHeight - paddingY - ((val - minRate) / (maxRate - minRate)) * (svgHeight - paddingY * 2);
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-stone-200 dark:text-stone-800"
                  strokeDasharray="4 4"
                />
                <text x={paddingX - 12} y={y + 3} textAnchor="end" className="fill-stone-400">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Circles */}
          {points.map((p, idx) => (
            <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(p)}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#ffffff"
                stroke="#059669"
                strokeWidth="2.5"
                className="hover:scale-125 transition-transform"
              />
              <text
                x={p.x}
                y={svgHeight - 8}
                textAnchor="middle"
                className="fill-stone-400 text-[9px]"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-stone-900 text-white text-xs px-2.5 py-1 rounded-md shadow-md font-mono">
            Date: {hoveredPoint.date} • Rate: NRs. {hoveredPoint.rate}/KG
          </div>
        )}
      </div>
    </div>
  );
};
