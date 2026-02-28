"use client";

import { formatEther } from "viem";
import {
  ArrowsRightLeftIcon,
  CircleStackIcon,
  CpuChipIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/outline";
import { StatsCard } from "~~/components/StatsCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function Analytics() {
  const { data: stats } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "getPlatformStats",
  });

  const datasetCount = stats ? Number(stats[0]) : 0;
  const volume = stats ? formatEther(stats[1]) : "0";
  const transactions = stats ? Number(stats[2]) : 0;
  const trainingSessions = stats ? Number(stats[3]) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-extrabold mb-10 text-center">
        Platform <span className="text-secondary">Analytics</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Datasets" value={datasetCount} icon={CircleStackIcon} color="primary" />
        <StatsCard
          title="All-Time Volume (MON)"
          value={Number(volume).toFixed(4)}
          icon={PresentationChartBarIcon}
          color="success"
        />
        <StatsCard title="Total Transactions" value={transactions} icon={ArrowsRightLeftIcon} color="secondary" />
        <StatsCard title="Training Executions" value={trainingSessions} icon={CpuChipIcon} color="warning" />
      </div>

      <div className="mt-16 bg-base-100 p-8 rounded-3xl shadow-xl border border-secondary/20">
        <h2 className="text-2xl font-bold mb-6 text-center">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="text-sm font-bold bg-base-200">
              <tr>
                <th>Type</th>
                <th>Dataset ID</th>
                <th>Amount / Accuracy</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {/* In a real app we would index events with The Graph / Ponder. 
                            For this demo, we mock recent activity or rely on direct contract calls if available */}
              <tr>
                <td colSpan={4} className="text-center py-10 opacity-60 italic">
                  Index service required to fetch historical events. (Hint: Use Ponder or The Graph for production)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
