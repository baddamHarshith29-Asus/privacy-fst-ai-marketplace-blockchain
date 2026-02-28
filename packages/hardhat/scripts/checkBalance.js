const ethers = require("ethers");
async function main() {
    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
    try {
        const balance = await provider.getBalance("0x68f09b99509007A429b46A53938171290F94Fa21");
        console.log("Balance of 0x68f09b99509007A429b46A53938171290F94Fa21:", ethers.formatEther(balance), "MON");
    } catch (e) {
        console.error("Error connecting to RPC:", e.message);
    }
}
main();
