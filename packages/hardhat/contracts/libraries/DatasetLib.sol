// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DatasetLib
 * @dev Library containing shared structs and utility functions for the AI Data Marketplace
 */
library DatasetLib {
    // ─── Structs ──────────────────────────────────────────────────────────────

    struct Dataset {
        uint256 id;
        address owner;
        string ipfsCID;              // IPFS content identifier for encrypted dataset
        string encryptedKeyHash;     // Hash of encryption key (never store key on-chain)
        uint256 price;               // Price in wei (MON tokens)
        bool isActive;
        uint256 totalSales;
        uint256 totalRevenue;
        string category;             // "CV", "NLP", "Audio", "Tabular", "Multimodal"
        string description;
        uint256 createdAt;
        uint256 lastUpdatedAt;
        uint256 trainingSessionCount;
    }

    struct TrainingSession {
        uint256 datasetId;
        address trainer;
        uint256 accuracy;            // Accuracy * 100 (e.g., 9523 = 95.23%)
        bytes32 modelHash;           // Hash of the trained model
        uint256 timestamp;
    }

    struct PurchaseRecord {
        uint256 datasetId;
        address buyer;
        uint256 pricePaid;
        uint256 timestamp;
    }

    // ─── Pure Functions ───────────────────────────────────────────────────────

    /**
     * @dev Calculates platform fee from a given amount (2%)
     */
    function calculatePlatformFee(uint256 amount) internal pure returns (uint256) {
        return (amount * 200) / 10000; // 2%
    }

    /**
     * @dev Calculates provider earnings after platform fee (98%)
     */
    function calculateProviderEarnings(uint256 amount) internal pure returns (uint256) {
        return amount - calculatePlatformFee(amount);
    }

    /**
     * @dev Validates IPFS CID format (basic check)
     */
    function isValidCID(string calldata cid) internal pure returns (bool) {
        bytes memory cidBytes = bytes(cid);
        return cidBytes.length >= 46 && cidBytes.length <= 64;
    }

    /**
     * @dev Validates dataset category
     */
    function isValidCategory(string calldata category) internal pure returns (bool) {
        bytes32 cat = keccak256(bytes(category));
        return (
            cat == keccak256(bytes("CV")) ||
            cat == keccak256(bytes("NLP")) ||
            cat == keccak256(bytes("Audio")) ||
            cat == keccak256(bytes("Tabular")) ||
            cat == keccak256(bytes("Multimodal")) ||
            cat == keccak256(bytes("Reinforcement")) ||
            cat == keccak256(bytes("TimeSeries")) ||
            cat == keccak256(bytes("Other"))
        );
    }
}
