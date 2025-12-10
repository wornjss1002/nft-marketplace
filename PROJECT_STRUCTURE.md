# NFT Marketplace 프로젝트 구조

```
nft-marketplace/
│
├── 📄 README.md                    # 프로젝트 전체 가이드
├── 📄 QUICK_START.md               # 5분 빠른 시작 가이드
├── 📄 DEPLOYMENT_GUIDE.md          # 상세 배포 가이드
├── 📄 REPORT_TEMPLATE.md           # 보고서 템플릿
│
├── 📁 contracts/                   # Smart Contracts (Solidity)
│   ├── MarketToken.sol             # ERC-20 토큰 컨트랙트
│   │   ├─ requestAirdrop()         # 1000 토큰 에어드롭
│   │   ├─ depositTokens()          # 토큰 충전 (소유자)
│   │   └─ withdrawTokens()         # 토큰 회수 (소유자)
│   │
│   ├── MarketNFT.sol               # ERC-721 NFT 컨트랙트
│   │   ├─ mint(uri)                # NFT 생성
│   │   ├─ tokenURI(tokenId)        # 메타데이터 조회
│   │   └─ setTokenURI()            # URI 업데이트 (소유자)
│   │
│   └── NFTMarketplace.sol          # 마켓플레이스 컨트랙트
│       ├─ listNFT()                # NFT 판매 등록
│       ├─ buyNFT()                 # NFT 구매
│       ├─ cancelListing()          # 판매 취소
│       └─ getListing()             # 판매 정보 조회
│
└── 📁 frontend/                    # Next.js Frontend
    ├── 📄 package.json             # 의존성 정의
    ├── 📄 tsconfig.json            # TypeScript 설정
    ├── 📄 next.config.js           # Next.js 설정
    ├── 📄 README.md                # Frontend 가이드
    │
    ├── 📁 lib/                     # Web3 유틸리티
    │   ├── contracts.ts            # 계약 주소 & ABI
    │   │   ├─ CONTRACT_ADDRESSES
    │   │   ├─ ERC20_ABI
    │   │   ├─ ERC721_ABI
    │   │   └─ MARKETPLACE_ABI
    │   │
    │   └── web3.ts                 # ethers.js 헬퍼
    │       ├─ connectWallet()
    │       ├─ getProvider()
    │       ├─ getSigner()
    │       ├─ getCurrentAccount()
    │       └─ getBalance()
    │
    ├── 📁 app/                     # Next.js App Router
    │   ├── layout.tsx              # 루트 레이아웃
    │   ├── globals.css             # 전역 스타일
    │   ├── page.tsx                # 홈페이지 (/)
    │   │   └─ 기능 소개
    │   │   └─ 지갑 연결
    │   │   └─ 3가지 주요 기능 네비게이션
    │   │
    │   ├── 📁 airdrop/             # 에어드롭 페이지
    │   │   └── page.tsx            # (/airdrop)
    │   │       └─ 토큰 에어드롭 신청
    │   │
    │   ├── 📁 mint/                # NFT 민팅 페이지
    │   │   └── page.tsx            # (/mint)
    │   │       └─ NFT 생성
    │   │
    │   └── 📁 marketplace/         # 마켓플레이스 페이지
    │       └── page.tsx            # (/marketplace)
    │           ├─ NFT 구매 (탭 1)
    │           └─ NFT 판매 등록 (탭 2)
    │
    ├── 📁 components/              # React 컴포넌트 (필요시)
    │
    └── 📁 public/                  # 정적 파일
```

---

## 🔄 데이터 흐름

### 1️⃣ 토큰 에어드롭 플로우
```
User Interface
    ↓ (requestAirdrop 클릭)
web3.ts (getProvider, getSigner)
    ↓
ethers.js (Contract 인스턴스)
    ↓
MarketToken.sol (requestAirdrop())
    ↓
블록체인 거래 제출
    ↓
MetaMask 서명
    ↓
거래 완료 (1000 토큰 지급)
```

### 2️⃣ NFT 민팅 플로우
```
User Interface (mint page)
    ↓ (NFT URI 입력)
web3.ts (getSigner)
    ↓
MarketNFT.sol (mint(uri))
    ↓
새로운 NFT 생성 (ID 자동 증가)
    ↓
사용자에게 소유권 할당
```

### 3️⃣ NFT 거래 플로우
```
판매자: listNFT() 호출
    ↓
판매 목록 등록 (listings 매핑)
    ↓
구매자: buyNFT() 호출
    ↓
1단계: 토큰 승인 (approve)
    ↓
2단계: 구매 실행
    - 토큰 -> 판매자 전송
    - 수수료 -> 관리자 전송
    - NFT -> 구매자 전송
    ↓
거래 완료
```

---

## 📊 컨트랙트 상호작용

### MarketToken ↔ NFTMarketplace
```
NFTMarketplace는 MarketToken의 
transferFrom()을 사용하여 토큰 결제
```

### MarketNFT ↔ NFTMarketplace
```
1. NFT 소유자가 NFT 승인 (approve/setApprovalForAll)
2. NFTMarketplace가 transferFrom()으로 NFT 전송
```

---

## 🛠️ 개발 환경 설정

### 필요한 도구
- Node.js 16+
- MetaMask 브라우저 확장
- Remix IDE (스마트 계약 배포용)
- 텍스트 편집기 (VS Code 권장)

### 의존성
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "ethers": "^6.8.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0"
  }
}
```

---

## 🔐 보안 기능

### 1. ReentrancyGuard
```
NFTMarketplace에서 재진입 공격 방지
```

### 2. Ownable
```
MarketToken과 MarketNFT에서 
소유자만 특정 기능 호출 가능
```

### 3. 중복 방지
```
MarketToken의 hasReceivedAirdrop 매핑으로
한 주소당 한 번만 에어드롭 신청 가능
```

### 4. 권한 체크
```
- listNFT(): 소유자만 판매 등록
- buyNFT(): 토큰 잔액 확인
- cancelListing(): 판매자만 취소 가능
```

---

## 📈 확장 가능 구조

기존 구조에 다음 기능을 추가할 수 있습니다:

```
├── Auction.sol          # 입찰 시스템
├── Royalty.sol          # 로열티 시스템
├── Collection.sol       # NFT 컬렉션
├── Governance.sol       # DAO 거버넌스
└── RewardToken.sol      # 보상 토큰
```

각각을 NFTMarketplace와 연결하여 
더 복잡한 기능을 구현할 수 있습니다.

---

## 🎨 UI 구조

### 홈페이지 (/)
```
┌─────────────────────────────────────┐
│ 🎨 NFT Marketplace  [지갑 연결]      │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────┐ │
│  │   💰    │ │   🖼️    │ │  🛒  │ │
│  │ 에어드롭 │ │ NFT생성  │ │마켓  │ │
│  └──────────┘ └──────────┘ └──────┘ │
│                                     │
│  [사용 방법 정보]                   │
└─────────────────────────────────────┘
```

### 에어드롭 페이지 (/airdrop)
```
┌─────────────────────────────────────┐
│ 💰 토큰 에어드롭                    │
├─────────────────────────────────────┤
│ [토큰 받기 버튼]                    │
│ [거래 상태]                         │
│ [정보]                              │
└─────────────────────────────────────┘
```

### 민팅 페이지 (/mint)
```
┌─────────────────────────────────────┐
│ 🖼️ NFT 생성                         │
├─────────────────────────────────────┤
│ NFT URI: [입력 필드]                │
│ [NFT 생성 버튼]                     │
│ [거래 상태]                         │
│ [메타데이터 예시]                   │
└─────────────────────────────────────┘
```

### 마켓플레이스 페이지 (/marketplace)
```
┌─────────────────────────────────────┐
│ [NFT 구매] [NFT 판매 등록]          │
├─────────────────────────────────────┤
│ 탭 1: NFT 구매                      │
│ ┌──────────┐ ┌──────────┐           │
│ │ 🖼️ NFT#1 │ │ 🖼️ NFT#2 │ ...      │
│ │가격: 100  │ │가격: 200  │           │
│ │[구매]     │ │[구매]     │           │
│ └──────────┘ └──────────┘           │
│                                     │
│ 탭 2: NFT 판매 등록                 │
│ NFT ID: [입력]                      │
│ 가격: [입력]                        │
│ [판매 등록]                         │
└─────────────────────────────────────┘
```

---

## 🚀 배포 순서

1. **Smart Contract 배포** (Remix IDE)
   - MarketToken 배포 → 주소 기록
   - MarketNFT 배포 → 주소 기록
   - NFTMarketplace 배포 → 주소 기록

2. **Frontend 설정**
   - lib/contracts.ts에 주소 입력
   - npm install
   - npm run dev

3. **테스트 및 검증**
   - 지갑 연결 테스트
   - 에어드롭 테스트
   - NFT 민팅 테스트
   - NFT 거래 테스트

4. **보고서 작성**
   - REPORT_TEMPLATE.md 참고
   - 배포 정보 기록
   - 테스트 결과 기록

---

## 📞 문제 해결 팁

| 문제 | 해결책 |
|-----|-------|
| MetaMask 연결 불가 | 확장 설치 확인, 올바른 네트워크 설정 |
| 컨트랙트 찾을 수 없음 | lib/contracts.ts의 주소 확인 |
| 가스비 부족 | Faucet에서 테스트 ETH 추가 획득 |
| 토큰 부족 | 컨트랙트에 토큰 충전 (depositTokens) |
| NFT 승인 오류 | approve() 또는 setApprovalForAll() 호출 |

---

**프로젝트 구조가 명확하고 확장 가능하도록 설계되었습니다! 🎉**
