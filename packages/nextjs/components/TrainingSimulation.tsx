"use client";

import { useEffect, useState } from "react";
import { encodePacked, keccak256 } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const TrainingSimulation = ({ datasetId }: { datasetId: number }) => {
  const { address } = useAccount();
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const { writeContractAsync: recordTraining, isPending } = useScaffoldWriteContract("AIDataMarketplace");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTraining && progress < 100) {
      timer = setTimeout(() => {
        setProgress(p => p + (Math.floor(Math.random() * 15) + 5));
        const epoch = Math.floor(progress / 10) + 1;
        const acc = (0.5 + progress * 0.0045).toFixed(4);
        const loss = (1.5 - progress * 0.012).toFixed(4);
        setLogs(prev => [`Epoch ${epoch}/10: accuracy: ${acc} - loss: ${loss}`, ...prev].slice(0, 5));
      }, 500);
    } else if (progress >= 100 && isTraining) {
      setIsTraining(false);
      submitProof();
    }
    return () => clearTimeout(timer);
  }, [isTraining, progress]);

  const startTraining = () => {
    setIsTraining(true);
    setProgress(0);
    setLogs(["Initializing Federated Learning Engine..."]);
  };

  const submitProof = async () => {
    const finalAccuracy = 9523; // 95.23%
    const simulatedModelHash = keccak256(
      encodePacked(["string", "uint256", "address"], ["FederatedModel", BigInt(Date.now()), address as `0x${string}`]),
    );

    try {
      await recordTraining({
        functionName: "recordTrainingSession",
        args: [BigInt(datasetId), BigInt(finalAccuracy), simulatedModelHash],
      });
      setLogs(prev => ["✅ Training Proof submitted on-chain!", ...prev]);
    } catch (error) {
      console.error(error);
      setLogs(prev => ["❌ Failed to submit proof on-chain.", ...prev]);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-primary/20">
      <div className="card-body">
        <h3 className="card-title font-bold text-lg mb-4">Off-chain FL Simulation</h3>

        <div className="w-full bg-base-300 rounded-full h-4 mb-4 overflow-hidden relative">
          <div
            className={`bg-primary h-4 transition-all duration-300 ${isTraining || isPending ? "animate-pulse" : ""}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary-content">
            {Math.min(progress, 100)}%
          </div>
        </div>

        <div className="bg-neutral text-neutral-content p-4 rounded-xl font-mono text-sm h-[140px] overflow-hidden flex flex-col justify-end">
          {logs.map((log, i) => (
            <div key={i} className={`opacity-${100 - i * 20}`}>
              {log}
            </div>
          ))}
          {logs.length === 0 && <div className="text-neutral-content/50 italic">Awaiting training start...</div>}
        </div>

        <div className="card-actions justify-end mt-4">
          <button
            className={`btn btn-primary w-full ${isTraining || isPending ? "loading" : ""}`}
            onClick={startTraining}
            disabled={isTraining || isPending}
          >
            {isPending ? "Submitting Proof..." : isTraining ? "Training in Progress..." : "Start Local Training"}
          </button>
          {!isTraining && progress >= 100 && !isPending && (
            <div className="text-success text-sm w-full text-center mt-2 font-bold animate-bounce">
              Training Completed Successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
