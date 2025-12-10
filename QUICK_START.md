# 🚀 NFT Marketplace - 빠른 시작 가이드

## ⚡ 5분 안에 시작하기

### 1단계: Smart Contract 배포 (Remix IDE)

#### A. MarketToken 배포
```
1. https://remix.ethereum.org 접속
2. New File → "MarketToken.sol"
3. contracts/MarketToken.sol 코드 복사
4. Solidity Compiler → 0.8.0 이상 선택
5. Compile MarketToken.sol
6. Deploy & Run Transactions
   - Environment: "Injected Provider - MetaMask"
   - Account: 본인의 MetaMask 계정
7. Deploy 버튼 클릭
8. 배포 주소 복사 → TOKEN_ADDRESS
```

#### B. MarketNFT 배포
```
1. New File → "MarketNFT.sol"
2. contracts/MarketNFT.sol 코드 복사
3. Compile & Deploy (위와 동일)
4. 배포 주소 복사 → NFT_ADDRESS
```

#### C. NFTMarketplace 배포
```
1. New File → "NFTMarketplace.sol"
2. contracts/NFTMarketplace.sol 코드 복사
3. Constructor parameters 입력:
   - _paymentToken: TOKEN_ADDRESS
   - _feeRecipient: 본인 지갑 주소
4. Deploy 버튼 클릭
5. 배포 주소 복사 → MARKETPLACE_ADDRESS
```

### 2단계: Frontend 설정

#### A. 계약 주소 업데이트
```bash
# 파일: frontend/lib/contracts.ts
# 다음 부분을 수정합니다:

export const CONTRACT_ADDRESSES = {
  TOKEN: "0x...",       // 1-A에서 복사한 TOKEN_ADDRESS
  NFT: "0x...",         // 1-B에서 복사한 NFT_ADDRESS
  MARKETPLACE: "0x...", // 1-C에서 복사한 MARKETPLACE_ADDRESS
};
```

#### B. 프로젝트 실행
```bash
cd frontend
npm install
npm run dev
```

#### C. 브라우저 접속
```
http://localhost:3000
```

### 3단계: 애플리케이션 사용

#### Step 1️⃣ 지갑 연결
```
[메인 페이지] → "지갑 연결" 버튼 클릭
→ MetaMask 팝업 → 계정 선택 및 승인
```

#### Step 2️⃣ 토큰 받기
```
"💰 토큰 에어드롭" 카드 클릭
→ "토큰 받기" 버튼
→ MetaMask 승인
→ 1000 토큰 수령 ✅
```

#### Step 3️⃣ NFT 생성
```
"🖼️ NFT 생성" 카드 클릭
→ NFT URI 입력 (예: ipfs://QmXxxx...)
→ "NFT 생성" 버튼
→ MetaMask 승인
→ NFT 생성 완료 ✅
```

#### Step 4️⃣ NFT 판매
```
"🛒 마켓플레이스" 카드 클릭
→ "📤 NFT 판매 등록" 탭
→ NFT ID & 가격 입력
→ "판매 등록" 버튼
→ MetaMask 승인
→ 판매 등록 완료 ✅
```

#### Step 5️⃣ NFT 구매
```
마켓플레이스의 "🛒 NFT 구매" 탭
→ 판매 중인 NFT 목록 확인
→ "구매" 버튼
→ MetaMask 승인 (2회)
→ NFT 구매 완료 ✅
```

---

## 📋 체크리스트

배포 전 확인 사항:

- [ ] MetaMask 설치 및 테스트넷 설정
- [ ] 테스트 네트워크 선택 (Sepolia, Mumbai, Fuji 등)
- [ ] 테스트 ETH/MATIC/AVAX 확보
- [ ] 3개의 Smart Contract 배포 완료
- [ ] 배포 주소를 frontend/lib/contracts.ts에 입력
- [ ] npm install 완료
- [ ] npm run dev 실행 및 localhost:3000 접속 확인

---

## 🐛 문제 해결

### Q. "Cannot find module 'react'" 에러
```bash
A. npm install 을 실행하세요
```

### Q. MetaMask 연결 불가
```bash
A. 1. MetaMask 확장이 설치되었는지 확인
   2. 올바른 테스트넷으로 네트워크 설정
   3. 브라우저 새로고침
```

### Q. "컨트랙트에 토큰이 부족합니다" 오류
```bash
A. 1. Remix IDE에서 MarketToken 컨트랙트 열기
   2. depositTokens() 함수 호출
   3. 충분한 토큰 입력 (예: 1000000 * 10^18)
```

### Q. NFT 구매 시 "NFT is not approved for marketplace"
```bash
A. 1. MarketNFT 컨트랙트에서 setApprovalForAll() 호출
   2. operator: NFTMarketplace 주소
   3. approved: true
```

### Q. 트랜잭션 가스비 너무 많음
```bash
A. 1. 테스트넷이 올바른지 확인
   2. 낮은 가스 가격으로 설정 (MetaMask에서)
   3. 또는 다른 테스트넷 사용 (가스비가 낮은 네트워크)
```

---

## 📚 추가 학습 자료

### Smart Contract 학습
- [Solidity 공식 문서](https://docs.soliditylang.org/)
- [OpenZeppelin 계약 라이브러리](https://docs.openzeppelin.com/contracts/)
- [ERC-20 표준](https://eips.ethereum.org/EIPS/eip-20)
- [ERC-721 표준](https://eips.ethereum.org/EIPS/eip-721)

### Frontend 학습
- [ethers.js 문서](https://docs.ethers.org/)
- [Next.js 문서](https://nextjs.org/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)

### Web3 개발
- [Remix IDE 튜토리얼](https://remix-ide.readthedocs.io/)
- [MetaMask 개발자 문서](https://docs.metamask.io/)
- [테스트 네트워크 Faucet](https://faucetlink.to/)

---

## 💡 팁

### 개발 팁
1. **블록 탐색기 활용**: Etherscan, PolygonScan 등에서 거래 조회
2. **Remix Debugger**: 스마트 계약 오류 디버깅
3. **MetaMask 테스트**: 여러 계정으로 테스트

### 성능 최적화
1. **가스 최적화**: 스마트 계약 코드 최적화
2. **캐싱**: Frontend에서 중복 요청 최소화
3. **배치 처리**: 여러 거래를 한 번에 처리

### 보안 모범 사례
1. **입력 검증**: 사용자 입력 항상 검증
2. **접근 제어**: Ownable 패턴으로 권한 관리
3. **재진입 방지**: ReentrancyGuard 사용

---

## 🎯 다음 단계

1. **보고서 작성**: REPORT_TEMPLATE.md 참고하여 보고서 작성
2. **추가 기능 구현**: 입찰 시스템, 로열티 등
3. **프로덕션 배포**: 메인넷 배포 전 감사(audit) 수행
4. **커뮤니티 구축**: 사용자 피드백 수집

---

## 📞 지원

문제가 발생하면:
1. DEPLOYMENT_GUIDE.md 확인
2. README.md의 추가 리소스 참고
3. 에러 메시지를 자세히 읽고 구글링
4. Remix IDE의 콘솔에서 오류 확인

---

**행운을 빕니다! 🚀**

Happy coding! 💻
