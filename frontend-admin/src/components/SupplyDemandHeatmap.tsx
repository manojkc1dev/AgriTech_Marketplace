import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { TrendingUp, Info, MapPin, AlertCircle, Sparkles } from "lucide-react";
import type { ProduceListing, DemandPost } from "../types";

interface SupplyDemandHeatmapProps {
  onSelectCropAndDistrict?: (crop: string, district: string) => void;
}

interface HeatmapCell {
  district: string;
  crop: string;
  baseSupply: number;
  baseDemand: number;
  liveSupply: number;
  liveDemand: number;
  totalSupply: number;
  totalDemand: number;
  opportunityIndex: number;
}

const baseData = [
  {
    district: "Kathmandu",
    crop: "Tomato (Golbheda)",
    supply: 500,
    demand: 4500,
  },
  { district: "Kathmandu", crop: "Potato (Alu)", supply: 1200, demand: 8500 },
  {
    district: "Kathmandu",
    crop: "Cauliflower (Kauli)",
    supply: 400,
    demand: 3200,
  },
  { district: "Kathmandu", crop: "Ginger (Aduwa)", supply: 150, demand: 1800 },
  { district: "Kathmandu", crop: "Onion (Pyaj)", supply: 300, demand: 5500 },

  {
    district: "Dhading",
    crop: "Tomato (Golbheda)",
    supply: 6200,
    demand: 1200,
  },
  { district: "Dhading", crop: "Potato (Alu)", supply: 4500, demand: 1900 },
  {
    district: "Dhading",
    crop: "Cauliflower (Kauli)",
    supply: 5100,
    demand: 1100,
  },
  { district: "Dhading", crop: "Ginger (Aduwa)", supply: 1200, demand: 600 },
  { district: "Dhading", crop: "Onion (Pyaj)", supply: 2200, demand: 1800 },

  {
    district: "Makwanpur",
    crop: "Tomato (Golbheda)",
    supply: 3800,
    demand: 1000,
  },
  { district: "Makwanpur", crop: "Potato (Alu)", supply: 7200, demand: 2100 },
  {
    district: "Makwanpur",
    crop: "Cauliflower (Kauli)",
    supply: 2800,
    demand: 900,
  },
  { district: "Makwanpur", crop: "Ginger (Aduwa)", supply: 4900, demand: 700 },
  { district: "Makwanpur", crop: "Onion (Pyaj)", supply: 1500, demand: 1400 },
];

export default function SupplyDemandHeatmap({
  onSelectCropAndDistrict,
}: SupplyDemandHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [metric, setMetric] = useState<"opportunity" | "demand" | "supply">(
    "opportunity",
  );
  const [loading, setLoading] = useState(false);

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [demands, setDemands] = useState<DemandPost[]>([]);

  const crops = useMemo(
    () => [
      "Tomato (Golbheda)",
      "Potato (Alu)",
      "Cauliflower (Kauli)",
      "Ginger (Aduwa)",
      "Onion (Pyaj)",
    ],
    [],
  );
  const districts = useMemo(() => ["Kathmandu", "Dhading", "Makwanpur"], []);

  const fetchLivePostings = useCallback(async () => {
    setLoading(true);
    try {
      const [listingsRes, demandsRes] = await Promise.all([
        fetch("/api/listings"),
        fetch("/api/demands"),
      ]);

      if (listingsRes.ok) {
        const rawListings: ProduceListing[] = await listingsRes.json();
        setListings(rawListings.filter((l) => l.status === "available"));
      }

      if (demandsRes.ok) {
        const rawDemands: DemandPost[] = await demandsRes.json();
        setDemands(rawDemands.filter((d) => d.status === "active"));
      }
    } catch (e) {
      console.error("Failed to load listings/demands for heatmap", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLivePostings();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLivePostings]);

  const heatmapData: HeatmapCell[] = useMemo(() => {
    return districts.flatMap((dist) =>
      crops.map((crop) => {
        const baseMatch = baseData.find(
          (b) => b.district === dist && b.crop === crop,
        );
        const baseS = baseMatch ? baseMatch.supply : 0;
        const baseD = baseMatch ? baseMatch.demand : 0;

        const liveS = listings
          .filter(
            (l) =>
              l.crop?.toLowerCase() === crop.toLowerCase() &&
              l.district?.toLowerCase() === dist.toLowerCase(),
          )
          .reduce((sum, current) => sum + (current.quantity || 0), 0);

        const liveD = demands
          .filter(
            (d) =>
              d.crop?.toLowerCase() === crop.toLowerCase() &&
              d.district?.toLowerCase() === dist.toLowerCase(),
          )
          .reduce(
            (sum, current) =>
              sum +
              (current.quantity_needed ||
                current.quantityRequired ||
                current.quantity ||
                0),
            0,
          );

        const totalSupply = baseS + liveS;
        const totalDemand = baseD + liveD;
        const opportunityIndex = totalDemand / (totalSupply || 1);

        return {
          district: dist,
          crop,
          baseSupply: baseS,
          baseDemand: baseD,
          liveSupply: liveS,
          liveDemand: liveD,
          totalSupply,
          totalDemand,
          opportunityIndex,
        };
      }),
    );
  }, [listings, demands, crops, districts]);

  const [selectedKey, setSelectedKey] = useState<string>(
    "Kathmandu-Tomato (Golbheda)",
  );

  const selectedCell = useMemo(() => {
    const found = heatmapData.find(
      (d) => `${d.district}-${d.crop}` === selectedKey,
    );
    if (found) return found;
    return (
      [...heatmapData].sort(
        (a, b) => b.opportunityIndex - a.opportunityIndex,
      )[0] || null
    );
  }, [heatmapData, selectedKey]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth =
      containerRef.current.getBoundingClientRect().width || 500;
    const height = 280;
    const margin = { top: 30, right: 20, bottom: 50, left: 95 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", containerWidth).attr("height", height);

    const chartWidth = containerWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(crops)
      .range([0, chartWidth])
      .padding(0.06);

    const yScale = d3
      .scaleBand()
      .domain(districts)
      .range([0, chartHeight])
      .padding(0.06);

    let colorScale: d3.ScaleLinear<string, string>;

    if (metric === "opportunity") {
      const maxOpportunity =
        d3.max(heatmapData, (d) => d.opportunityIndex) || 10;
      colorScale = d3
        .scaleLinear<string, string>()
        .domain([0, maxOpportunity / 2, maxOpportunity])
        .range(["#fee2e2", "#fde047", "#059669"]);
    } else if (metric === "demand") {
      const maxDemand = d3.max(heatmapData, (d) => d.totalDemand) || 5000;
      colorScale = d3
        .scaleLinear<string, string>()
        .domain([0, maxDemand])
        .range(["#eff6ff", "#1d4ed8"]);
    } else {
      const maxSupply = d3.max(heatmapData, (d) => d.totalSupply) || 5000;
      colorScale = d3
        .scaleLinear<string, string>()
        .domain([0, maxSupply])
        .range(["#f0fdf4", "#15803d"]);
    }

    const cells = g
      .selectAll<SVGGElement, HeatmapCell>(".cell-group")
      .data(heatmapData)
      .enter()
      .append("g")
      .attr("class", "cell-group")
      .style("cursor", "pointer")
      .on("click", (_: MouseEvent, d: HeatmapCell) => {
        setSelectedKey(`${d.district}-${d.crop}`);
        if (onSelectCropAndDistrict) {
          onSelectCropAndDistrict(d.crop, d.district);
        }
      });

    cells
      .append("rect")
      .attr("x", (d: HeatmapCell) => xScale(d.crop) || 0)
      .attr("y", (d: HeatmapCell) => yScale(d.district) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "#ffffff")
      .style("stroke", (d: HeatmapCell) =>
        selectedCell?.crop === d.crop && selectedCell?.district === d.district
          ? "#0f172a"
          : "none",
      )
      .style("stroke-width", (d: HeatmapCell) =>
        selectedCell?.crop === d.crop && selectedCell?.district === d.district
          ? 2.5
          : 0,
      )
      .transition()
      .duration(400)
      .attr("fill", (d: HeatmapCell) => {
        const val =
          metric === "opportunity"
            ? d.opportunityIndex
            : metric === "demand"
              ? d.totalDemand
              : d.totalSupply;
        return colorScale(val);
      });

    cells
      .append("text")
      .attr(
        "x",
        (d: HeatmapCell) => (xScale(d.crop) || 0) + xScale.bandwidth() / 2,
      )
      .attr(
        "y",
        (d: HeatmapCell) =>
          (yScale(d.district) || 0) + yScale.bandwidth() / 2 + 4,
      )
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .style("fill", (d: HeatmapCell) => {
        const val =
          metric === "opportunity"
            ? d.opportunityIndex
            : metric === "demand"
              ? d.totalDemand
              : d.totalSupply;
        return val > 3.5 || (metric !== "opportunity" && val > 3000)
          ? "#ffffff"
          : "#1e293b";
      })
      .text((d: HeatmapCell) => {
        if (metric === "opportunity") {
          return d.opportunityIndex.toFixed(1) + "x";
        }
        const num = metric === "demand" ? d.totalDemand : d.totalSupply;
        return num >= 1000 ? (num / 1000).toFixed(1) + "t" : num.toString();
      });

    cells
      .on("mouseover", (event: MouseEvent) => {
        d3.select(event.currentTarget as SVGGElement)
          .select("rect")
          .style("filter", "brightness(0.95)")
          .style("stroke", "#0f172a")
          .style("stroke-width", "2px");
      })
      .on("mouseout", (event: MouseEvent, d: HeatmapCell) => {
        const isSelected =
          selectedCell?.crop === d.crop &&
          selectedCell?.district === d.district;
        d3.select(event.currentTarget as SVGGElement)
          .select("rect")
          .style("filter", "none")
          .style("stroke", isSelected ? "#0f172a" : "none")
          .style("stroke-width", isSelected ? "2.5px" : "0px");
      });

    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call((axisGroup) => axisGroup.select(".domain").remove())
      .selectAll("text")
      .attr("transform", "rotate(-12)")
      .attr("text-anchor", "end")
      .attr("dx", "-.5em")
      .attr("dy", ".6em")
      .style("font-size", "9px")
      .style("font-weight", "bold")
      .style("fill", "#64748b");

    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .call((axisGroup) => axisGroup.select(".domain").remove())
      .selectAll("text")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "#334155");

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.getBoundingClientRect().width;
      svg.attr("width", w);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    metric,
    heatmapData,
    selectedCell,
    crops,
    districts,
    onSelectCropAndDistrict,
  ]);

  const getOpportunityCategory = (index: number) => {
    if (index >= 4.0)
      return {
        label: "🔥 Critical Demand Shortage (High Profit)",
        bg: "bg-rose-50 border-rose-200 text-rose-700",
        text: "Demand heavily exceeds supply in this district. Farmers can command peak, premium prices! Highly recommended to route your crop deliveries here.",
      };
    if (index >= 2.0)
      return {
        label: "📈 High Demand Opportunity",
        bg: "bg-amber-50 border-amber-200 text-amber-700",
        text: "Healthy demand signals. Prices are stable to upward trending. Transporting here offers great wholesale margins.",
      };
    if (index >= 0.8)
      return {
        label: "⚖️ Stable / Balanced Market",
        bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
        text: "Supply and buyer demand are closely aligned. Standard wholesale benchmark rates apply.",
      };
    return {
      label: "❄️ High Supply / Saturated",
      bg: "bg-slate-100 border-slate-200 text-slate-600",
      text: "Supply exceeds local buyer posting. Prices may face downward competitive pressure. Recommend searching other districts.",
    };
  };

  const insight = selectedCell
    ? getOpportunityCategory(selectedCell.opportunityIndex)
    : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              Regional Supply-Demand Heatmap
            </h3>
            <p className="text-xs text-slate-500">
              D3 analytical grid of relative market demand across key Nepalese
              districts.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 w-fit shrink-0">
          <button
            onClick={() => setMetric("opportunity")}
            className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition ${
              metric === "opportunity"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Opportunity Index
          </button>
          <button
            onClick={() => setMetric("demand")}
            className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition ${
              metric === "demand"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Buyer Demand
          </button>
          <button
            onClick={() => setMetric("supply")}
            className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition ${
              metric === "supply"
                ? "bg-green-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Farmer Supply
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div
            ref={containerRef}
            className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-2 relative"
          >
            <svg ref={svgRef} className="w-full mx-auto" />
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center text-xs text-slate-500 font-semibold">
                Syncing live listings...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-2 text-[10px] text-slate-400 font-mono">
            <span>Low Quantity / Ratio</span>
            {metric === "opportunity" ? (
              <div className="h-2 w-32 rounded-full bg-gradient-to-r from-red-100 via-yellow-200 to-emerald-600 border border-slate-200" />
            ) : metric === "demand" ? (
              <div className="h-2 w-32 rounded-full bg-gradient-to-r from-blue-50 to-blue-700 border border-slate-200" />
            ) : (
              <div className="h-2 w-32 rounded-full bg-gradient-to-r from-green-50 to-green-700 border border-slate-200" />
            )}
            <span>Peak Ratio</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          {selectedCell ? (
            <div className="border border-slate-250 bg-slate-50/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800 text-xs">
                    {selectedCell.district} District
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {selectedCell.crop.split(" ")[0]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Total supply volume
                  </div>
                  <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
                    {selectedCell.totalSupply.toLocaleString()}{" "}
                    <span className="text-[10px] font-normal text-slate-500">
                      KG
                    </span>
                  </div>
                  {selectedCell.liveSupply > 0 && (
                    <div className="text-[9px] text-emerald-600 font-bold mt-0.5">
                      +{selectedCell.liveSupply} KG from live listings
                    </div>
                  )}
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Buyer demand volume
                  </div>
                  <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
                    {selectedCell.totalDemand.toLocaleString()}{" "}
                    <span className="text-[10px] font-normal text-slate-500">
                      KG
                    </span>
                  </div>
                  {selectedCell.liveDemand > 0 && (
                    <div className="text-[9px] text-blue-600 font-bold mt-0.5">
                      +{selectedCell.liveDemand} KG from live posts
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Market Diagnosis
                </span>
                <div
                  className={`p-2.5 border rounded-xl font-bold text-[11px] leading-relaxed ${insight?.bg}`}
                >
                  {insight?.label}
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>Farmer Strategic Action Advice</span>
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {insight?.text}
                </p>
              </div>

              <div className="text-[9px] text-slate-400 italic flex items-center space-x-1 justify-center">
                <Info className="w-3 h-3 text-slate-300" />
                <span>
                  Computed live via real-time market indexing. Click cells to
                  view other crops.
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-400 text-xs py-12">
              <div>
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <span>
                  Click on any cell in the heatmap grid to load district
                  insights and trade advice.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
