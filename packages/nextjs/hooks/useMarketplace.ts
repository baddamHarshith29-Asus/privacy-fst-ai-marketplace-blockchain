import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldContract";

/**
 * Custom hook to interact with the AIDataMarketplace contract
 */
export const useMarketplace = () => {
  const { address } = useAccount();
  const writeTx = useTransactor();
  const { writeContractAsync } = useWriteContract();

  // -- Reads --

  // Get all dataset IDs
  const { data: allDatasetIds, isLoading: isLoadingIds } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "getAllDatasetIds",
  });

  // Get provider earnings
  const { data: pendingEarnings } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "getPendingEarnings",
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  const { data: platformStats } = useScaffoldReadContract({
    contractName: "AIDataMarketplace",
    functionName: "getPlatformStats",
  });

  // -- Writes --

  const [isRegistering, setIsRegistering] = useState(false);
  const registerDataset = async (
    ipfsCID: string,
    keyHash: string,
    priceInEth: string,
    category: string,
    description: string,
  ) => {
    setIsRegistering(true);
    try {
      const priceWei = parseEther(priceInEth);
      const { writeContractAsync } = await import("~~/hooks/scaffold-eth/useScaffoldWriteContract");

      // Assuming we use scaffold-eth provided hooks correctly,
      // since we do not have direct access to write yet, we will rely on wagmi mostly
      const tx = await writeTx(
        () =>
          writeContractAsync({
            abi: [], // Fallback if scaffold wrapper is used
            address: "0x", // Same here
            // Note: since scaffold-eth abstracts this nicely:
          } as any) as any,
      ); // Ignoring proper wagmi typing here for scaffold wrapper compatibility

      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    allDatasetIds,
    isLoadingIds,
    pendingEarnings,
    platformStats,
    registerDataset,
    isRegistering,
  };
};
