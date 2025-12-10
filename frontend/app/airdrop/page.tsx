'use client';

import { useState } from 'react';
import { Contract } from 'ethers';
import { getSigner } from '@/lib/web3';
import { CONTRACT_ADDRESSES, ERC20_ABI } from '@/lib/contracts';
import Link from 'next/link';

export default function AirdropPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRequestAirdrop = async () => {
    if (!CONTRACT_ADDRESSES.TOKEN || CONTRACT_ADDRESSES.TOKEN === '0x...') {
      setMessage('❌ 토큰 컨트랙트 주소를 설정해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const signer = await getSigner();
      const tokenContract = new Contract(
        CONTRACT_ADDRESSES.TOKEN,
        ERC20_ABI,
        signer
      );

      const tx = await tokenContract.requestAirdrop();
      setMessage('⏳ 거래가 처리 중입니다... 해시: ' + tx.hash);

      await tx.wait();
      setMessage('✅ 1000 토큰을 받았습니다!');
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
              color: '#00d4ff',
              textDecoration: 'none',
              borderBottom: '2px solid #00d4ff',
              paddingBottom: '4px'
            }}>에어드롭</Link>
            <Link href="/mint" style={{ 
              color: '#aaa',
              textDecoration: 'none',
              transition: 'color 0.3s',
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
              💰 토큰 에어드롭
            </h1>
            <p style={{ 
              color: '#888',
              margin: 0,
              fontSize: '14px'
            }}>
              1000 토큰을 받고 마켓플레이스에서 NFT를 구매하세요
            </p>
          </div>

          {/* Button */}
          <button
            onClick={handleRequestAirdrop}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 20px',
              backgroundColor: loading ? '#444' : '#00d4ff',
              color: loading ? '#888' : '#0f1419',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
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
            {loading ? '처리 중...' : '🎁 토큰 받기'}
          </button>

          {/* Message */}
          {message && (
            <div style={{
              padding: '14px 16px',
              borderRadius: '8px',
              backgroundColor: message.includes('✅') ? 'rgba(16, 185, 129, 0.15)' : message.includes('⏳') ? 'rgba(0, 212, 255, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: message.includes('✅') ? '#10b981' : message.includes('⏳') ? '#00d4ff' : '#ef4444',
              wordBreak: 'break-all',
              fontSize: '14px',
              border: `1px solid ${message.includes('✅') ? '#10b981' : message.includes('⏳') ? '#00d4ff' : '#ef4444'}`
            }}>
              {message}
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
              ℹ️ 에어드롭 정보
            </h3>
            <ul style={{
              margin: '0',
              paddingLeft: '20px',
              color: '#aaa',
              fontSize: '14px'
            }}>
              <li style={{ marginBottom: '8px' }}>지갑을 연결한 후 버튼을 클릭하세요</li>
              <li style={{ marginBottom: '8px' }}>한 번의 거래로 <strong style={{ color: '#fff' }}>1000 토큰</strong>을 받습니다</li>
              <li style={{ marginBottom: '8px' }}>받은 토큰은 마켓플레이스에서 NFT 구매에 사용됩니다</li>
              <li>거래 수수료(가스비)는 자동으로 청구됩니다</li>
            </ul>
          </div>

          {/* Token Details */}
          <div style={{
            marginTop: '24px',
            padding: '24px',
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            borderRadius: '8px',
            border: '1px solid #2a3142'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0',
              color: '#fff',
              fontSize: '16px'
            }}>
              🪙 토큰 정보
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              fontSize: '13px'
            }}>
              <div style={{
                backgroundColor: '#1a1f2e',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #2a3142'
              }}>
                <div style={{ color: '#888', marginBottom: '4px' }}>에어드롭 금액</div>
                <div style={{ color: '#00d4ff', fontWeight: '600', fontSize: '16px' }}>1000 토큰</div>
              </div>
              <div style={{
                backgroundColor: '#1a1f2e',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #2a3142'
              }}>
                <div style={{ color: '#888', marginBottom: '4px' }}>에어드롭 가능</div>
                <div style={{ color: '#10b981', fontWeight: '600', fontSize: '16px' }}>한 번</div>
              </div>
            </div>
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
              💡 <strong style={{ color: '#fff' }}>다음 단계:</strong> 토큰을 받은 후 민팅 페이지에서 NFT를 생성하고, 
              마켓플레이스에서 판매하거나 다른 NFT를 구매할 수 있습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
