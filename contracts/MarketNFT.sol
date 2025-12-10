// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MarketNFT
 * @dev ERC-721 NFT Contract
 * Anyone can mint new NFTs
 */
contract MarketNFT is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Token URI storage
    mapping(uint256 => string) public tokenURIs;

    event NFTMinted(address indexed minter, uint256 indexed tokenId, string uri);

    constructor() ERC721("MarketNFT", "MNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint new NFT
     * @param uri Metadata URI
     */
    function mint(string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(msg.sender, tokenId);
        tokenURIs[tokenId] = uri;

        emit NFTMinted(msg.sender, tokenId, uri);
        return tokenId;
    }

    /**
     * @dev Get token URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return tokenURIs[tokenId];
    }

    /**
     * @dev Update token URI (owner only)
     */
    function setTokenURI(uint256 tokenId, string memory uri)
        public
        onlyOwner
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        tokenURIs[tokenId] = uri;
    }

    /**
     * @dev Check if token exists (internal)
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Get current token ID
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
