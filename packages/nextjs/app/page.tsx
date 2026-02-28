"use client";

import Link from "next/link";
import { BanknotesIcon, CircleStackIcon, CommandLineIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10 px-4">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse-fast pointer-events-none"></div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            The Data <span className="text-primary underline decoration-wavy decoration-secondary">Economy</span> <br />
            for Decentralized AI
          </h1>

          <p className="text-xl md:text-2xl text-base-content/80 mb-10 max-w-2xl mx-auto font-light">
            Buy, sell, and train on encrypted datasets via Monad. Zero reliance on centralized clouds. 100% on-chain
            attribution.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/marketplace"
              className="btn btn-primary btn-lg rounded-full shadow-lg shadow-primary/30 w-full sm:w-auto px-10"
            >
              Explore Datasets
            </Link>
            <Link href="/upload" className="btn btn-outline btn-lg rounded-full w-full sm:w-auto px-10 bg-base-100">
              Upload & Earn
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto px-4 pb-20 mt-10">
          <FeatureCard
            icon={<LockClosedIcon className="w-10 h-10 text-primary" />}
            title="Encrypted Storage"
            desc="Datasets are encrypted locally and stored on IPFS. Keys are decentralized."
          />
          <FeatureCard
            icon={<CommandLineIcon className="w-10 h-10 text-secondary" />}
            title="Monad Performance"
            desc="10k TPS execution means instant access grants and proof submissions."
          />
          <FeatureCard
            icon={<CircleStackIcon className="w-10 h-10 text-accent" />}
            title="Federated Learning"
            desc="Train models locally and submit zero-knowledge proofs on-chain."
          />
          <FeatureCard
            icon={<BanknotesIcon className="w-10 h-10 text-success" />}
            title="Fair Royalties"
            desc="Providers earn 98% of all sales. Smart contract splits are automated."
          />
        </div>
      </div>
    </>
  );
}

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="card bg-base-100 shadow-xl border border-base-200 hover:-translate-y-2 transition-transform duration-300">
    <div className="card-body items-center text-center">
      <div className="mb-4 bg-base-200 p-4 rounded-full">{icon}</div>
      <h3 className="card-title text-xl mb-2">{title}</h3>
      <p className="text-base-content/70">{desc}</p>
    </div>
  </div>
);
