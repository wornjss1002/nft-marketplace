# NFT Marketplace 과제 보고서

## github 주소 : https://github.com/wornjss1002/nft-marketplace
## 배포 주소 : https://nft-marketplace-wrc4.vercel.app
## 1. 프로젝트 개요

### 1.1 프로젝트 목표
- ERC-20, ERC-721 NFT 마켓플레이스 개발
- 토큰 에어드롭, NFT 민팅, NFT 거래 기능 및 내 NFT 확인 기능 구현

### 1.2 사용 기술
- **Smart Contracts**: Solidity ^0.8.0
- **Frontend**: Next.js + TypeScript + ethers.js v6
- **표준**: ERC-20 (토큰), ERC-721 (NFT)
- **IDE**: Remix IDE (배포)
- **네트워크**: sepolia

---

## 2. 구현된 기능

### 2.1 ERC-20 토큰 에어드롭 기능

#### 개요
MarketToken이라는 ERC-20 토큰을 발행하고, 누구나 홈페이지를 통해 토큰 에어드롭을 신청할 수 있습니다.

#### 구현 내용
- **컨트랙트**: `contracts/MarketToken.sol`
- **주요 함수**:
  - `requestAirdrop()`: 1000 토큰을 자동으로 사용자에게 전송
  - `depositTokens()`: 소유자가 컨트랙트에 토큰 충전
  - `withdrawTokens()`: 소유자가 토큰 회수

#### 동작 원리
```
1. 사용자가 지갑을 연결
2. "토큰 에어드롭" 페이지에서 "토큰 받기" 클릭
3. requestAirdrop() 함수 호출
4. 1000 * 10^18 토큰이 사용자에게 전송
5. 한 주소당 한 번만 신청 가능 (중복 방지)
```

#### 특징
-  자동 지급: 신청 즉시 토큰 수령
-  중복 방지: 같은 주소는 한 번만 신청 가능

---

### 2.2 NFT 컨트랙트 (누구나 민팅 가능)

#### 개요
MarketNFT라는 ERC-721 NFT 컨트랙트를 개발하여 누구나 새로운 NFT를 민팅할 수 있습니다.

#### 구현 내용
- **컨트랙트**: `contracts/MarketNFT.sol`
- **주요 함수**:
  - `mint(string memory uri)`: 새로운 NFT 민팅
  - `tokenURI(uint256 tokenId)`: 토큰의 메타데이터 URI 조회
  - `setTokenURI()`: URI 업데이트 (소유자만)

#### 동작 원리
```
1. 사용자가 "NFT 생성" 페이지 방문
2. 메타데이터 URI 입력 (IPFS 또는 웹 주소)
3. "NFT 생성" 버튼 클릭
4. mint() 함수 호출
5. 새로운 NFT가 사용자의 지갑에 전송
```

#### 특징
- ✅ 오픈 민팅: 누구나 NFT를 만들 수 있음
- ✅ 메타데이터 지원: JSON 형식의 메타데이터 저장
- ✅ 자동 ID 증가: 각 NFT는 고유한 ID를 받음

---

### 2.3 NFT 마켓플레이스 (구매/판매)

#### 개요
NFTMarketplace 컨트랙트를 통해 사용자들이 NFT를 판매 등록하고 다른 사용자의 NFT를 구매할 수 있습니다.

#### 구현 내용
- **컨트랙트**: `contracts/NFTMarketplace.sol`
- **주요 함수**:
  - `listNFT()`: NFT 판매 등록
  - `buyNFT()`: NFT 구매
  - `cancelListing()`: 판매 등록 취소
  - `getListing()`: 판매 정보 조회

#### 동작 원리

**판매 등록:**
```
1. 사용자가 자신의 NFT를 마켓플레이스에서 판매 등록
2. 가격을 설정 (토큰 단위)
3. listNFT() 함수 호출
4. 판매 목록에 추가
```

**구매:**
```
1. 구매자가 마켓플레이스에서 판매 중인 NFT 확인
2. "구매" 버튼 클릭
3. 토큰 승인 (approve) 트랜잭션 실행
4. buyNFT() 함수 호출
5. 토큰이 판매자에게 전송
6. 수수료가 관리자에게 전송
7. NFT가 구매자에게 전송
```

#### 특징
-  토큰 결제: MarketToken만을 거래 수단으로 사용
-  수수료 시스템: 0.5%의 마켓플레이스 수수료
-  재진입 공격 방지: ReentrancyGuard 적용

---

### 2.4 웹 인터페이스

#### 홈페이지
- 지갑 연결 기능
- 3가지 주요 기능으로의 네비게이션
- 사용 안내

#### 에어드롭 페이지
```
기능: 토큰 에어드롭 신청
URL: /airdrop
- 지갑 연결 여부 확인
- "토큰 받기" 버튼
- 거래 상태 표시
- 정보 안내
```

#### NFT 민팅 페이지
```
기능: 새로운 NFT 생성
URL: /mint
- NFT URI 입력 필드
- "NFT 생성" 버튼
- 메타데이터 예시 표시
- 거래 상태 표시
```

#### 마켓플레이스 페이지
```
기능: NFT 구매/판매
URL: /marketplace
- 탭 1: NFT 구매
  - 판매 중인 NFT 목록
  - 각 NFT의 판매자, 가격 표시
  - "구매" 버튼

- 탭 2: NFT 판매 등록
  - NFT ID 입력
  - 가격 입력
  - "판매 등록" 버튼
```

---

## 3. 배포 정보

### 3.1 배포 네트워크
**네트워크**: sepolia

### 3.2 배포된 컨트랙트 주소

| 컨트랙트 | 주소 | 
|---------|------|
| MarketToken (ERC-20) | `0x46c99Fc9164657AE1aE68FB8F362DeDB52D5e6a1` |
| MarketNFT (ERC-721) | `0xd9f81DB27b1A7208037841C49924CEf7274F1bfE` |
| NFTMarketplace | `0xFc188093c0FaCa4Ccb771bEd59C20c0890510D51` | 


### 3.3 배포 절차

1. **Remix IDE 접속** (https://remix.ethereum.org/)

2. **MarketToken 배포**
   - 파일 생성: `contracts/MarketToken.sol`
   - Solidity Compiler에서 `0.8.0` 이상 선택
   - 컴파일 및 배포
   - 주소 기록: `TOKEN_ADDRESS`

3. **MarketNFT 배포**
   - 파일 생성: `contracts/MarketNFT.sol`
   - 컴파일 및 배포
   - 주소 기록: `NFT_ADDRESS`

4. **NFTMarketplace 배포**
   - 파일 생성: `contracts/NFTMarketplace.sol`
   - 컴파일 및 배포
   - 주소 기록: `MARKETPLACE_ADDRESS`

5. **Frontend 설정**
   - `frontend/lib/contracts.ts` 파일 수정
   - CONTRACT_ADDRESSES의 주소들을 업데이트

---

## 4. 사용 방법

### 4.1 사전 준비
- MetaMask 설치
- 테스트 네트워크 설정
- 테스트 ETH 확보 (Faucet에서)

### 4.2 기본 사용 시나리오

**Step 1: 지갑 연결**
```
1. dApp 접속
2. 우측 상단 "지갑 연결" 버튼 클릭
3. MetaMask 팝업에서 계정 선택 및 승인
```

**Step 2: 토큰 에어드롭 받기**
```
1. "💰 토큰 에어드롭" 카드 클릭
2. "토큰 받기" 버튼 클릭
3. MetaMask에서 거래 승인
4. 1000 토큰 수령 (1회만 가능)
```

**Step 3: NFT 생성하기**
```
1. "🖼️ NFT 생성" 카드 클릭
2. NFT URI 입력 (예: ipfs://QmXxxx...)
3. "NFT 생성" 버튼 클릭
4. MetaMask에서 거래 승인
5. 새로운 NFT 생성 완료
```

**Step 4: NFT 판매 등록하기**
```
1. "🛒 마켓플레이스" 카드 클릭
2. "📤 NFT 판매 등록" 탭 선택
3. NFT ID와 판매 가격 입력
4. "판매 등록" 버튼 클릭
5. MetaMask에서 거래 승인
```

**Step 5: NFT 구매하기**
```
1. 마켓플레이스의 "🛒 NFT 구매" 탭 선택
2. 판매 중인 NFT 목록 확인
3. 원하는 NFT의 "구매" 버튼 클릭
4. MetaMask에서 거래 2회 승인 (토큰 승인 + 구매)
5. NFT 구매 완료
```

---

## 5. 기술 상세 설명

### 5.1 ERC-20 토큰 (MarketToken)

**구현 특징**:
- OpenZeppelin의 ERC20 표준 구현
- Ownable로 소유자 관리
- 고정 에어드롭 금액 (1000 토큰)
- 중복 신청 방지 (hasReceivedAirdrop 매핑)

**주요 변수**:
```solidity
uint256 public constant AIRDROP_AMOUNT = 1000 * 10 ** 18;
mapping(address => bool) public hasReceivedAirdrop;
```

**동작**:
1. 컨트랙트 배포 시 소유자에게 초기 토큰 발행
2. 소유자가 컨트랙트에 토큰 충전
3. 사용자가 requestAirdrop() 호출 시 1000 토큰 전송
4. 같은 주소는 한 번만 신청 가능

### 5.2 ERC-721 NFT (MarketNFT)

**구현 특징**:
- OpenZeppelin의 ERC721 표준 구현
- Counters를 이용한 자동 ID 증가
- 메타데이터 URI 저장
- 누구나 민팅 가능

**주요 변수**:
```solidity
Counters.Counter private _tokenIdCounter;
mapping(uint256 => string) public tokenURIs;
```

**동작**:
1. mint() 호출 시 새로운 NFT 생성
2. _tokenIdCounter 자동 증가
3. 메타데이터 URI 저장
4. NFT는 호출자의 주소에 소유권 할당

### 5.3 NFT 마켓플레이스 (NFTMarketplace)

**구현 특징**:
- ERC-20 토큰으로만 결제
- 마켓플레이스 수수료 (0.5%)
- 재진입 공격 방지 (ReentrancyGuard)
- 판매 목록 관리

**주요 변수**:
```solidity
IERC20 public paymentToken;
uint256 public constant MARKETPLACE_FEE_PERCENT = 5; // 0.5%
mapping(address => mapping(uint256 => Listing)) public listings;
```

**동작**:
1. 판매자가 NFT를 마켓플레이스에 등록
2. 구매자가 토큰 승인 (approve)
3. 구매자가 buyNFT() 호출
4. 토큰이 판매자에게 전송 (수수료 제외)
5. 수수료가 수수료 수령인에게 전송
6. NFT가 구매자에게 전송

### 5.4 Frontend 아키텍처

**주요 파일**:
- `lib/contracts.ts`: 컨트랙트 주소 및 ABI 정의
- `lib/web3.ts`: ethers.js 유틸리티 함수
- `app/page.tsx`: 홈페이지 (Next.js App Router)
- `app/airdrop/page.tsx`: 에어드롭 페이지
- `app/mint/page.tsx`: NFT 민팅 페이지
- `app/marketplace/page.tsx`: 마켓플레이스 페이지

**Web3 상호작용 흐름**:
```
사용자 입력
    ↓
web3.ts 유틸리티 함수 호출
    ↓
ethers.js를 통한 컨트랙트 상호작용
    ↓
MetaMask 서명
    ↓
블록체인에 거래 제출
    ↓
결과 표시
```

---

## 6. 테스트 결과

### 6.1 에어드롭 기능 테스트

| 테스트 항목 | 예상 결과 | 실제 결과 | 통과 여부 |
|-----------|---------|---------|---------|
| 토큰 에어드롭 신청 | 1000 토큰 수령 | 1000 토큰 수령 | ✅ |
| 중복 신청 방지 | 2번째 신청 거절 | 2번째 신청 거절 | ✅ |
| 잔액 확인 | 토큰 잔액 증가 | 토큰 잔액 증가 | ✅ |

### 6.2 NFT 민팅 테스트

| 테스트 항목 | 예상 결과 | 실제 결과 | 통과 여부 |
|-----------|---------|---------|---------|
| NFT 생성 | 새로운 NFT 발행 | 새로운 NFT 발행 | ✅ |
| 소유권 확인 | 민팅자가 소유 | 민팅자가 소유 | ✅ |
| URI 저장 | 메타데이터 저장 | 메타데이터 저장 | ✅ |

### 6.3 마켓플레이스 테스트

| 테스트 항목 | 예상 결과 | 실제 결과 | 통과 여부 |
|-----------|---------|---------|---------|
| NFT 판매 등록 | 판매 목록 추가 | 판매 목록 추가 | ✅ |
| NFT 구매 | NFT 소유권 이전 | NFT 소유권 이전 | ✅ |
| 토큰 결제 | 토큰 전송 및 수수료 | 토큰 전송 및 수수료 | ✅ |
| 판매 취소 | 판매 목록 제거 | 판매 목록 제거 | ✅ |

---

## 7. 보안 고려사항

### 7.1 구현된 보안 기능
-  ReentrancyGuard: 재진입 공격 방지
-  Ownable: 관리자 권한 관리
-  매핑 기반 관리: 중복 신청 방지
-  권한 체크: 소유자만 특정 함수 호출 가능

---

## 9. 결론

이 NFT Marketplace 프로젝트는 다음을 성공적으로 구현했습니다:

1. ✅ **ERC-20 토큰 에어드롭**: 누구나 1000 토큰을 신청받을 수 있음
2. ✅ **ERC-721 NFT 컨트랙트**: 누구나 새로운 NFT를 민팅할 수 있음
3. ✅ **NFT 마켓플레이스**: 토큰을 이용한 NFT 거래 가능
4. ✅ **완전한 웹 인터페이스**: Next.js + ethers.js로 구현된 사용하기 쉬운 UI

모든 기능이 테스트되었으며, 코드는 보안 모범 사례를 따릅니다.

---

## 10. 참고 자료

- GitHub 리포지토리:[ [주소]](https://github.com/wornjss1002/nft-marketplace)
- Remix IDE: https://remix.ethereum.org/
- ethers.js 문서: https://docs.ethers.org/
- Solidity 문서: https://docs.soliditylang.org/

---

**작성일**: 2025.12.10


