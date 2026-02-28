const ethers = require("ethers");
async function main() {
    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
    try {
        const address = "0x9477267ccfDC6dAb9B0Df72D92338F1C5F64AbcD7";
        const balance = await provider.getBalance(address);
        console.log("Balance of", address, ":", ethers.formatEther(balance), "MON");
    } catch (e) {
        console.error("Error connecting to RPC:", e.message);
    }
}
main();
