import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploy the AI Data Marketplace system on Monad
 * Deployment order:
 * 1. AccessManager
 * 2. RoyaltyManager (with deployer as initial fee recipient)
 * 3. AIDataMarketplace (linking both managers)
 * 4. Wire up AccessManager & RoyaltyManager to the marketplace address
 */
const deployAIDataMarketplace: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    console.log("\n🧠 Deploying AI Data Marketplace to Monad...");
    console.log("📍 Deployer:", deployer);
    console.log("🌐 Network:", hre.network.name);

    // ─── 1. Deploy AccessManager ──────────────────────────────────────────────
    console.log("\n[1/3] Deploying AccessManager...");
    const accessManager = await deploy("AccessManager", {
        from: deployer,
        args: [],
        log: true,
        autoMine: true,
    });
    console.log("✅ AccessManager deployed at:", accessManager.address);

    // ─── 2. Deploy RoyaltyManager ─────────────────────────────────────────────
    console.log("\n[2/3] Deploying RoyaltyManager...");
    const royaltyManager = await deploy("RoyaltyManager", {
        from: deployer,
        args: [deployer], // initial fee recipient = deployer
        log: true,
        autoMine: true,
    });
    console.log("✅ RoyaltyManager deployed at:", royaltyManager.address);

    // ─── 3. Deploy AIDataMarketplace ─────────────────────────────────────────
    console.log("\n[3/3] Deploying AIDataMarketplace...");
    const marketplace = await deploy("AIDataMarketplace", {
        from: deployer,
        args: [accessManager.address, royaltyManager.address],
        log: true,
        autoMine: true,
    });
    console.log("✅ AIDataMarketplace deployed at:", marketplace.address);

    // ─── 4. Wire up contracts ─────────────────────────────────────────────────
    console.log("\n🔗 Wiring up contracts...");

    try {
        const accessManagerContract = await hre.ethers.getContract("AccessManager", deployer);
        const royaltyManagerContract = await hre.ethers.getContract("RoyaltyManager", deployer);

        const tx1 = await accessManagerContract.setMarketplace(marketplace.address);
        await tx1.wait();
        console.log("✅ AccessManager → marketplace set");

        const tx2 = await royaltyManagerContract.setMarketplace(marketplace.address);
        await tx2.wait();
        console.log("✅ RoyaltyManager → marketplace set");
    } catch (err) {
        console.error("🚨 WIRING ERROR:", err);
    }

    // ─── Summary ──────────────────────────────────────────────────────────────
    console.log("\n🎉 Deployment Complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📦 AIDataMarketplace:", marketplace.address);
    console.log("🔐 AccessManager:    ", accessManager.address);
    console.log("💰 RoyaltyManager:   ", royaltyManager.address);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("\n🌍 Network:", hre.network.name.toUpperCase());
        console.log("🔗 View on Monad Explorer: https://testnet.monadexplorer.com/address/" + marketplace.address);
    }
};

export default deployAIDataMarketplace;
deployAIDataMarketplace.tags = ["AIDataMarketplace", "AccessManager", "RoyaltyManager"];
