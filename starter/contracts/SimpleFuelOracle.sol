// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title SimpleFuelOracle
/// @notice Stores the petrol price (EUR per litre) and the POL price (EUR).
///         Prices use 6 decimals: 1.989 EUR is stored as 1989000.
///         Only an address with UPDATER_ROLE can write them.
contract SimpleFuelOracle is AccessControl {
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");

    error ZeroPrice();

    uint256 private _fuelEurPerLitre;
    uint256 private _polEur;
    uint64 private _updatedAt;

    event PricesUpdated(uint256 fuelEurPerLitre, uint256 polEur, uint64 updatedAt);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function setPrices(uint256 fuelEurPerLitre, uint256 polEur) external onlyRole(UPDATER_ROLE) {
        if (fuelEurPerLitre == 0 || polEur == 0) revert ZeroPrice();
        _fuelEurPerLitre = fuelEurPerLitre;
        _polEur = polEur;
        _updatedAt = uint64(block.timestamp);
        emit PricesUpdated(fuelEurPerLitre, polEur, _updatedAt);
    }

    /// @return price EUR per litre, 6 decimals
    function fuelPrice() external view returns (uint256 price, uint64 updatedAt) {
        return (_fuelEurPerLitre, _updatedAt);
    }

    /// @return price EUR per 1 POL, 6 decimals
    function polPrice() external view returns (uint256 price, uint64 updatedAt) {
        return (_polEur, _updatedAt);
    }

    /// @notice True if prices were set and are not older than maxAgeSeconds.
    function isFresh(uint64 maxAgeSeconds) external view returns (bool) {
        return _updatedAt != 0 && block.timestamp <= uint256(_updatedAt) + maxAgeSeconds;
    }
}
