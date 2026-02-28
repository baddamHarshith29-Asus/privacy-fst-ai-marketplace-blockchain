"use client";

import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { CurrencyDollarIcon, DocumentTextIcon, PresentationChartLineIcon } from "@heroicons/react/24/outline";
import { DatasetCard } from "~~/components/DatasetCard";
import { StatsCard } from "~~/components/StatsCard";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function Dashboard() {
  const { address } = useAccount();

  const { data: providerDatasets, isLoading } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "getProviderDatasets",
    args: [address],
  });

  const { data: pendingEarnings } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "getPendingEarnings",
    args: [address],
  });

  const { writeContractAsync: withdraw, isPending } = useScaffoldWriteContract("AIDataMarketplace");

  const handleWithdraw = async () => {
    try {
      await withdraw({ functionName: "withdrawEarnings" });
    } catch (error) {
      console.error(error);
    }
  };

  if (!address) {
    return <div className="p-20 text-center font-bold text-xl">Please connect wallet using Monad Testnet</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-8 flex items-center justify-between">
        <span>
          Provider <span className="text-primary italic">Dashboard</span>
        </span>
        <span className="text-sm bg-base-200 px-4 py-2 rounded-full font-mono text-base-content/70">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </h1>

      {/* Provider Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatsCard
          title="Datasets Owned"
          value={providerDatasets?.length.toString() || "0"}
          icon={DocumentTextIcon}
          color="primary"
        />

        <div className={`stat bg-base-100 shadow px-6 py-4 rounded-3xl border-l-4 border-success`}>
          <div className="stat-figure text-success">
            <CurrencyDollarIcon className="w-8 h-8 cursor-pointer" />
          </div>
          <div className="stat-title font-semibold">Available for Withdrawal</div>
          <div className="stat-value text-xl md:text-3xl text-success">
            {pendingEarnings ? formatEther(pendingEarnings) : "0"} <span className="text-sm">MON</span>
          </div>
          <div className="stat-actions mt-2 text-right">
            <button
              className="btn btn-sm btn-success text-success-content"
              onClick={handleWithdraw}
              disabled={!pendingEarnings || pendingEarnings === BigInt(0) || isPending}
            >
              {isPending ? "Withdrawing..." : "Withdraw Earnings"}
            </button>
          </div>
        </div>

        <StatsCard title="Network Status" value="MONAD" icon={PresentationChartLineIcon} color="secondary" />
      </div>

      <h2 className="text-2xl font-bold mb-6 border-b border-base-content/10 pb-2">Your Hosted Datasets</h2>

      {isLoading ? (
        <div className="flex justify-center my-10">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      ) : providerDatasets && providerDatasets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providerDatasets.map((id: bigint) => (
            <DatasetCard key={id.toString()} datasetId={Number(id)} />
          ))}
        </div>
      ) : (
        <div className="bg-base-200 p-10 rounded-3xl text-center shadow-inner">
          <p className="text-lg font-medium opacity-60">You haven&apos;t uploaded any datasets yet.</p>
          <a href="/upload" className="btn btn-primary mt-4">
            Upload Dataset
          </a>
        </div>
      )}
    </div>
  );
}
