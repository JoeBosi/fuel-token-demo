// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Oracle and token in one file, ready to open in Remix IDE (same code as the two files in ../contracts).
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

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
