// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Token is ERC20, AccessControl, Pausable {
    // uint256 public initialSupply;
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    constructor(string memory _assetName, string memory _assetSymbol)
        ERC20(_assetName, _assetSymbol)
    {
        // initialSupply = _initalSupply;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Token: Only Admin");
        _;
    }

    /**
     @dev modifier to check if the sender is Bridge or not
     * Revert if the sender is not Bridge
     */
    modifier onlyBridge() {
        require(hasRole(BRIDGE_ROLE, _msgSender()), "Token: Only Bridge");
        _;
    }

    function lock(address account, uint256 amount)
        external
        onlyBridge
        whenNotPaused
    {
        _transfer(account, msg.sender, amount); //unsafe way. Use transferfrom with owner approval. For future
    }

    function unlock(address account, uint256 amount)
        external
        onlyBridge
        whenNotPaused
    {
        _transfer(msg.sender, account, amount);
    }

    function mint(address account, uint256 amount)
        external
        onlyBridge
        whenNotPaused
    {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount)
        external
        onlyBridge
        whenNotPaused
    {
        _burn(account, amount);
    }

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }
}
