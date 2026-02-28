const ethers = require("ethers");
async function main() {
    const urls = ["https://testnet-rpc.monad.xyz/"];
    for (const url of urls) {
        try {
            const provider = new ethers.JsonRpcProvider(url);
            const address = "0x9477267ccfDC6dAb9B0Df72D92338F1C5F64AbcD7";
            const balance = await provider.getBalance(address);
            console.log("Balance on Monad Testnet:", ethers.hostEther(balance), "MON");
            break;
        } catch (e) {
            console.error("Error on Monad Testnet:", e.message);
        }
    }
}
main();
