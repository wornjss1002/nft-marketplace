import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum: any;
  }
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask이 설치되어 있지 않습니다");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } catch (error) {
    throw new Error("지갑 연결에 실패했습니다");
  }
}

export async function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask이 설치되어 있지 않습니다");
  }
  return new BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return await provider.getSigner();
}

export async function getCurrentAccount() {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch {
    return null;
  }
}

export async function getBalance(address: string) {
  const provider = await getProvider();
  return await provider.getBalance(address);
}
