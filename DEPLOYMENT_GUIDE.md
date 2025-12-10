# NFT Marketplace 배포 가이드

## 1. Smart Contracts 배포 (Remix IDE)

### 1.1 Remix IDE 접속
- https://remix.ethereum.org/ 에 접속합니다

### 1.2 컨트랙트 생성 및 배포

#### Step 1: MarketToken.sol 배포
1. Remix IDE의 File Explorer에서 새 파일 생성: `contracts/MarketToken.sol`
2. 아래 코드를 복사하여 붙여넣습니다:
   - `contracts/MarketToken.sol` 파일의 내용

3. 컴파일:
   - Solidity Compiler 탭에서 `0.8.0` 이상 버전 선택
   - `Compile MarketToken.sol` 클릭

4. 배포:
   - Deploy & Run Transactions 탭 선택
   - Environment를 "Injected Provider - MetaMask"로 선택
   - 네트워크를 테스트넷으로 전환 (Sepolia, Mumbai, Fuji 등)
   - MarketToken 컨트랙트 선택
   - Deploy 버튼 클릭
   - MetaMask 확인 창에서 승인
   - 배포 후 주소 복사: `TOKEN_ADDRESS`

5. 에어드롭용 토큰 충전:
   - 배포된 MarketToken 컨트랙트에서
   - `depositTokens` 함수 호출 (예: 1000000 * 10^18)
   - MetaMask 승인

#### Step 2: MarketNFT.sol 배포
1. 새 파일 생성: `contracts/MarketNFT.sol`
2. 컴파일 및 배포 (위와 동일한 절차)
3. 배포 후 주소 복사: `NFT_ADDRESS`

#### Step 3: NFTMarketplace.sol 배포
1. 새 파일 생성: `contracts/NFTMarketplace.sol`
2. 컴파일
3. 배포 시 생성자 매개변수:
   - `_paymentToken`: MarketToken 주소 (TOKEN_ADDRESS)
   - `_feeRecipient`: 수수료 수령인 주소 (본인의 지갑 주소)
4. Deploy 클릭
5. 배포 후 주소 복사: `MARKETPLACE_ADDRESS`

### 1.3 NFT 승인 설정
1. MarketNFT 컨트랙트에서 `setApprovalForAll` 또는 `approve` 함수 호출
   - spender (operator): NFTMarketplace 주소
   - approved: true
   - MetaMask 승인

## 2. Frontend 설정

### 2.1 계약 주소 설정
`frontend/lib/contracts.ts` 파일을 수정합니다:

```typescript
export const CONTRACT_ADDRESSES = {
  TOKEN: "0x...",       // 1단계에서 복사한 TOKEN_ADDRESS
  NFT: "0x...",         // 1단계에서 복사한 NFT_ADDRESS
  MARKETPLACE: "0x...", // 1단계에서 복사한 MARKETPLACE_ADDRESS
};
```

### 2.2 프로젝트 설치 및 실행

```bash
cd frontend
npm install
npm run dev
```

localhost:3000 에서 접속 가능합니다.

## 3. 사용 절차

### 3.1 지갑 연결
1. 메인 페이지에서 "지갑 연결" 버튼 클릭
2. MetaMask 확인 창에서 승인

### 3.2 토큰 에어드롭 받기
1. "토큰 에어드롭" 페이지 이동
2. "토큰 받기" 버튼 클릭
3. MetaMask 확인 후 1000 토큰 수령

### 3.3 NFT 생성하기
1. "NFT 생성" 페이지 이동
2. NFT URI 입력 (IPFS 또는 웹 주소)
   - 예: `ipfs://QmXxxx...` 또는 `https://example.com/metadata.json`
3. "NFT 생성" 버튼 클릭

### 3.4 NFT 판매 등록하기
1. "마켓플레이스" → "NFT 판매 등록" 탭
2. NFT ID와 판매 가격 입력
3. "판매 등록" 버튼 클릭

### 3.5 NFT 구매하기
1. "마켓플레이스" → "NFT 구매" 탭
2. 판매 중인 NFT 확인
3. "구매" 버튼 클릭

## 4. 테스트 네트워크

권장 테스트 네트워크:
- **Sepolia**: https://sepoliafaucet.com/
- **Mumbai (Polygon)**: https://faucet.polygon.technology/
- **Fuji (Avalanche)**: https://faucet.avax.network/

각 네트워크에서 테스트 ETH/MATIC/AVAX를 받아서 테스트할 수 있습니다.

## 5. 문제 해결

### MetaMask 연결 실패
- MetaMask 확장 프로그램이 설치되었는지 확인
- 네트워크가 올바른 테스트넷으로 설정되어 있는지 확인

### 토큰 부족 오류
- 해당 지갑이 토큰을 충분히 보유하고 있는지 확인
- 에어드롭을 받았는지 확인

### 가스비 오류
- 테스트넷에서 충분한 가스비용 (ETH/MATIC)을 보유하고 있는지 확인
- Faucet에서 추가로 받을 수 있습니다

## 6. 배포 완료 후

배포 완료 후 다음 정보를 보고서에 기록합니다:

```
[배포 정보]
- MarketToken 주소: 0x...
- MarketNFT 주소: 0x...
- NFTMarketplace 주소: 0x...
- 테스트 네트워크: [선택한 네트워크]
- 배포 일시: [날짜]
```
