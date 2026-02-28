"use client";

import { useAccount } from "wagmi";
import { BeakerIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { TrainingSimulation } from "~~/components/TrainingSimulation";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function AITrainingLab() {
  const { address } = useAccount();

  const { data: activeDatasets, isLoading } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "getActiveDatasets",
  });

  // Since we can't reliably loop hooks, we'll ask the user to input the ID
  // or provide the dataset ID via query param. To keep it robust, we'll list ALL
  // datasets but indicate accessibility.

  if (!address) {
    return <div className="p-20 text-center font-bold text-xl">Please connect wallet</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-4 flex items-center gap-4 border-b pb-4">
        <BeakerIcon className="w-10 h-10 text-secondary" />
        Federated Learning <span className="text-secondary italic">Lab</span>
      </h1>

      <p className="text-lg opacity-80 mb-10 max-w-2xl">
        Train off-chain models securely using zero-knowledge ML proofs. Your local environment pulls encrypted datasets
        from IPFS, decrypts locally, trains the model, and submit training proofs back to Monad.
      </p>

      {isLoading ? (
        <div className="flex justify-center">
          <span className="loading loading-bars text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          {activeDatasets?.map((id: bigint) => (
            <TrainingInterface key={id.toString()} datasetId={Number(id)} userAddress={address} />
          ))}
          {activeDatasets?.length === 0 && (
            <p className="text-center opacity-50">No datasets available for training.</p>
          )}
        </div>
      )}
    </div>
  );
}

const TrainingInterface = ({ datasetId, userAddress }: { datasetId: number; userAddress: string }) => {
  const { data: hasAccess } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "hasAccess",
    args: [BigInt(datasetId), userAddress],
  });

  const { data: dataset } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "getDataset",
    args: [BigInt(datasetId)],
  });

  const isOwner = dataset?.owner === userAddress;
  const canAccess = hasAccess || isOwner;

  if (!dataset) return null;

  return (
    <div
      className={`p-6 rounded-3xl border-2 transition-all ${canAccess ? "border-primary/40 bg-base-100 shadow-xl" : "border-base-300 bg-base-200/50 opacity-70"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Dataset #{datasetId}: {dataset.category}
        </h2>
        {!canAccess && (
          <span className="badge badge-neutral gap-1">
            <LockClosedIcon className="w-4 h-4" /> Locked
          </span>
        )}
      </div>
      <p className="text-sm mb-6 opacity-80">{dataset.description}</p>

      {canAccess ? (
        <TrainingSimulation datasetId={datasetId} />
      ) : (
        <div className="bg-base-300 rounded-xl p-8 text-center text-sm">
          You do not have access to train on this dataset. Purchase it in the marketplace first.
        </div>
      )}
    </div>
  );
};
