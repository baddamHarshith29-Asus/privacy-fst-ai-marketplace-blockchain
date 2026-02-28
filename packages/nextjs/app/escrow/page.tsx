"use client";

// packages/nextjs/app/escrow/page.tsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function EscrowDashboard() {
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [nextId, setNextId] = useState<number>(0);

  const { writeContractAsync: createEscrow } = useScaffoldWriteContract("Escrow");
  const { data: nextIdData } = useScaffoldReadContract({
    contractName: "Escrow",
    functionName: "nextId",
  });

  // Update nextId when contract data changes
  useEffect(() => {
    if (nextIdData) {
      const id = typeof nextIdData === "bigint" ? Number(nextIdData) : (nextIdData?.toNumber?.() ?? 0);
      setNextId(id);
    }
  }, [nextIdData]);

  const handleCreate = async () => {
    if (!provider || !amount) return;
    const wei = ethers.parseEther(amount);
    await createEscrow({
      functionName: "createEscrow",
      args: [provider],
      value: wei,
    });
  };

  return (
    <div className="p-8 bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">NeuralChain Escrow Dashboard</h1>
      <div className="card bg-base-100 shadow-xl mx-auto w-full max-w-2xl mb-8">
        <div className="card-body">
          <h2 className="card-title">Create New Escrow</h2>
          <input
            type="text"
            placeholder="Provider address"
            className="input input-bordered w-full"
            value={provider}
            onChange={e => setProvider(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount in ETH"
            className="input input-bordered w-full"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <button className="btn btn-primary mt-4" onClick={handleCreate}>
            Create Escrow
          </button>
        </div>
      </div>
      <p className="text-center text-gray-600">Current number of milestones: {nextId}</p>
    </div>
  );
}
