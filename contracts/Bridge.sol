// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IToken.sol";

contract Bridge is ERC2771Context, AccessControl {
    address public trustedForwarder;
    IToken public token; //token contract address supported by this bridge

    // mapping(address => mapping(uint256 => bool)) public processedNonces;
    mapping(bytes32 => bool) public transactionIdCheck;

    enum Step {
        Burn,
        Mint,
        Lock,
        Unlock
    }

    event Transfer(
        address from,
        address to,
        uint256 amount,
        uint256 date,
        Step indexed step
    );

    constructor(address _trustedForwarder, IToken _token)
        ERC2771Context(_trustedForwarder)
    {
        trustedForwarder = _trustedForwarder;
        token = IToken(_token);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Bridge: Only Admin");
        _;
    }

    /**
        @dev modifier to check if the sender is the trusted forwarder
        * Revert if the sender is not the trusted forwarder
        */
    modifier onlyTrustedForwarder() {
        require(
            isTrustedForwarder(msg.sender),
            "Bridge: Only Trusted Forwarder"
        );
        _;
    }

    function setTrustedForwarder(address _trustedForwarder) external onlyAdmin {
        require(_trustedForwarder != address(0), "Bridge:Zero Address");
        trustedForwarder = _trustedForwarder;
    }

    /**
     @dev Overriding _msgSender function inherited from Context and ERC2771Context
     */
    function _msgSender()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (address)
    {
        return ERC2771Context._msgSender();
    }

    /**
     @dev Overriding _msgData function inherited from Context and ERC2771Context
     */
    function _msgData()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }

    function deposit(
        address account,
        uint256 amount,
        bytes32 depositId
    ) external onlyTrustedForwarder {
        require(
            account == _msgSender(),
            "Bridge:Deposit account not same as sender"
        );
        require(
            !transactionIdCheck[depositId],
            "Bridge: Deposit id already exists"
        );
        token.lock(account, amount);
        transactionIdCheck[depositId] = true;
        emit Transfer(
            account,
            address(this),
            amount,
            block.timestamp,
            Step.Lock
        );
    }

    function withdraw(
        address account,
        uint256 amount,
        bytes32 withdrawId
    ) external onlyTrustedForwarder {
        require(
            account == _msgSender(),
            "Bridge:Withdraw account not same as sender"
        );
        require(
            !transactionIdCheck[withdrawId],
            "Bridge: Withdraw id already exists"
        );
        token.unlock(account, amount);
        transactionIdCheck[withdrawId] = true;
        emit Transfer(
            account,
            address(this),
            amount,
            block.timestamp,
            Step.Unlock
        );
    }

    function burn(
        address account,
        uint256 amount,
        bytes32 txId
    ) external onlyTrustedForwarder {
        require(account == _msgSender(), "Bridge: account not same as sender");
        require(!transactionIdCheck[txId], "Bridge: tx id already exists");
        token.burn(account, amount);
        emit Transfer(account, address(0), amount, block.timestamp, Step.Burn);
    }

    function mint(
        address account,
        uint256 amount,
        bytes32 txId
    ) external onlyTrustedForwarder {
        require(account == _msgSender(), "Bridge: account not same as sender");
        require(!transactionIdCheck[txId], "Bridge: tx id already exists");
        token.mint(account, amount);
        emit Transfer(address(0), account, amount, block.timestamp, Step.Mint);
    }
}
