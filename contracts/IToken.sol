// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IToken {
    function lock(address account, uint256 amount) external;

    function unlock(address account, uint256 amount) external;

    function mint(address account, uint256 amount) external;

    function burn(address account, uint256 amount) external;

    function pause() external;

    function unpause() external;
}
