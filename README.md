# NFT Marketplace 프로젝트 가이드

## 📋 프로젝트 개요

이 프로젝트는 다음 기능을 포함하는 완전한 NFT Marketplace입니다:

### 1. ✅ ERC-20 토큰 에어드롭
- 소유자가 발행한 MarketToken
- 누구나 신청하면 1000 토큰을 자동 지급
- 파일: `contracts/MarketToken.sol`

### 2. ✅ ERC-721 NFT 컨트랙트
- 누구나 새로운 NFT를 민팅 가능
- 메타데이터 URI 지원
- 파일: `contracts/MarketNFT.sol`

### 3. ✅ NFT 마켓플레이스
- 자신의 NFT 판매 등록
- 토큰으로 NFT 구매
- 수수료 시스템 포함
- 파일: `contracts/NFTMarketplace.sol`

### 4. ✅ 웹 인터페이스
- Next.js + ethers.js
- 반응형 UI
- MetaMask 지갑 연결
- 파일: `frontend/` 폴더

## 🏗️ 프로젝트 구조

```
nft-marketplace/
├── contracts/
│   ├── MarketToken.sol          # ERC-20 토큰 컨트랙트
│   ├── MarketNFT.sol            # ERC-721 NFT 컨트랙트
│   └── NFTMarketplace.sol       # 마켓플레이스 컨트랙트
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # 홈페이지
│   │   ├── airdrop/
│   │   │   └── page.tsx         # 에어드롭 페이지
│   │   ├── mint/
│   │   │   └── page.tsx         # NFT 생성 페이지
│   │   ├── marketplace/
│   │   │   └── page.tsx         # 마켓플레이스 페이지
│   │   ├── layout.tsx           # 레이아웃
│   │   └── globals.css          # 전역 스타일
│   ├── lib/
│   │   ├── contracts.ts         # 컨트랙트 주소 및 ABI
│   │   └── web3.ts              # ethers.js 유틸리티
│   ├── package.json             # 의존성
│   ├── tsconfig.json            # TypeScript 설정
│   ├── next.config.js           # Next.js 설정
│   └── README.md                # 프론트엔드 가이드
├── DEPLOYMENT_GUIDE.md          # 배포 가이드
└── README.md                    # 이 파일
```

## 🚀 빠른 시작

### 전제 조건
- Node.js 16+ 설치
- MetaMask 또는 다른 Web3 지갑
- Remix IDE (또는 로컬 환경)

### 단계 1: Smart Contracts 배포

1. Remix IDE (https://remix.ethereum.org/) 에 접속
2. `contracts/` 폴더의 각 Solidity 파일을 복사
3. 배포 네트워크 선택 (Sepolia, Mumbai, Fuji 등)
4. 각 컨트랙트를 순서대로 배포
5. 배포된 계약 주소 기록

자세한 배포 방법은 `DEPLOYMENT_GUIDE.md`를 참고하세요.

### 단계 2: Frontend 설정

```bash
# 프로젝트 폴더로 이동
cd frontend

# 의존성 설치
npm install

# 계약 주소 업데이트
# lib/contracts.ts 파일의 CONTRACT_ADDRESSES를 수정합니다

# 개발 서버 실행
npm run dev
```

### 단계 3: 애플리케이션 사용

1. http://localhost:3000 접속
2. "지갑 연결" 클릭하여 MetaMask 연결
3. 각 기능 사용:
   - **에어드롭**: 토큰 신청
   - **민팅**: NFT 생성
   - **마켓플레이스**: NFT 거래

## 💡 주요 기능 설명

### 1. 토큰 에어드롭
```
사용자 → [에어드롭 신청] → MarketToken 컨트랙트
→ 1000 토큰 전송 → 사용자
```

**함수**: `MarketToken.requestAirdrop()`
- 한 주소당 한 번만 신청 가능
- 1000 토큰 자동 지급

### 2. NFT 민팅
```
사용자 → [NFT URI 입력] → MarketNFT 컨트랙트
→ 새로운 NFT 발행 → 사용자 보유
```

**함수**: `MarketNFT.mint(string memory uri)`
- 누구나 민팅 가능
- 메타데이터 URI 저장

### 3. NFT 마켓플레이스
```
판매자 → [판매 등록] → NFTMarketplace
구매자 → [토큰 승인] → NFTMarketplace
구매자 → [구매] → NFT 전송, 토큰 결제
```

**주요 함수**:
- `listNFT()`: NFT 판매 등록
- `buyNFT()`: NFT 구매
- `cancelListing()`: 판매 취소

## 🔧 기술 스택

### Backend (Smart Contracts)
- **언어**: Solidity ^0.8.0
- **표준**: ERC-20, ERC-721
- **라이브러리**: OpenZeppelin Contracts

### Frontend
- **프레임워크**: Next.js 14
- **언어**: TypeScript
- **Web3 라이브러리**: ethers.js v6
- **스타일**: 인라인 CSS (또는 Tailwind CSS 추가 가능)

## 📝 컨트랙트 상호작용 예시

### Remix IDE에서의 상호작용

#### 1. 에어드롭 받기
1. MarketToken 컨트랙트에서 `requestAirdrop()` 호출
2. MetaMask 트랜잭션 확인
3. 1000 토큰 수령

#### 2. NFT 생성
1. MarketNFT 컨트랙트에서 `mint(uri)` 호출
2. 예시 URI: `ipfs://QmXxxx...`
3. 새 NFT 생성

#### 3. 마켓플레이스에서 판매
1. 먼저 NFT 승인: MarketNFT의 `approve()` 또는 `setApprovalForAll()`
2. NFTMarketplace의 `listNFT()` 호출
3. 판매 등록 완료

## 🧪 테스트

프로젝트를 테스트하려면:

1. 테스트 네트워크에서 테스트 ETH 확보
2. 각 페이지에서 기능 테스트:
   - 지갑 연결 여부
   - 토큰 에어드롭
   - NFT 민팅
   - NFT 판매/구매

## 📚 추가 리소스

- [Remix IDE](https://remix.ethereum.org/)
- [ethers.js 문서](https://docs.ethers.org/)
- [Next.js 문서](https://nextjs.org/docs)
- [OpenZeppelin 계약](https://docs.openzeppelin.com/contracts/)
- [ERC-20 표준](https://eips.ethereum.org/EIPS/eip-20)
- [ERC-721 표준](https://eips.ethereum.org/EIPS/eip-721)

## 🚨 주의사항

### 보안
- 이 프로젝트는 교육 목적입니다
- 프로덕션 배포 전에 감사(audit)를 받으세요
- Private key를 절대 노출하지 마세요

### 테스트
- 항상 테스트넷에서 먼저 테스트하세요
- 메인넷 배포 전에 충분한 테스트를 수행하세요

## 📄 라이선스

MIT License

## ✨ 추가 기능 (선택사항)

프로젝트를 확장할 수 있는 기능들:

1. **입찰 시스템**: NFT에 대한 입찰 기능
2. **컬렉션**: 여러 NFT를 그룹화
3. **로열티**: 재판매 시 원작자에게 로열티 지급
4. **평점 시스템**: 판매자/구매자 평점
5. **캐시백**: 거래 시 토큰 보상
6. **DAO**: 커뮤니티 거버넌스

이러한 기능들을 추가하여 프로젝트를 더욱 확장할 수 있습니다.
