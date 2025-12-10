'use client';

import { useState, useEffect } from 'react';
import { Contract, ethers } from 'ethers'; 
import { getSigner, getCurrentAccount } from '@/lib/web3';
import { CONTRACT_ADDRESSES, ERC721_ABI, MARKETPLACE_ABI, ERC20_ABI } from '@/lib/contracts';
import Link from 'next/link';

// ---------------------------------------------------------
// [인터페이스 정의]
// ---------------------------------------------------------

// NFT 리스팅 정보
interface Listing {
  tokenId: string;
  seller: string;
  price: string;
  active: boolean;
  imageUrl?: string; // 이미지 URL 필드
}

// NFT 상세 정보
interface MyNFTDetail {
    tokenId: string;
    imageUrl: string;
}

// 거래 내역 정보
interface Activity {
  event: string;   // '등록' 또는 '구매'
  price: string;
  from: string;
  to: string;
  date: string;
  hash: string;
}

// ---------------------------------------------------------
// [컴포넌트] 거래 내역 모달
// ---------------------------------------------------------
function HistoryModal({ 
  isOpen, 
  onClose, 
  activities, 
  loading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  activities: Activity[]; 
  loading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#1a1f2e', padding: '30px', borderRadius: '16px', width: '500px', maxWidth: '90%',
        border: '1px solid #2a3142', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ color: '#fff', margin: 0 }}>📜 거래 내역 (Activity)</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
        </div>

        {loading ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>내역을 불러오는 중... ⏳</div>
        ) : activities.length === 0 ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>아직 거래 내역이 없습니다.</div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a3142', color: '#888' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>이벤트</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>가격</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>날짜</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #2a3142' }}>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: act.event === '구매' ? '#10b981' : '#3b82f6', color: '#fff'
                      }}>
                        {act.event}
                      </span>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                        From: {act.from.slice(0,4)}...{act.from.slice(-4)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold' }}>
                      {act.price} MT
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px', fontSize: '12px', color: '#aaa' }}>
                      {act.date}
                      <a href={`https://sepolia.etherscan.io/tx/${act.hash}`} target="_blank" style={{ display: 'block', color: '#00d4ff', textDecoration: 'none', fontSize: '10px', marginTop: '2px' }}>↗ Tx 확인</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// [메인 페이지] MarketplacePage
// ---------------------------------------------------------
export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [myNFTDetails, setMyNFTDetails] = useState<MyNFTDetail[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [selectedTab, setSelectedTab] = useState<'browse' | 'my-nfts' | 'sell'>('browse');
  const [tokenIdToSell, setTokenIdToSell] = useState('');
  const [priceToSell, setPriceToSell] = useState('');

  // 거래 내역 모달 상태
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<Activity[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    const checkMismatch = async () => {
        if (!CONTRACT_ADDRESSES.MARKETPLACE) return;
        const signer = await getSigner();
        const userAddress = await signer.getAddress();
        
        // 1. 마켓플레이스 컨트랙트 연결
        const marketplace = new Contract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, signer);
        
        try {
            // 마켓플레이스가 알고 있는 결제 토큰 주소 가져오기
            // (변수명이 paymentToken, token, erc20Token 중 하나일 수 있음. 보통 paymentToken)
            console.log("🔍 마켓플레이스 설정 조회 중...");
            
            let realTokenAddress;
            try {
                realTokenAddress = await marketplace.paymentToken(); 
            } catch {
                try { realTokenAddress = await marketplace.token(); } catch { console.log("변수명 찾기 실패"); return; }
            }
            
            console.log("==========================================");
            console.log("🕵️‍♀️ [범인 색출] 토큰 주소 비교");
            console.log("1. 내 코드 설정 (lib/contracts.ts):", CONTRACT_ADDRESSES.TOKEN);
            console.log("2. 마켓플레이스 실제 사용 토큰:", realTokenAddress);
            
            if (CONTRACT_ADDRESSES.TOKEN.toLowerCase() !== realTokenAddress.toLowerCase()) {
                console.error("🚨 [심각] 주소가 다릅니다!!!!");
                console.error(`👉 해결책: lib/contracts.ts의 TOKEN 주소를 위 2번 주소(${realTokenAddress})로 고치세요.`);
                alert(`주소 불일치 발견!\n\n내 코드: ...${CONTRACT_ADDRESSES.TOKEN.slice(-4)}\n마켓플레이스: ...${realTokenAddress.slice(-4)}\n\n콘솔을 확인하세요.`);
            } else {
                console.log("✅ 주소는 일치합니다.");
                // 진짜 그 토큰의 잔액 확인
                const token = new Contract(realTokenAddress, ERC20_ABI, signer);
                const bal = await token.balanceOf(userAddress);
                console.log("3. 실제 블록체인상 해당 토큰 잔액:", ethers.formatUnits(bal, 18));
                
                if (bal == 0) {
                     alert("주소는 맞는데, 이 토큰 잔액이 진짜 0원입니다. Mint 페이지에서 토큰을 받으세요.");
                }
            }
            console.log("==========================================");
        } catch (e) {
            console.error("디버깅 실패", e);
        }
    };
    
    checkMismatch(); // 실행

    return () => clearInterval(interval);
}, []);

  const loadData = async () => {
    await loadCurrentAccount();
    await loadMyNFTs(); 
    await loadListings();
  };

  const loadCurrentAccount = async () => {
    const account = await getCurrentAccount();
    setCurrentAccount(account);
  };
    
  /**
   * @dev NFT 이미지 URL 가져오기 (Proxy + Pinata)
   */
  const fetchImageUri = async (tokenId: string): Promise<string> => {
    try {
        const signer = await getSigner();
        const nftContract = new Contract(CONTRACT_ADDRESSES.NFT, ERC721_ABI, signer);

        const tokenUri = await nftContract.tokenURI(tokenId);
        
        // Pinata 게이트웨이 강제 변환
        const toHttpUrl = (url: string) => {
            if (!url) return '';
            let newUrl = url;
            if (newUrl.startsWith('ipfs://')) {
                newUrl = newUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
            }
            if (newUrl.includes('ipfs.io')) {
                newUrl = newUrl.replace('ipfs.io', 'gateway.pinata.cloud');
            }
            return newUrl;
        };

        const metadataHttpUrl = toHttpUrl(tokenUri);
        const proxyMetadataUrl = `/api/proxy?url=${encodeURIComponent(metadataHttpUrl)}`;
        
        let metadata;
        try {
            const response = await fetch(proxyMetadataUrl);
            if (!response.ok) throw new Error('메타데이터 Fetch 실패');
            metadata = await response.json();
        } catch (e) {
            return `/api/proxy?url=${encodeURIComponent(metadataHttpUrl)}`;
        }

        const imageUri = metadata.image || metadata.image_url || metadata.file_url || '';
        
        if (!imageUri) return 'https://via.placeholder.com/200?text=No+Image';

        const imageHttpUrl = toHttpUrl(imageUri);
        return `/api/proxy?url=${encodeURIComponent(imageHttpUrl)}`;

    } catch (error) {
        console.error(`Error fetching metadata for Token ${tokenId}:`, error);
        return 'https://via.placeholder.com/200?text=Error'; 
    }
  };

  /**
   * @dev NFT 거래 내역 조회 (Event Query)
   */
  const fetchNftHistory = async (tokenId: string) => {
    if (!CONTRACT_ADDRESSES.MARKETPLACE) return;
    
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    setSelectedHistory([]);

    try {
      const signer = await getSigner();
      const marketplace = new Contract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, signer);

      const [listEvents, soldEvents] = await Promise.all([
          marketplace.queryFilter('MarketItemCreated'), 
          marketplace.queryFilter('MarketItemSold')     
      ]);

      const formatEvents = async (events: any[], type: string) => {
          const formatted: any[] = [];
          for (const event of events) {
              if (event.args && event.args[0].toString() === tokenId) {
                  const block = await event.getBlock();
                  formatted.push({
                      event: type,
                      price: ethers.formatUnits(event.args.price || event.args[3] || 0, 18),
                      from: event.args.seller || event.args[1],
                      to: event.args.owner || event.args[2] || '-', 
                      date: new Date(block.timestamp * 1000).toLocaleDateString(),
                      hash: event.transactionHash
                  });
              }
          }
          return formatted;
      };

      const listHistory = await formatEvents(listEvents, '등록');
      const soldHistory = await formatEvents(soldEvents, '구매');

      const combined = [...listHistory, ...soldHistory].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setSelectedHistory(combined);

    } catch (error) {
      console.error("이력 조회 실패:", error);
    }
    setHistoryLoading(false);
  };

  const loadMyNFTs = async () => {
    const accountToUse = currentAccount || await getCurrentAccount();
    if (!accountToUse || !CONTRACT_ADDRESSES.NFT || CONTRACT_ADDRESSES.NFT === '0x...') {
      setMyNFTDetails([]);
      return;
    }

    try {
      const signer = await getSigner();
      const nftContract = new Contract(CONTRACT_ADDRESSES.NFT, ERC721_ABI, signer);
      const balance = await nftContract.balanceOf(accountToUse);
      const balanceNumber = parseInt(balance.toString());
      
      const tokenDetailsPromises: Promise<MyNFTDetail>[] = [];

      if (balanceNumber > 0) {
        for (let i = 0; i < balanceNumber; i++) {
          try {
            const tokenId = await nftContract.tokenOfOwnerByIndex(accountToUse, i);
            const tokenIdStr = tokenId.toString();
            tokenDetailsPromises.push(
                fetchImageUri(tokenIdStr).then(imageUrl => ({
                    tokenId: tokenIdStr,
                    imageUrl: imageUrl,
                }))
            );
          } catch (error) { setMyNFTDetails([]); return; }
        }
      }
      setMyNFTDetails(await Promise.all(tokenDetailsPromises));
    } catch (error) { setMyNFTDetails([]); }
  };

  const loadListings = async () => {
    if (!CONTRACT_ADDRESSES.MARKETPLACE || CONTRACT_ADDRESSES.MARKETPLACE === '0x...') return;

    try {
      const signer = await getSigner();
      const marketplace = new Contract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, signer);

      try {
        const allListings = await marketplace.getAllListings(CONTRACT_ADDRESSES.NFT);
        const tempFormattedListings = allListings.map((listing: any) => ({
          tokenId: listing.tokenId.toString(),
          seller: listing.seller,
          price: ethers.formatUnits(listing.price.toString(), 18), 
          active: listing.active
        }));

        const listingsWithImages = await Promise.all(
            tempFormattedListings.map(async (listing: Listing) => {
                const imageUrl = await fetchImageUri(listing.tokenId);
                return { ...listing, imageUrl };
            })
        );

        setListings(listingsWithImages);
      } catch (error) { setListings([]); }
    } catch (error) { console.error('Error loading listings:', error); }
  };

  const handleListNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!CONTRACT_ADDRESSES.MARKETPLACE) return alert('주소 설정 필요');
    if (!tokenIdToSell || !priceToSell) return alert('정보 입력 필요');
    
    const isOwner = myNFTDetails.some(nft => nft.tokenId === tokenIdToSell); 
    if (!isOwner) return alert('소유하지 않은 NFT입니다.');

    setLoading(true);
    setMessage('');

    try {
      const signer = await getSigner();
      const tokenId = BigInt(tokenIdToSell);
      const price = ethers.parseUnits(priceToSell, 18); 

      const nftContract = new Contract(CONTRACT_ADDRESSES.NFT, ERC721_ABI, signer);
      setMessage('NFT 승인 중...');
      const approveTx = await nftContract.setApprovalForAll(CONTRACT_ADDRESSES.MARKETPLACE, true);
      await approveTx.wait();

      const marketplace = new Contract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, signer);
      setMessage('판매 등록 중...');
      const tx = await marketplace.listNFT(CONTRACT_ADDRESSES.NFT, tokenId, price);
      
      setMessage('거래 처리 중... 해시: ' + tx.hash);
      await tx.wait();

      setMessage('✅ NFT 판매 등록 완료!');
      setTokenIdToSell('');
      setPriceToSell('');
      loadData();
    } catch (error) { setMessage('❌ 오류: ' + (error as Error).message); }
    setLoading(false);
  };

  // ⭐️ [수정] 구매 함수: 승인(Approve) 로직 개선 (구매 오류 해결)
  const handleBuyNFT = async (tokenId: string, price: string, seller?: string) => {
    if (!CONTRACT_ADDRESSES.MARKETPLACE) return alert('주소 설정 필요');
    if (seller && currentAccount && seller.toLowerCase() === currentAccount.toLowerCase()) {
      return setMessage('❌ 자신의 NFT는 구매 불가');
    }

    setLoading(true);
    setMessage('');

    try {
      const signer = await getSigner();
      const priceAmount = ethers.parseUnits(price, 18); 

      const token = new Contract(CONTRACT_ADDRESSES.TOKEN, ERC20_ABI, signer);
      
      // 1. 현재 승인된 금액 확인
      const currentAllowance = await token.allowance(await signer.getAddress(), CONTRACT_ADDRESSES.MARKETPLACE);
      
      // 2. 승인 금액이 부족할 경우에만 승인 진행 (무한 승인으로 설정)
      if (currentAllowance < priceAmount) {
          setMessage('토큰 사용 승인 중... (최초 1회)');
          // MaxUint256을 사용하여 무제한 승인 (가스비 절약 및 오류 방지)
          const approveTx = await token.approve(CONTRACT_ADDRESSES.MARKETPLACE, ethers.MaxUint256);
          await approveTx.wait();
      }

      const marketplace = new Contract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, signer);
      
      // 3. 구매 실행
      const buyTx = await marketplace.buyNFT(CONTRACT_ADDRESSES.NFT, tokenId);
      setMessage('구매 처리 중... 해시: ' + buyTx.hash);
      await buyTx.wait();

      setMessage('✅ NFT 구매 완료!');
      await loadData();
    } catch (error) { 
        console.error(error);
        setMessage('❌ 오류: ' + (error as Error).message); 
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1419' }}>
      <header style={{ backgroundColor: '#1a1f2e', borderBottom: '1px solid #2a3142', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px' }}>
          <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', textDecoration: 'none' }}>
            🎨 NFT Marketplace
          </Link>
          <nav style={{ display: 'flex', gap: '30px' }}>
            <Link href="/airdrop" style={{ color: '#aaa', textDecoration: 'none' }}>에어드롭</Link>
            <Link href="/mint" style={{ color: '#aaa', textDecoration: 'none' }}>민팅</Link>
            <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>마켓플레이스</span>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 30px' }}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', borderBottom: '1px solid #2a3142', paddingBottom: '20px', overflowX: 'auto' }}>
          <button onClick={() => setSelectedTab('browse')} style={{ padding: '12px 30px', backgroundColor: selectedTab === 'browse' ? '#00d4ff' : 'transparent', color: selectedTab === 'browse' ? '#0f1419' : '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', whiteSpace: 'nowrap' }}>
            🛒 NFT 구매
          </button>
          <button onClick={() => setSelectedTab('my-nfts')} style={{ padding: '12px 30px', backgroundColor: selectedTab === 'my-nfts' ? '#00d4ff' : 'transparent', color: selectedTab === 'my-nfts' ? '#0f1419' : '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', whiteSpace: 'nowrap' }}>
            📦 내 NFT ({myNFTDetails.length})
          </button>
          <button onClick={() => setSelectedTab('sell')} style={{ padding: '12px 30px', backgroundColor: selectedTab === 'sell' ? '#00d4ff' : 'transparent', color: selectedTab === 'sell' ? '#0f1419' : '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', whiteSpace: 'nowrap' }}>
            📤 NFT 판매 등록
          </button>
        </div>

        {selectedTab === 'browse' && (
          <div>
            <h1 style={{ color: '#fff', marginTop: 0, marginBottom: '30px', fontSize: '32px', fontWeight: 'bold' }}>판매 중인 NFT</h1>

            {listings.filter(l => l.active).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 30px', backgroundColor: '#1a1f2e', borderRadius: '12px', color: '#aaa' }}>
                <p style={{ fontSize: '18px', margin: 0 }}>판매 중인 NFT가 없습니다</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                {listings.filter(l => l.active).map((listing, index) => (
                  <div key={`${listing.tokenId}-${index}`} style={{ backgroundColor: '#1a1f2e', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a3142', boxShadow: '0 4px 15px rgba(0, 212, 255, 0.1)' }}>
                    {/* 이미지 영역 */}
                    <div style={{ height: '200px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', overflow: 'hidden' }}>
                      {listing.imageUrl ? (
                        <img 
                          src={listing.imageUrl} 
                          alt={`Token ${listing.tokenId}`} 
                          loading="lazy"
                          crossOrigin="anonymous"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image'; }}
                        />
                      ) : ( <span>🖼️</span> )}
                    </div>
                    
                    <div style={{ padding: '20px' }}>
                      <div style={{ backgroundColor: '#00d4ff', padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#0f1419', fontWeight: 'bold' }}>토큰 ID</p>
                        <p style={{ margin: '0', fontSize: '28px', color: '#0f1419', fontWeight: 'bold' }}>#{listing.tokenId}</p>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>판매자</p>
                        <p style={{ margin: '0', fontSize: '11px', color: '#00d4ff', wordBreak: 'break-all', fontFamily: 'monospace', backgroundColor: '#0f1419', padding: '8px', borderRadius: '6px' }}>
                          {listing.seller.slice(0, 10)}...{listing.seller.slice(-8)}
                        </p>
                      </div>

                      <div style={{ backgroundColor: '#2a3142', padding: '12px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #00d4ff' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>가격</p>
                        <p style={{ margin: '0', fontSize: '24px', color: '#00d4ff', fontWeight: 'bold' }}>{listing.price}</p>
                        <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: '#666' }}>MarketToken</p>
                      </div>

                      <button
                        onClick={() => handleBuyNFT(listing.tokenId, listing.price, listing.seller)}
                        disabled={loading || (!!currentAccount && listing.seller.toLowerCase() === currentAccount.toLowerCase())}
                        style={{
                          width: '100%', padding: '14px',
                          backgroundColor: (!!currentAccount && listing.seller.toLowerCase() === currentAccount.toLowerCase()) ? '#666' : (loading ? '#555' : '#00d4ff'),
                          color: loading ? '#aaa' : ((!!currentAccount && listing.seller.toLowerCase() === currentAccount.toLowerCase()) ? '#ddd' : '#0f1419'),
                          border: 'none', borderRadius: '8px',
                          cursor: loading ? 'not-allowed' : ((!!currentAccount && listing.seller.toLowerCase() === currentAccount.toLowerCase()) ? 'not-allowed' : 'pointer'),
                          fontWeight: 'bold', fontSize: '15px'
                        }}
                      >
                        {loading ? '처리 중...' : (currentAccount && listing.seller.toLowerCase() === currentAccount.toLowerCase() ? '내 NFT' : '✓ 구매하기')}
                      </button>

                      {/* 🕒 거래 내역 버튼 추가 */}
                      <button 
                          onClick={(e) => { e.stopPropagation(); fetchNftHistory(listing.tokenId); }}
                          style={{ marginTop: '10px', width: '100%', padding: '8px', backgroundColor: 'transparent', border: '1px solid #2a3142', color: '#aaa', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                      >
                          🕒 거래 내역 보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {message && (
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: message.includes('✅') ? '#1a3a2a' : message.includes('❌') ? '#3a1a1a' : '#1a2a3a', color: message.includes('✅') ? '#4ade80' : message.includes('❌') ? '#ff6b6b' : '#60a5fa', border: `1px solid ${message.includes('✅') ? '#22c55e' : message.includes('❌') ? '#ef4444' : '#3b82f6'}`, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '13px' }}>
                {message}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'my-nfts' && (
          <div>
            <h1 style={{ color: '#fff', marginTop: 0, marginBottom: '30px', fontSize: '32px', fontWeight: 'bold' }}>📦 내 NFT ({myNFTDetails.length}개)</h1>

            {myNFTDetails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 30px', backgroundColor: '#1a1f2e', borderRadius: '12px', color: '#aaa' }}>
                <p style={{ fontSize: '18px', margin: '0 0 10px 0' }}>소유하신 NFT가 없습니다</p>
                <p style={{ fontSize: '14px', margin: 0 }}>민팅 페이지에서 새로운 NFT를 생성해보세요!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                {myNFTDetails.map((nftDetail) => {
                  const listing = listings.find(l => l.tokenId === nftDetail.tokenId);
                  const isForSale = listing && listing.active;
                  
                  return (
                    <div key={nftDetail.tokenId} style={{ backgroundColor: '#1a1f2e', borderRadius: '12px', overflow: 'hidden', border: isForSale ? '2px solid #00d4ff' : '1px solid #2a3142', boxShadow: isForSale ? '0 4px 15px rgba(0, 212, 255, 0.2)' : '0 4px 15px rgba(0, 212, 255, 0.1)' }}>
                      <div style={{ height: '200px', background: 'linear-gradient(135deg, #2d5a3d 0%, #1a3a2a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', position: 'relative', overflow: 'hidden' }}>
                        {nftDetail.imageUrl ? (
                          <img 
                            src={nftDetail.imageUrl} 
                            alt={`NFT #${nftDetail.tokenId}`} 
                            loading="lazy" crossOrigin="anonymous"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Image+Load+Fail'; }}
                          />
                        ) : ( <span>🎨</span> )}
                        
                        {isForSale && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#00d4ff', color: '#0f1419', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>판매 중</div>
                        )}
                      </div>
                      <div style={{ padding: '20px' }}>
                        <div style={{ backgroundColor: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
                          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>내 NFT</p>
                          <p style={{ margin: '0', fontSize: '28px', color: '#fff', fontWeight: 'bold' }}>#{nftDetail.tokenId}</p>
                        </div>

                        {isForSale && (
                          <div style={{ backgroundColor: '#2a3142', padding: '12px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #00d4ff' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>판매 가격</p>
                            <p style={{ margin: '0', fontSize: '24px', color: '#00d4ff', fontWeight: 'bold' }}>{listing.price}</p>
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <button onClick={() => { setSelectedTab('sell'); setTokenIdToSell(nftDetail.tokenId); }} style={{ padding: '12px', backgroundColor: '#00d4ff', color: '#0f1419', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            {isForSale ? '✏️ 수정' : '📤 판매'}
                          </button>
                          <button onClick={() => loadMyNFTs()} style={{ padding: '12px', backgroundColor: '#555', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            🔄 새로고침
                          </button>
                        </div>
                        
                        {/* 🕒 거래 내역 버튼 추가 */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); fetchNftHistory(nftDetail.tokenId); }}
                            style={{ marginTop: '10px', width: '100%', padding: '8px', backgroundColor: 'transparent', border: '1px solid #2a3142', color: '#aaa', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                        >
                            🕒 거래 내역 보기
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'sell' && (
          <div style={{ backgroundColor: '#1a1f2e', padding: '40px', borderRadius: '12px', border: '1px solid #2a3142' }}>
            <h2 style={{ color: '#fff', marginTop: '0', marginBottom: '30px', fontSize: '24px' }}>📤 NFT 판매 등록</h2>
            <form onSubmit={handleListNFT} style={{ maxWidth: '600px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontWeight: 'bold' }}>NFT ID (tokenId)</label>
                <input type="number" value={tokenIdToSell} onChange={(e) => setTokenIdToSell(e.target.value)} placeholder="예: 1" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2a3142', backgroundColor: '#0f1419', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} disabled={loading} />
                {tokenIdToSell && !myNFTDetails.some(nft => nft.tokenId === tokenIdToSell) && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#ff6b6b' }}>⚠️ 이 NFT를 소유하고 있지 않습니다</p>
                )}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontWeight: 'bold' }}>가격 (MarketToken)</label>
                <input type="number" value={priceToSell} onChange={(e) => setPriceToSell(e.target.value)} placeholder="예: 100" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2a3142', backgroundColor: '#0f1419', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} disabled={loading} />
              </div>
              <button type="submit" disabled={loading || !tokenIdToSell || !priceToSell} style={{ width: '100%', padding: '14px', backgroundColor: loading || !tokenIdToSell || !priceToSell ? '#555' : '#00d4ff', color: loading || !tokenIdToSell || !priceToSell ? '#aaa' : '#0f1419', border: 'none', borderRadius: '8px', cursor: loading || !tokenIdToSell || !priceToSell ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                {loading ? '처리 중...' : '✓ 판매 등록'}
              </button>
            </form>
            {message && (
              <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', backgroundColor: message.includes('✅') ? '#1a3a2a' : message.includes('❌') ? '#3a1a1a' : '#1a2a3a', color: message.includes('✅') ? '#4ade80' : message.includes('❌') ? '#ff6b6b' : '#60a5fa', border: `1px solid ${message.includes('✅') ? '#22c55e' : message.includes('❌') ? '#ef4444' : '#3b82f6'}`, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '13px' }}>
                {message}
              </div>
            )}
          </div>
        )}

        {/* 거래 내역 모달 */}
        <HistoryModal 
          isOpen={historyModalOpen} 
          onClose={() => setHistoryModalOpen(false)} 
          activities={selectedHistory}
          loading={historyLoading}
        />
      </main>
    </div>
  );
}