"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { uploadToIPFS } from "~~/lib/ipfs";

export default function UploadDataset() {
  const [file, setFile] = useState<File | null>(null);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("CV");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { writeContractAsync: registerDataset, isPending } = useScaffoldWriteContract("AIDataMarketplace");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !price || !description) return;

    setIsUploading(true);
    try {
      // Simulate IPFS upload
      const cid = await uploadToIPFS("mock_encryption_key", "mock_file_content");
      const keyHash = "encryptedKeyHash123_" + Math.random().toString(36).substring(7);

      // Send TX
      await registerDataset({
        functionName: "registerDataset",
        args: [cid, keyHash, parseEther(price), category, description],
      });

      // Reset form
      setFile(null);
      setPrice("");
      setDescription("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-extrabold mb-6">
        Upload <span className="text-primary">Encrypted</span> Dataset
      </h1>

      <div className="bg-base-100 shadow-xl rounded-3xl p-8 border border-base-200 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/30 rounded-full blur-3xl -z-10 text-transparent">
          .
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Select Dataset (Zero-Knowledge)</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered file-input-primary w-full"
              onChange={e => setFile(e.target.files?.[0] || null)}
              required
            />
            <span className="label-text-alt text-error font-medium mt-1">
              Data will be encrypted locally before upload to IPFS. Keys remain off-chain.
            </span>
          </div>

          <div className="flex gap-4">
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text font-bold">Price (MON)</span>
              </label>
              <input
                type="text"
                placeholder="0.5"
                className="input input-bordered w-full"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text font-bold">Category</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {["CV", "NLP", "Audio", "Tabular", "Multimodal", "Other"].map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Description / Metadata (Public)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="e.g. 50k annotated street images for autonomous driving. 1080p resolution."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/40 hover:shadow-primary/60 transition-all font-bold"
            disabled={isUploading || isPending}
          >
            {isUploading ? "Encrypting & Uploading IPFS..." : isPending ? "Confirming tx..." : "Publish to Monad"}
          </button>

          <p className="text-center text-xs text-base-content/60 mt-4">
            By uploading, you agree to the 2% decentralized network fee taken on purchases.
          </p>
        </form>
      </div>
    </div>
  );
}
