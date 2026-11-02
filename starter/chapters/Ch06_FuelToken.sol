// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

// The oracle from chapter 4, repeated here so this file compiles on its own.
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

// The token from chapter 6.
contract FuelToken is ERC20 {
    FuelPriceOracle public immutable oracle;
    uint64 public maxAge = 3 days;

    constructor(address oracle_) ERC20("FuelToken", "FUEL") {
        oracle = FuelPriceOracle(oracle_);
    }

    function buy() external payable {
        (uint256 f, uint256 p) = _prices();
        _mint(msg.sender, msg.value * p / f);
    }

    function sell(uint256 amount) external {
        (uint256 f, uint256 p) = _prices();
        uint256 polOut = amount * f / p;
        require(address(this).balance >= polOut, "reserve too low");
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(polOut);
    }

    function reserve() external view returns (uint256) {
        return address(this).balance;
    }

    function _prices() internal view returns (uint256 f, uint256 p) {
        require(oracle.isFresh(maxAge), "price is old");
        (f,) = oracle.fuelPrice();
        (p,) = oracle.polPrice();
    }
}
