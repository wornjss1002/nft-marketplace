// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NFTMarketplace
 * @dev NFT 마켓플레이스 컨트랙트
 * 사용자는 NFT를 판매등록하고 다른 사용자의 NFT를 구매할 수 있습니다
 */
contract NFTMarketplace is ReentrancyGuard {
    // 토큰 컨트랙트 참조
    IERC20 public paymentToken;

    // 마켓플레이스 수수료 (0.5%)
    uint256 public constant MARKETPLACE_FEE_PERCENT = 5; // 0.5%
    address public feeRecipient;

    // 판매 목록 구조체
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    // NFT 컨트랙트별 판매 목록
    // nftContract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // NFT 컨트랙트별 활성 리스팅 tokenId 추적
    // nftContract => tokenId[]
    mapping(address => uint256[]) public activeListingTokenIds;

    // 이벤트
    event NFTListed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event NFTPurchased(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    event ListingCancelled(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller
    );

    event FeeRecipientChanged(address newRecipient);

    constructor(address _paymentToken, address _feeRecipient) {
        require(_paymentToken != address(0), "Invalid token address");
        require(_feeRecipient != address(0), "Invalid fee recipient");

        paymentToken = IERC20(_paymentToken);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev NFT 판매 등록
     * @param nftContract NFT 컨트랙트 주소
     * @param tokenId 토큰 ID
     * @param price 판매 가격 (토큰 단위)
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public nonReentrant {
        require(nftContract != address(0), "Invalid NFT contract");
        require(price > 0, "Price must be greater than 0");

        IERC721 nft = IERC721(nftContract);
        require(
            nft.ownerOf(tokenId) == msg.sender,
            "You do not own this NFT"
        );

        // NFT를 마켓플레이스로 전송하거나 승인 받아야 함
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
                nft.getApproved(tokenId) == address(this),
            "NFT is not approved for marketplace"
        );

        // 새로운 리스팅이면 배열에 추가
        if (!listings[nftContract][tokenId].active) {
            activeListingTokenIds[nftContract].push(tokenId);
        }

        listings[nftContract][tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true
        });

        emit NFTListed(nftContract, tokenId, msg.sender, price);
    }

    /**
     * @dev NFT 구매
     * @param nftContract NFT 컨트랙트 주소
     * @param tokenId 토큰 ID
     */
    function buyNFT(address nftContract, uint256 tokenId)
        public
        nonReentrant
    {
        require(nftContract != address(0), "Invalid NFT contract");

        Listing memory listing = listings[nftContract][tokenId];
        require(listing.active, "NFT is not for sale");
        require(listing.seller != msg.sender, "Cannot buy your own NFT");

        uint256 totalPrice = listing.price;
        uint256 fee = (totalPrice * MARKETPLACE_FEE_PERCENT) / 1000;
        uint256 sellerAmount = totalPrice - fee;

        // 토큰 전송
        require(
            paymentToken.transferFrom(msg.sender, listing.seller, sellerAmount),
            "Payment to seller failed"
        );

        if (fee > 0) {
            require(
                paymentToken.transferFrom(msg.sender, feeRecipient, fee),
                "Fee transfer failed"
            );
        }

        // NFT 전송
        IERC721 nft = IERC721(nftContract);
        nft.transferFrom(listing.seller, msg.sender, tokenId);

        // 판매 목록 비활성화
        listings[nftContract][tokenId].active = false;

        emit NFTPurchased(nftContract, tokenId, msg.sender, totalPrice);
    }

    /**
     * @dev 판매 등록 취소
     * @param nftContract NFT 컨트랙트 주소
     * @param tokenId 토큰 ID
     */
    function cancelListing(address nftContract, uint256 tokenId)
        public
        nonReentrant
    {
        require(nftContract != address(0), "Invalid NFT contract");

        Listing memory listing = listings[nftContract][tokenId];
        require(listing.active, "Listing is not active");
        require(
            listing.seller == msg.sender,
            "Only seller can cancel listing"
        );

        listings[nftContract][tokenId].active = false;

        emit ListingCancelled(nftContract, tokenId, msg.sender);
    }

    /**
     * @dev 판매 목록 조회
     */
    function getListing(address nftContract, uint256 tokenId)
        public
        view
        returns (Listing memory)
    {
        return listings[nftContract][tokenId];
    }

    /**
     * @dev 모든 활성 판매 목록 조회
     */
    function getAllListings(address nftContract)
        public
        view
        returns (Listing[] memory)
    {
        require(nftContract != address(0), "Invalid NFT contract");
        
        uint256[] memory tokenIds = activeListingTokenIds[nftContract];
        Listing[] memory result = new Listing[](tokenIds.length);
        
        uint256 count = 0;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            Listing memory listing = listings[nftContract][tokenIds[i]];
            if (listing.active) {
                result[count] = listing;
                count++;
            }
        }
        
        // 활성 리스팅만 반환하도록 배열 크기 조정
        Listing[] memory activeListings = new Listing[](count);
        for (uint256 i = 0; i < count; i++) {
            activeListings[i] = result[i];
        }
        
        return activeListings;
    }

    /**
     * @dev 수수료 수령인 변경 (수수료 수령인만 가능)
     */
    function setFeeRecipient(address newRecipient) public {
        require(msg.sender == feeRecipient, "Only fee recipient can change");
        require(newRecipient != address(0), "Invalid fee recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientChanged(newRecipient);
    }

    /**
     * @dev 진단 함수: NFT 승인 상태 확인
     */
    function checkNFTApproval(address nftContract, address owner) 
        public 
        view 
        returns (bool) 
    {
        IERC721 nft = IERC721(nftContract);
        return nft.isApprovedForAll(owner, address(this));
    }

    /**
     * @dev 진단 함수: NFT 소유권 확인
     */
    function checkNFTOwnership(address nftContract, uint256 tokenId, address owner)
        public
        view
        returns (bool)
    {
        IERC721 nft = IERC721(nftContract);
        try nft.ownerOf(tokenId) returns (address actualOwner) {
            return actualOwner == owner;
        } catch {
            return false;
        }
    }
}
