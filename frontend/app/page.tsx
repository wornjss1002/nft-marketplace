'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getCurrentAccount } from '@/lib/web3';
import Link from 'next/link';

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAccount = async () => {
      const currentAccount = await getCurrentAccount();
      setAccount(currentAccount);
    };
    checkAccount();
  }, []);

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      const account = await connectWallet();
      setAccount(account);
    } catch (error) {
      alert((error as Error).message);
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
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            margin: 0,
            color: '#00d4ff'
          }}>
            🎨 NFT Marketplace
          </h1>
          <button
            onClick={handleConnectWallet}
            disabled={loading}
            style={{
              backgroundColor: account ? '#10b981' : '#00d4ff',
              color: account ? '#fff' : '#0f1419',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 4px 16px rgba(${account ? '16, 185, 129' : '0, 212, 255'}, 0.4)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? '연결 중...' : account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '지갑 연결'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 20px' }}>
        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '60px'
        }}>
          {/* Token Airdrop Card */}
          <Link href="/airdrop" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#1a1f2e',
              padding: '32px 24px',
              borderRadius: '12px',
              border: '1px solid #2a3142',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = '#00d4ff';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 212, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#2a3142';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
              <h2 style={{ 
                margin: '0 0 8px 0',
                fontSize: '20px',
                color: '#fff'
              }}>토큰 에어드롭</h2>
              <p style={{ 
                color: '#888', 
                margin: 0,
                fontSize: '13px'
              }}>1000 토큰을 받으세요</p>
            </div>
          </Link>

          {/* Mint NFT Card */}
          <Link href="/mint" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#1a1f2e',
              padding: '32px 24px',
              borderRadius: '12px',
              border: '1px solid #2a3142',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = '#00d4ff';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 212, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#2a3142';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
              <h2 style={{ 
                margin: '0 0 8px 0',
                fontSize: '20px',
                color: '#fff'
              }}>NFT 생성</h2>
              <p style={{ 
                color: '#888', 
                margin: 0,
                fontSize: '13px'
              }}>새로운 NFT를 발행하세요</p>
            </div>
          </Link>

          {/* Marketplace Card */}
          <Link href="/marketplace" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#1a1f2e',
              padding: '32px 24px',
              borderRadius: '12px',
              border: '1px solid #2a3142',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = '#00d4ff';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 212, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#2a3142';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <h2 style={{ 
                margin: '0 0 8px 0',
                fontSize: '20px',
                color: '#fff'
              }}>마켓플레이스</h2>
              <p style={{ 
                color: '#888', 
                margin: 0,
                fontSize: '13px'
              }}>NFT를 거래하세요</p>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div style={{
          backgroundColor: '#1a1f2e',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid #2a3142',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.1)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            color: '#fff'
          }}>
            ℹ️ 사용 방법
          </h2>
          <ol style={{ 
            lineHeight: '1.8',
            color: '#aaa',
            fontSize: '14px',
            margin: 0,
            paddingLeft: '20px'
          }}>
            <li style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#fff' }}>지갑 연결:</strong> 우측 상단의 지갑 연결 버튼으로 MetaMask를 연결합니다
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#fff' }}>토큰 받기:</strong> 토큰 에어드롭 페이지에서 신청하면 1000 토큰을 받습니다
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#fff' }}>NFT 생성:</strong> NFT 생성 페이지에서 새로운 NFT를 발행할 수 있습니다
            </li>
            <li>
              <strong style={{ color: '#fff' }}>NFT 거래:</strong> 마켓플레이스에서 NFT를 구매/판매합니다 (토큰 사용)
            </li>
          </ol>
        </div>

        {/* Features Grid */}
        <div style={{
          marginTop: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: 'rgba(0, 212, 255, 0.05)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #2a3142',
            fontSize: '13px'
          }}>
            <div style={{ color: '#00d4ff', fontWeight: '600', marginBottom: '4px' }}>✨ 모던 디자인</div>
            <div style={{ color: '#888' }}>깔끔한 다크 테마로 편한 거래 경험</div>
          </div>
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #2a3142',
            fontSize: '13px'
          }}>
            <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '4px' }}>🔒 안전한 거래</div>
            <div style={{ color: '#888' }}>스마트 컨트랙트 기반의 안전한 NFT 거래</div>
          </div>
          <div style={{
            backgroundColor: 'rgba(249, 115, 22, 0.05)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #2a3142',
            fontSize: '13px'
          }}>
            <div style={{ color: '#f97316', fontWeight: '600', marginBottom: '4px' }}>🚀 빠른 거래</div>
            <div style={{ color: '#888' }}>블록체인 위의 즉각적인 NFT 거래</div>
          </div>
        </div>
      </main>
    </div>
  );
}
