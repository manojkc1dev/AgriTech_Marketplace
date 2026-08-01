import React, { useState, useEffect } from "react";
import { ApiLogEntry } from "../types";
import { Terminal, Trash2, RefreshCw, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Send, ArrowRight } from "lucide-react";

export default function ApiLogger() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (!res.ok) return;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
        }
      }
    } catch {
      // Silently ignore temporary network glitches during polling
    }
  };

  const clearLogs = async () => {
    try {
      await fetch("/api/logs/clear", { method: "POST" });
      setLogs([]);
    } catch (e) {
      console.error("Failed to clear logs:", e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 1500);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Build curl representation
  const getCurlCmd = (log: ApiLogEntry) => {
    let curl = `curl -X ${log.method} "${window.location.origin}${log.url}"`;
    if (log.headers.authorization) {
      curl += ` \\\n  -H "Authorization: ${log.headers.authorization}"`;
    }
    if (log.headers["content-type"]) {
      curl += ` \\\n  -H "Content-Type: ${log.headers["content-type"]}"`;
    }
    if (log.requestBody && Object.keys(log.requestBody).length > 0) {
      curl += ` \\\n  -d '${JSON.stringify(log.requestBody, null, 2)}'`;
    }
    return curl;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full font-mono text-xs">
      <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Terminal className="w-4 h-4 animate-pulse" />
          <span className="font-semibold tracking-wider uppercase text-slate-200">
            API Traffic Inspector
          </span>
          <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-sans">
            Live REST Logs
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLogs}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={clearLogs}
            className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
            title="Clear traffic logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="flex-1 overflow-y-auto max-h-[380px] min-h-[180px] p-2 space-y-2 bg-slate-950/80">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-center py-8 font-sans">
              No API requests captured yet. Use the dashboard to make requests.
            </div>
          ) : (
            logs.map((log) => {
              const isOk = log.responseStatus >= 200 && log.responseStatus < 300;
              const isExpanded = expandedId === log.id;

              return (
                <div
                  key={log.id}
                  className={`border rounded-lg transition-all ${
                    isExpanded ? "border-slate-700 bg-slate-900" : "border-slate-800 bg-slate-950/50 hover:bg-slate-900/30"
                  }`}
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex items-center justify-between p-2.5 cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-2 overflow-hidden mr-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase min-w-[50px] text-center ${
                          log.method === "POST"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : log.method === "PATCH"
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-slate-300 truncate tracking-wide text-[11px]">
                        {log.url}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`flex items-center space-x-1 font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                          isOk 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {isOk ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>{log.responseStatus}</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-800 space-y-3 text-[11px] text-slate-400">
                      {/* Curl Command */}
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1 flex items-center justify-between">
                          <span>cURL Equivalent</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(getCurlCmd(log));
                            }}
                            className="text-slate-400 hover:text-emerald-400 transition font-sans text-[9px] bg-slate-800 px-1.5 py-0.5 rounded"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-emerald-300 overflow-x-auto text-[10px] leading-relaxed whitespace-pre font-mono">
                          {getCurlCmd(log)}
                        </pre>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Request Payload */}
                        <div>
                          <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                            Request Body
                          </div>
                          {log.requestBody && Object.keys(log.requestBody).length > 0 ? (
                            <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-sky-300 overflow-x-auto text-[10px] whitespace-pre-wrap max-h-32">
                              {JSON.stringify(log.requestBody, null, 2)}
                            </pre>
                          ) : (
                            <div className="italic text-slate-600 bg-slate-950/40 p-2 rounded border border-slate-800/40">
                              No request body
                            </div>
                          )}
                        </div>

                        {/* Response Payload */}
                        <div>
                          <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                            Response JSON
                          </div>
                          {log.responseBody ? (
                            <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-amber-300 overflow-x-auto text-[10px] whitespace-pre-wrap max-h-32">
                              {JSON.stringify(log.responseBody, null, 2)}
                            </pre>
                          ) : (
                            <div className="italic text-slate-600 bg-slate-950/40 p-2 rounded border border-slate-800/40">
                              Empty response
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Request Header */}
                      {log.headers.authorization && (
                        <div>
                          <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1">
                            Auth Header Sent
                          </div>
                          <div className="bg-slate-950/50 p-1.5 px-2 rounded border border-slate-800 text-slate-500 text-[10px] select-all">
                            {log.headers.authorization}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
