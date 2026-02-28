# 🧠 Monad AI Data Marketplace

<h4 align="center">
  <b>Decentralized, Privacy-Preserving AI Training on Monad</b>
</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-Monad-6347FF?style=for-the-badge" alt="Monad">
  <img src="https://img.shields.io/badge/Language-Solidity-363636?style=for-the-badge&logo=solidity" alt="Solidity">
  <img src="https://img.shields.io/badge/Frontend-Next.js%2015-000000?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
</p>

---

## 🌟 Vision

A decentralized marketplace where data providers monetize encrypted AI datasets, and AI developers purchase access to train models securely. Powered by **Monad's high-performance L1**, this platform ensures lightning-fast transactions, low fees, and cryptographically verifiable AI training sessions.

## 🚀 Key Features

- ⚡ **High-Performance L1**: Built on Monad, capable of 10,000+ TPS with parallel execution.
- 🔐 **Privacy-First Storage**: Datasets are encrypted locally and stored on IPFS. Only CIDs and key hashes are stored on-chain.
- 💸 **Fair Royalties**: Automated distribution—98% to data providers and 2% platform fee.
- 🧪 **Federated Learning Lab**: Simulate off-chain model training and submit on-chain proofs of completion.
- 📊 **Real-time Analytics**: Platform-wide stats including volume, transaction count, and active datasets.

## 🏗 System Architecture

The marketplace consists of three core smart contracts:

1.  **`AIDataMarketplace.sol`**: The main entry point for dataset registration, purchases, and training proofs.
2.  **`AccessManager.sol`**: Handles post-purchase access control logic.
3.  **`RoyaltyManager.sol`**: Manages fee distribution and secure provider withdrawals.

## 🛠 Tech Stack

- **L1 Blockchain**: Monad (Testnet)
- **Smart Contracts**: Solidity 0.8.30 + Hardhat
- **Frontend**: Next.js 15 + Tailwind CSS + DaisyUI
- **Web3 Tools**: Scaffold-ETH 2 + Wagmi + Viem + RainbowKit
- **Storage**: IPFS (Simulated/Ready for Pinata)

---

## 🏃‍♂️ Quickstart

### 1. Requirements
- Node.js >= 20.18.3
- Yarn
- Git
- MetaMask (connected to Monad Testnet)

### 2. Setup Environment
Go to `packages/hardhat` and create a `.env` file:
```env
DEPLOYER_PRIVATE_KEY="YOUR_PRIVATE_KEY"
```

### 3. Install & Start
```bash
# 1. Install dependencies
yarn install

# 2. Start local chain (optional for local testing)
yarn chain

# 3. Deploy to Monad Testnet
yarn deploy --network monadTestnet

# 4. Start the frontend
yarn start
```

## 🧪 Testing the Loop

1. **Upload**: Visit `/upload` to encrypt and publish a dataset to Monad.
2. **Browse**: Check `/marketplace` to see all active datasets.
3. **Dashboard**: Manage your earnings and withdrawals at `/dashboard`.
4. **Train**: Run a simulation at `/ai-training` to submit a "Proof of Training" to the blockchain.

---

Built with ❤️ for the Monad Ecosystem.