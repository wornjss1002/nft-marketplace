'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Contract } from 'ethers';
import { getSigner } from '@/lib/web3';
import { CONTRACT_ADDRESSES, ERC721_ABI } from '@/lib/contracts';

export default function MintPage() {
  const [nftUri, setNftUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // ⭐️ 새로 추가: 발행된 토큰 ID를 저장할 상태
  const [mintedId, setMintedId] = useState<string | null>(null);

  const handleMintNFT = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!CONTRACT_ADDRESSES.NFT || CONTRACT_ADDRESSES.NFT === '0x...') {
      setMessage('❌ NFT 컨트랙트 주소를 설정해주세요.');
      return;
    }

    if (!nftUri.trim()) {
      setMessage('❌ NFT URI를 입력해주세요');
      return;
    }

    setLoading(true);
    setMessage('');
    setMintedId(null); // 새로운 민팅 시 ID 초기화

    try {
      const signer = await getSigner();
      const nftContract = new Contract(
        CONTRACT_ADDRESSES.NFT,
        ERC721_ABI,
        signer
      );

      const tx = await nftContract.mint(nftUri);
      setMessage('⏳ NFT 발행 중... 해시: ' + tx.hash);

      // ⭐️ 트랜잭션 완료 대기 및 영수증 확보
      const receipt = await tx.wait();

      let extractedTokenId: string | null = null;
      
      // ⭐️ NFTMinted 이벤트 분석을 통한 토큰 ID 추출
      // 영수증의 로그(logs) 배열을 순회합니다.
      for (const log of receipt.logs) {
        try {
          // ABI를 사용하여 로그를 디코딩합니다.
          const parsedLog = nftContract.interface.parseLog(log);

          if (parsedLog && parsedLog.name === 'NFTMinted') {
            // 이벤트 아규먼트에서 tokenId를 추출합니다.
            // parsedLog.args.tokenId 또는 parsedLog.args[1]로 접근 가능
            extractedTokenId = parsedLog.args.tokenId.toString();
            break; 
          }
        } catch (e) {
          // 해당 로그가 NFT 컨트랙트의 로그가 아닐 경우 에러가 발생하며 무시됩니다.
        }
      }

      // ⭐️ 추출된 tokenId를 사용하여 메시지 및 상태 업데이트
      if (extractedTokenId) {
          setMintedId(extractedTokenId); // 상태 저장
          setMessage(`✅ NFT가 성공적으로 발행되었습니다! 토큰 ID: #${extractedTokenId}`);
      } else {
          setMessage('✅ NFT가 성공적으로 발행되었습니다! (ID를 찾을 수 없습니다)');
      }
      
      setNftUri('');
    } catch (error) {
      setMessage('❌ 오류: ' + (error as Error).message);
    }

    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f1419',
      color: '#fff'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1a1f2e',
        borderBottom: '1px solid #2a3142',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0 20px' 
        }}>
          <Link href="/" style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            color: '#00d4ff',
            textDecoration: 'none'
          }}>
            🎨 NFT Marketplace
          </Link>
          <nav style={{ display: 'flex', gap: '30px' }}>
            <Link href="/airdrop" style={{ 
              color: '#aaa',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}>에어드롭</Link>
            <Link href="/mint" style={{ 
              color: '#00d4ff',
              textDecoration: 'none',
              borderBottom: '2px solid #00d4ff',
              paddingBottom: '4px'
            }}>민팅</Link>
            <Link href="/marketplace" style={{ 
              color: '#aaa',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}>마켓플레이스</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{
          backgroundColor: '#1a1f2e',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #2a3142',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.1)'
        }}>
          {/* Title */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '32px',
              margin: '0 0 8px 0',
              color: '#fff'
            }}>
              🖼️ NFT 생성
            </h1>
            <p style={{ 
              color: '#888',
              margin: 0,
              fontSize: '14px'
            }}>
              새로운 NFT를 발행하세요
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleMintNFT}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#fff',
                fontSize: '14px'
              }}>
                NFT URI (메타데이터 주소)
              </label>
              <input
                type="text"
                value={nftUri}
                onChange={(e) => setNftUri(e.target.value)}
                placeholder="ipfs://QmXXX... 또는 https://..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #2a3142',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#0f1419',
                  color: '#fff',
                  transition: 'border-color 0.3s, box-shadow 0.3s'
                }}
                disabled={loading}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00d4ff';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 212, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#2a3142';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 20px',
                backgroundColor: loading ? '#444' : '#00d4ff',
                color: loading ? '#888' : '#0f1419',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                transform: loading ? 'scale(1)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 212, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? '처리 중...' : '✨ NFT 생성'}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div style={{
              marginTop: '24px',
              padding: '14px 16px',
              borderRadius: '8px',
              backgroundColor: message.includes('✅') ? 'rgba(16, 185, 129, 0.15)' : message.includes('⏳') ? 'rgba(0, 212, 255, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: message.includes('✅') ? '#10b981' : message.includes('⏳') ? '#00d4ff' : '#ef4444',
              wordBreak: 'break-all',
              fontSize: '14px',
              border: `1px solid ${message.includes('✅') ? '#10b981' : message.includes('⏳') ? '#00d4ff' : '#ef4444'}`
            }}>
              {message}
              {/* ⭐️ 토큰 ID가 추출되었고 성공 메시지인 경우 마켓플레이스 링크 추가 */}
              {message.includes('✅') && mintedId && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>다음 단계:</p>
                    <Link href="/marketplace" style={{ color: '#00d4ff', textDecoration: 'underline', fontWeight: 'bold' }}>
                        마켓플레이스에서 NFT 확인 및 판매하기 ➡️
                    </Link>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div style={{
            marginTop: '40px',
            padding: '24px',
            backgroundColor: 'rgba(0, 212, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid #2a3142'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0',
              color: '#00d4ff',
              fontSize: '16px'
            }}>
              ℹ️ NFT URI란?
            </h3>
            <p style={{ 
              color: '#aaa',
              margin: '0 0 12px 0',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              NFT URI는 NFT의 메타데이터(이름, 설명, 이미지 등)가 저장된 위치입니다. 
              IPFS 주소나 웹 URL을 사용할 수 있습니다.
            </p>

            <div style={{
              backgroundColor: '#0f1419',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#888',
              fontFamily: 'monospace',
              overflow: 'auto',
              border: '1px solid #2a3142'
            }}>
{`메타데이터 예시 (JSON):
{
  "name": "My Awesome NFT",
  "description": "This is my NFT",
  "image": "https://example.com/image.png",
  "attributes": [{"trait_type": "Color", "value": "Blue"}]
}`}
            </div>

            <ul style={{
              margin: '16px 0 0 0',
              paddingLeft: '20px',
              color: '#aaa',
              fontSize: '14px'
            }}>
              <li style={{ marginBottom: '6px' }}>IPFS: ipfs://Qm로 시작하는 해시</li>
              <li style={{ marginBottom: '6px' }}>HTTP: https://로 시작하는 웹 URL</li>
              <li>누구나 새로운 NFT를 발행할 수 있습니다</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            borderRadius: '8px',
            border: '1px solid #2a3142'
          }}>
            <p style={{ 
              color: '#aaa',
              margin: 0,
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              💡 <strong style={{ color: '#fff' }}>팁:</strong> NFT 생성 후 마켓플레이스에서 판매할 수 있습니다. 
              마켓플레이스에서 자동으로 승인 절차가 진행됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}