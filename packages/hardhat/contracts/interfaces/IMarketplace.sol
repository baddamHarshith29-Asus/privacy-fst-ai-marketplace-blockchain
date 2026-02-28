// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IMarketplace
 * @dev Interface for the AI Data Marketplace on Monad
 */
interface IMarketplace {
    // ─── Events ───────────────────────────────────────────────────────────────
    event DatasetRegistered(
        uint256 indexed id,
        address indexed owner,
        string ipfsCID,
        uint256 price,
        string category
    );
    event DatasetPurchased(
        uint256 indexed id,
        address indexed buyer,
        uint256 price,
        uint256 timestamp
    );
    event EarningsWithdrawn(address indexed provider, uint256 amount);
    event TrainingSessionRecorded(
        uint256 indexed datasetId,
        address indexed trainer,
        uint256 accuracy,
        bytes32 modelHash
    );
    event DatasetDeactivated(uint256 indexed id);
    event PriceUpdated(uint256 indexed id, uint256 newPrice);

    // ─── Core Functions ───────────────────────────────────────────────────────
    function registerDataset(
        string calldata ipfsCID,
        string calldata encryptedKeyHash,
        uint256 price,
        string calldata category,
        string calldata description
    ) external returns (uint256 datasetId);

    function purchaseDataset(uint256 datasetId) external payable;

    function recordTrainingSession(
        uint256 datasetId,
        uint256 accuracy,
        bytes32 modelHash
    ) external;

    function withdrawEarnings() external;

    function deactivateDataset(uint256 datasetId) external;

    function updatePrice(uint256 datasetId, uint256 newPrice) external;

    // ─── View Functions ───────────────────────────────────────────────────────
    function hasAccess(uint256 datasetId, address user) external view returns (bool);

    function getDatasetCount() external view returns (uint256);

    function getPendingEarnings(address provider) external view returns (uint256);
}
