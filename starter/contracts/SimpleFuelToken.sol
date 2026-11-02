// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SimpleFuelOracle} from "./SimpleFuelOracle.sol";

/// @title SimpleFuelToken
/// @notice 1 FUEL (18 decimals) is worth one litre of petrol. Buy with POL, sell back for POL
///         at the oracle price. No fees. Teaching demo for a test network.
contract SimpleFuelToken is ERC20 {
    SimpleFuelOracle public immutable oracle;
    uint64 public constant MAX_AGE = 3 days;

    error StalePrice();
    error ZeroAmount();
    error InsufficientReserve();
    error TransferFailed();

    constructor(address oracle_) ERC20("Simple FuelToken", "FUEL") {
        oracle = SimpleFuelOracle(oracle_);
    }

    /// @notice Send POL, receive FUEL: fuel = pol * polEur / fuelEurPerLitre.
    function buy() external payable {
        if (msg.value == 0) revert ZeroAmount();
        (uint256 f, uint256 p) = _prices();
        uint256 fuelOut = (msg.value * p) / f;
        if (fuelOut == 0) revert ZeroAmount();
        _mint(msg.sender, fuelOut);
    }

    /// @notice Burn FUEL, receive POL: pol = fuel * fuelEurPerLitre / polEur.
    function sell(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        (uint256 f, uint256 p) = _prices();
        uint256 polOut = (amount * f) / p;
        if (polOut == 0) revert ZeroAmount();
        if (address(this).balance < polOut) revert InsufficientReserve();
        _burn(msg.sender, amount);
        (bool ok, ) = msg.sender.call{value: polOut}("");
        if (!ok) revert TransferFailed();
    }

    /// @notice How much FUEL you would get for a given amount of POL (in wei).
    function quoteBuy(uint256 polWei) external view returns (uint256) {
        (uint256 f, uint256 p) = _prices();
        return (polWei * p) / f;
    }

    function _prices() internal view returns (uint256 f, uint256 p) {
        if (!oracle.isFresh(MAX_AGE)) revert StalePrice();
        (f, ) = oracle.fuelPrice();
        (p, ) = oracle.polPrice();
    }
}
