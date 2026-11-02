// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract FuelPriceOracle is AccessControl {
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");

    uint256 private _fuelEurPerLitre;
    uint256 private _polEur;
    uint64 private _updatedAt;
    uint64 private _sourceDate;

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function setPrices(uint256 fuelEurPerLitre, uint256 polEur, uint64 sourceDate)
        external onlyRole(UPDATER_ROLE)
    {
        require(fuelEurPerLitre > 0 && polEur > 0, "zero price");
        _fuelEurPerLitre = fuelEurPerLitre;
        _polEur = polEur;
        _sourceDate = sourceDate;
        _updatedAt = uint64(block.timestamp);
    }

    function fuelPrice() external view returns (uint256, uint64) {
        return (_fuelEurPerLitre, _updatedAt);
    }

    function polPrice() external view returns (uint256, uint64) {
        return (_polEur, _updatedAt);
    }

    function isFresh(uint64 maxAgeSeconds) external view returns (bool) {
        return _updatedAt != 0
            && block.timestamp <= uint256(_updatedAt) + maxAgeSeconds;
    }
}
