// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {FuelPriceOracle} from "./FuelPriceOracle.sol";

/// @title FuelToken
/// @notice 1 FUEL (18 decimals) is worth one litre of petrol. Buy with POL, sell back for POL
///         at the oracle price. No fees. Educational demo on a test network.
contract FuelToken is ERC20, ERC20Permit, Ownable, Pausable {
    FuelPriceOracle public immutable oracle;
    uint64 public maxAge = 3 days;

    error StalePrice();
    error ZeroAmount();
    error InsufficientReserve();
    error TransferFailed();

    event Bought(address indexed buyer, uint256 polIn, uint256 fuelOut, uint256 fuelPrice, uint256 polPrice);
    event Sold(address indexed seller, uint256 fuelIn, uint256 polOut, uint256 fuelPrice, uint256 polPrice);
    event MaxAgeChanged(uint64 maxAge);

    constructor(address oracle_)
        ERC20("FuelToken", "FUEL")
        ERC20Permit("FuelToken")
        Ownable(msg.sender)
    {
        oracle = FuelPriceOracle(oracle_);
    }

    function setMaxAge(uint64 newMaxAge) external onlyOwner {
        maxAge = newMaxAge;
        emit MaxAgeChanged(newMaxAge);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Buy FUEL with POL: fuel = polWei * polEur / fuelEurPerLitre (rounds down).
    function buy() external payable whenNotPaused {
        if (msg.value == 0) revert ZeroAmount();
        (uint256 f, uint256 p) = _prices();
        uint256 fuelOut = msg.value * p / f;
        if (fuelOut == 0) revert ZeroAmount();
        _mint(msg.sender, fuelOut);
        emit Bought(msg.sender, msg.value, fuelOut, f, p);
    }

    /// @notice Burn FUEL and receive POL: pol = amount * fuelEurPerLitre / polEur (rounds down).
    function sell(uint256 amount) external whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        (uint256 f, uint256 p) = _prices();
        uint256 polOut = amount * f / p;
        if (polOut == 0) revert ZeroAmount();
        if (address(this).balance < polOut) revert InsufficientReserve();
        _burn(msg.sender, amount);
        (bool ok,) = msg.sender.call{value: polOut}("");
        if (!ok) revert TransferFailed();
        emit Sold(msg.sender, amount, polOut, f, p);
    }

    function quoteBuy(uint256 polWei) external view returns (uint256 fuel) {
        (uint256 f, uint256 p) = _prices();
        return polWei * p / f;
    }

    function quoteSell(uint256 fuel) external view returns (uint256 polWei) {
        (uint256 f, uint256 p) = _prices();
        return fuel * f / p;
    }

    /// @notice POL held by the contract.
    function reserve() external view returns (uint256) {
        return address(this).balance;
    }

    function _prices() internal view returns (uint256 f, uint256 p) {
        if (!oracle.isFresh(maxAge)) revert StalePrice();
        (f,) = oracle.fuelPrice();
        (p,) = oracle.polPrice();
    }
}
