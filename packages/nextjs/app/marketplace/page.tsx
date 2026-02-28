"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DatasetCard } from "~~/components/DatasetCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function Marketplace() {
  const { data: activeDatasets, isLoading } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "getActiveDatasets",
  });

  const [filterCategory, setFilterCategory] = useState("All");

  const categories = ["All", "CV", "NLP", "Audio", "Tabular", "Multimodal", "Other"];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-center lg:text-left">
        Decentralized AI Data <span className="text-primary underline decoration-secondary">Marketplace</span>
      </h1>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-10 bg-base-200 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${filterCategory === cat ? "btn-primary shadow-lg shadow-primary/30" : "btn-ghost"}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral/50" />
          <input
            type="text"
            placeholder="Search IPFS CID or description..."
            className="input input-bordered w-full pl-10 h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Dataset Grid */}
      {isLoading ? (
        <div className="flex justify-center my-20">
          <span className="loading loading-ring loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {!activeDatasets || activeDatasets.length === 0 ? (
            <div className="col-span-full h-[50vh] flex flex-col justify-center items-center text-center opacity-70">
              <span className="text-6xl mb-4 opacity-50">📂</span>
              <p className="text-2xl font-bold">No Datasets Found</p>
              <p className="mt-2">Be the first to upload and monetize your data.</p>
              <a
                href="/upload"
                className="btn btn-secondary mt-6 rounded-full px-8 shadow-md hover:shadow-xl transition-all"
              >
                Upload Data
              </a>
            </div>
          ) : (
            activeDatasets.map((id: bigint) => <DatasetCard key={id.toString()} datasetId={Number(id)} />)
          )}
        </div>
      )}
    </div>
  );
}
