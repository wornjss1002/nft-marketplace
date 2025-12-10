// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MarketToken
 * @dev ERC-20 토큰 컨트랙트 with 에어드롭 기능
 */
contract MarketToken is ERC20, Ownable {
    // 에어드롭 수량 (1000 토큰)
    uint256 public constant AIRDROP_AMOUNT = 1000 * 10 ** 18;

    // 에어드롭을 받았는지 추적
    mapping(address => bool) public hasReceivedAirdrop;

    event AirdropRequested(address indexed recipient, uint256 amount);

    constructor() ERC20("MarketToken", "MKT") Ownable(msg.sender) {
        // 초기 공급 (선택사항)
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    /**
     * @dev 토큰 에어드롭 신청
     * 한 주소당 한 번만 받을 수 있습니다
     */
    function requestAirdrop() public {
        require(
            !hasReceivedAirdrop[msg.sender],
            "Already received airdrop"
        );
        require(
            balanceOf(address(this)) >= AIRDROP_AMOUNT,
            "Insufficient tokens in contract"
        );

        hasReceivedAirdrop[msg.sender] = true;
        _transfer(address(this), msg.sender, AIRDROP_AMOUNT);

        emit AirdropRequested(msg.sender, AIRDROP_AMOUNT);
    }

    /**
     * @dev Deposit tokens to contract (owner only)
     */
    function depositTokens(uint256 amount) public onlyOwner {
        require(balanceOf(msg.sender) >= amount, "Insufficient token balance");
        transfer(address(this), amount);
    }

    /**
     * @dev Withdraw tokens from contract (owner only)
     */
    function withdrawTokens(uint256 amount) public onlyOwner {
        require(
            balanceOf(address(this)) >= amount,
            "Insufficient tokens in contract"
        );
        transfer(msg.sender, amount);
    }

    /**
     * @dev Reset airdrop status (owner only)
     */
    function resetAirdropStatus(address[] memory accounts) public onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            hasReceivedAirdrop[accounts[i]] = false;
        }
    }
}
