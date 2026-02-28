// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IMarketplace.sol";
import "./libraries/DatasetLib.sol";
import "./AccessManager.sol";
import "./RoyaltyManager.sol";

/**
 * @title AIDataMarketplace
 * @dev Core AI Data Marketplace contract deployed on Monad.
 *      Enables privacy-preserving AI dataset transactions with:
 *      - IPFS-based encrypted storage (CID on-chain only)
 *      - MON token payments
 *      - 2% platform fee, 98% to providers
 *      - On-chain training session proofs
 *      - Access control via AccessManager
 *      - Royalty distribution via RoyaltyManager
 */
contract AIDataMarketplace is IMarketplace, Ownable, Pausable, ReentrancyGuard {
    using DatasetLib for DatasetLib.Dataset;

    // ─── State Variables ──────────────────────────────────────────────────────

    AccessManager public accessManager;
    RoyaltyManager public royaltyManager;

    uint256 private _datasetCounter;

    // datasetId => Dataset
    mapping(uint256 => DatasetLib.Dataset) private _datasets;

    // provider => list of dataset IDs they own
    mapping(address => uint256[]) private _providerDatasets;

    // datasetId => TrainingSession[]
    mapping(uint256 => DatasetLib.TrainingSession[]) private _trainingSessions;

    // datasetId => buyer => purchase record
    mapping(uint256 => mapping(address => DatasetLib.PurchaseRecord)) private _purchases;

    // All dataset IDs (for enumeration)
    uint256[] private _allDatasetIds;

    // Total platform statistics
    uint256 public totalVolume;
    uint256 public totalTransactions;
    uint256 public totalTrainingSessions;

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _accessManager, address _royaltyManager) Ownable(msg.sender) {
        require(_accessManager != address(0), "AIDataMarketplace: zero access manager");
        require(_royaltyManager != address(0), "AIDataMarketplace: zero royalty manager");
        accessManager = AccessManager(_accessManager);
        royaltyManager = RoyaltyManager(payable(_royaltyManager));
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Register a new encrypted AI dataset on Monad
     * @param ipfsCID IPFS CID of the encrypted dataset
     * @param encryptedKeyHash Hash of the encryption key (key itself never on-chain)
     * @param price Price in wei (MON tokens)
     * @param category Dataset category (CV, NLP, Audio, Tabular, Multimodal, etc.)
     * @param description Human-readable description
     */
    function registerDataset(
        string calldata ipfsCID,
        string calldata encryptedKeyHash,
        uint256 price,
        string calldata category,
        string calldata description
    ) external override whenNotPaused returns (uint256 datasetId) {
        require(bytes(ipfsCID).length >= 10, "AIDataMarketplace: invalid CID");
        require(bytes(encryptedKeyHash).length > 0, "AIDataMarketplace: missing key hash");
        require(price > 0, "AIDataMarketplace: price must be > 0");
        require(bytes(category).length > 0, "AIDataMarketplace: missing category");
        require(bytes(description).length > 0, "AIDataMarketplace: missing description");

        datasetId = _datasetCounter++;

        _datasets[datasetId] = DatasetLib.Dataset({
            id: datasetId,
            owner: msg.sender,
            ipfsCID: ipfsCID,
            encryptedKeyHash: encryptedKeyHash,
            price: price,
            isActive: true,
            totalSales: 0,
            totalRevenue: 0,
            category: category,
            description: description,
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp,
            trainingSessionCount: 0
        });

        _providerDatasets[msg.sender].push(datasetId);
        _allDatasetIds.push(datasetId);

        emit DatasetRegistered(datasetId, msg.sender, ipfsCID, price, category);
    }

    /**
     * @notice Purchase access to a dataset (pay in MON)
     * @param datasetId ID of the dataset to purchase
     */
    function purchaseDataset(uint256 datasetId) external payable override whenNotPaused nonReentrant {
        DatasetLib.Dataset storage dataset = _datasets[datasetId];

        require(dataset.owner != address(0), "AIDataMarketplace: dataset not found");
        require(dataset.isActive, "AIDataMarketplace: dataset not active");
        require(msg.sender != dataset.owner, "AIDataMarketplace: owner cannot buy own dataset");
        require(!accessManager.hasAccess(datasetId, msg.sender), "AIDataMarketplace: already purchased");
        require(msg.value >= dataset.price, "AIDataMarketplace: insufficient payment");

        // Update dataset stats
        dataset.totalSales++;
        dataset.totalRevenue += msg.value;
        dataset.lastUpdatedAt = block.timestamp;

        // Record purchase
        _purchases[datasetId][msg.sender] = DatasetLib.PurchaseRecord({
            datasetId: datasetId,
            buyer: msg.sender,
            pricePaid: msg.value,
            timestamp: block.timestamp
        });

        // Update global stats
        totalVolume += msg.value;
        totalTransactions++;

        // Grant access via AccessManager
        accessManager.grantAccess(datasetId, msg.sender);

        // Distribute royalties via RoyaltyManager (2% platform, 98% provider)
        royaltyManager.distribute{value: msg.value}(datasetId, dataset.owner);

        // Refund excess payment
        if (msg.value > dataset.price) {
            uint256 excess = msg.value - dataset.price;
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "AIDataMarketplace: refund failed");
        }

        emit DatasetPurchased(datasetId, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Record a training session with proof of training
     * @param datasetId Dataset used for training
     * @param accuracy Model accuracy * 100 (e.g., 9523 = 95.23%)
     * @param modelHash Keccak256 hash of the trained model
     */
    function recordTrainingSession(
        uint256 datasetId,
        uint256 accuracy,
        bytes32 modelHash
    ) external override whenNotPaused {
        require(
            accessManager.hasAccess(datasetId, msg.sender) || _datasets[datasetId].owner == msg.sender,
            "AIDataMarketplace: no access to dataset"
        );
        require(accuracy <= 10000, "AIDataMarketplace: accuracy > 100%");
        require(modelHash != bytes32(0), "AIDataMarketplace: invalid model hash");

        _datasets[datasetId].trainingSessionCount++;
        totalTrainingSessions++;

        _trainingSessions[datasetId].push(DatasetLib.TrainingSession({
            datasetId: datasetId,
            trainer: msg.sender,
            accuracy: accuracy,
            modelHash: modelHash,
            timestamp: block.timestamp
        }));

        emit TrainingSessionRecorded(datasetId, msg.sender, accuracy, modelHash);
    }

    /**
     * @notice Provider withdraws accumulated earnings from RoyaltyManager
     */
    function withdrawEarnings() external override nonReentrant {
        royaltyManager.withdrawEarnings();
        uint256 amount = 0; // Amount handled by RoyaltyManager events
        emit EarningsWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Deactivate a dataset (by owner or contract owner)
     */
    function deactivateDataset(uint256 datasetId) external override {
        DatasetLib.Dataset storage dataset = _datasets[datasetId];
        require(
            msg.sender == dataset.owner || msg.sender == owner(),
            "AIDataMarketplace: not authorized"
        );
        require(dataset.isActive, "AIDataMarketplace: already inactive");
        dataset.isActive = false;
        dataset.lastUpdatedAt = block.timestamp;
        emit DatasetDeactivated(datasetId);
    }

    /**
     * @notice Update dataset price (by owner only)
     */
    function updatePrice(uint256 datasetId, uint256 newPrice) external override {
        DatasetLib.Dataset storage dataset = _datasets[datasetId];
        require(msg.sender == dataset.owner, "AIDataMarketplace: not dataset owner");
        require(newPrice > 0, "AIDataMarketplace: price must be > 0");
        dataset.price = newPrice;
        dataset.lastUpdatedAt = block.timestamp;
        emit PriceUpdated(datasetId, newPrice);
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function hasAccess(uint256 datasetId, address user) external view override returns (bool) {
        return accessManager.hasAccess(datasetId, user);
    }

    function getDatasetCount() external view override returns (uint256) {
        return _datasetCounter;
    }

    function getPendingEarnings(address provider) external view override returns (uint256) {
        return royaltyManager.getPendingEarnings(provider);
    }

    function getDataset(uint256 datasetId) external view returns (DatasetLib.Dataset memory) {
        require(_datasets[datasetId].owner != address(0), "AIDataMarketplace: not found");
        return _datasets[datasetId];
    }

    function getProviderDatasets(address provider) external view returns (uint256[] memory) {
        return _providerDatasets[provider];
    }

    function getAllDatasetIds() external view returns (uint256[] memory) {
        return _allDatasetIds;
    }

    function getActiveDatasets() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _allDatasetIds.length; i++) {
            if (_datasets[_allDatasetIds[i]].isActive) count++;
        }

        uint256[] memory active = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < _allDatasetIds.length; i++) {
            if (_datasets[_allDatasetIds[i]].isActive) {
                active[idx++] = _allDatasetIds[i];
            }
        }
        return active;
    }

    function getTrainingSessions(uint256 datasetId)
        external
        view
        returns (DatasetLib.TrainingSession[] memory)
    {
        return _trainingSessions[datasetId];
    }

    function getPurchaseRecord(uint256 datasetId, address buyer)
        external
        view
        returns (DatasetLib.PurchaseRecord memory)
    {
        return _purchases[datasetId][buyer];
    }

    function getPlatformStats()
        external
        view
        returns (
            uint256 datasetCount,
            uint256 volume,
            uint256 transactions,
            uint256 trainingSessions
        )
    {
        return (_datasetCounter, totalVolume, totalTransactions, totalTrainingSessions);
    }
}
