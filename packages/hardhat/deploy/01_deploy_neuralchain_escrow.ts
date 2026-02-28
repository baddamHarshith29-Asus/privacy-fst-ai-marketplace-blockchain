import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * Deploy Reputation, Staking, and Escrow contracts.
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    // Deploy Reputation
    const reputation = await deploy("Reputation", {
        from: deployer,
        args: [],
        log: true,
    });

    // Deploy Staking with Reputation address
    const staking = await deploy("Staking", {
        from: deployer,
        args: [reputation.address],
        log: true,
    });

    // Deploy Escrow with Reputation address
    const escrow = await deploy("Escrow", {
        from: deployer,
        args: [reputation.address],
        log: true,
    });

    console.log("Deployed contracts:", {
        Reputation: reputation.address,
        Staking: staking.address,
        Escrow: escrow.address,
    });
};

export default func;
func.tags = ["NeuralChainEscrow"];
