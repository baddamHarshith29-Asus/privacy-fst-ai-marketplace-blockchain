"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { CpuChipIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const DatasetCard = ({ datasetId }: { datasetId: number }) => {
  const { address } = useAccount();

  const { data: dataset } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "getDataset",
    args: [BigInt(datasetId)],
  });

  const { data: hasAccess } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "hasAccess",
    args: [BigInt(datasetId), address],
  });

  const { writeContractAsync: purchaseDataset, isPending } = useScaffoldWriteContract("AIDataMarketplace");

  const handlePurchase = async () => {
    if (!dataset) return;
    try {
      await purchaseDataset({
        functionName: "purchaseDataset",
        args: [BigInt(datasetId)],
        value: dataset.price,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!dataset) return <div className="animate-pulse flex space-x-4 bg-base-200 p-6 rounded-3xl h-[200px]"></div>;

  const isOwner = address === dataset.owner;
  const canAccess = hasAccess || isOwner;

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 hover:border-primary transition-all duration-300">
      <div className="card-body p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="badge badge-primary mb-2 font-semibold">{dataset.category}</div>
            <h2 className="card-title text-xl mb-1 flex items-center gap-2">
              Dataset #{dataset.id.toString()}
              {canAccess ? (
                <LockOpenIcon className="w-5 h-5 text-success" />
              ) : (
                <LockClosedIcon className="w-5 h-5 text-neutral" />
              )}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold block">{formatEther(dataset.price)} MON</span>
            <span className="text-xs text-base-content/60">{dataset.totalSales.toString()} sales</span>
          </div>
        </div>

        <p className="text-base-content/80 text-sm mt-3 line-clamp-2 min-h-[40px]">{dataset.description}</p>

        <div className="flex flex-wrap gap-2 mt-4 text-xs font-medium text-base-content/60">
          <span className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md">
            <CpuChipIcon className="w-4 h-4" />
            {dataset.trainingSessionCount.toString()} Models Trained
          </span>
          <span className="bg-base-200 px-2 py-1 rounded-md truncate max-w-[150px]">
            Owner: {dataset.owner.substring(0, 6)}...{dataset.owner.substring(38)}
          </span>
        </div>

        <div className="card-actions justify-end mt-4 pt-4 border-t border-base-300">
          {canAccess ? (
            <div className="flex w-full gap-2">
              <a href="/ai-training" className="btn btn-secondary btn-sm grow">
                Simulate Training
              </a>
              <button className="btn btn-outline btn-sm grow disabled">
                View Data (CID: {dataset.ipfsCID.substring(0, 6)}...)
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm w-full font-bold"
              onClick={handlePurchase}
              disabled={isPending || !dataset.isActive}
            >
              {isPending ? <span className="loading loading-spinner loading-xs"></span> : "Buy Access Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
