/**
 * IPFS utility functions for uploading and fetching metadata.
 * Since we don't have a backend we simulate the IPFS pin or use public gateways.
 */

export const uploadToIPFS = async (fileKeyText: string, datasetContents: string) => {
  // In a production app, we would use Pinata, Infura, or web3.storage.
  // Here we simulate the CID generation
  try {
    console.log(`Encrypting and wrapping dataset: ${fileKeyText}`);
    // Simulate delay
    await new Promise(r => setTimeout(r, 1500));

    // Simulating a real CID v1 format (bafy...)
    const hashPart = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return `bafkrei${hashPart}mockcid123`;
  } catch (e) {
    console.error("IPFS Upload Failed", e);
    throw e;
  }
};

export const fetchFromIPFS = async (cid: string) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: "Mock dataset contents. Decryption successful.",
        cid: cid,
      });
    }, 1000);
  });
};
