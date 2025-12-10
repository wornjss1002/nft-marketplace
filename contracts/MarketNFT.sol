// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol"; // 👈 ID 자동 생성을 위해 필요

contract MarketNFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter; 

    Counters.Counter private _tokenIdCounter; // 토큰 ID 카운터
    mapping(uint256 => string) public tokenURIs; // 토큰 URI 저장소

    // 🚩 프론트엔드에서 발행된 토큰 ID를 추출하기 위해 반드시 필요
    event NFTMinted(address indexed minter, uint256 indexed tokenId, string uri); 
    
    // 1. 생성자: ERC721의 생성자를 직접 호출합니다. (솔리디티 오류 해결)
    constructor()
        ERC721("MarketNFT", "MNFT") 
        Ownable(msg.sender)
    {}

    // 2. supportsInterface: 오버라이드 오류 해결을 위해 ERC721Enumerable만 명시합니다.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev 🚩 프론트엔드(MintPage.tsx)와 시그니처가 일치하는 mint 함수로 복구
     * 누구나 호출 가능하며, 토큰 ID를 자동으로 부여합니다.
     * @param uri NFT 메타데이터 주소
     */
    function mint(string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment(); // 다음 ID로 증가

        _safeMint(msg.sender, tokenId); // 현재 트랜잭션 발신자(msg.sender)에게 민팅
        tokenURIs[tokenId] = uri; // URI 저장

        emit NFTMinted(msg.sender, tokenId, uri); // 이벤트 발생 (프론트엔드가 이 ID를 추출함)

        return tokenId;
    }
    
    // 3. tokenURI: OpenZeppelin 표준에 따라 URI를 반환하는 함수 (필수)
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _ownerOf(tokenId) != address(0), 
            "ERC721Metadata: URI query for nonexistent token"
        );
        return tokenURIs[tokenId];
    }
}
