// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract Token is ERC20 {
    constructor() ERC20("Token", "TKN1") {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
    }
}