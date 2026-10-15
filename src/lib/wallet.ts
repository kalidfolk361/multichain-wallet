import { ethers } from 'ethers';
import { NETWORKS, type NetworkConfig, isEvmNetwork } from './networks';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

export interface WalletBalance {
  nativeBalance: string;
  nativeSymbol: string;
  usdtBalance: string;
  usdtSymbol: string;
}

export interface SendResult {
  txHash: string;
  amount: string;
  tokenSymbol: string;
  tokenType: 'native' | 'token';
}

function getProvider(networkKey: string): ethers.JsonRpcProvider {
  const network = NETWORKS[networkKey];
  if (!network) throw new Error(`Unsupported network: ${networkKey}`);
  if (!network.isEvm) throw new Error('This network is not EVM-compatible and cannot be accessed via ethers.js');
  return new ethers.JsonRpcProvider(network.rpcUrl);
}

export async function getNativeBalance(networkKey: string, address: string): Promise<string> {
  if (!isEvmNetwork(networkKey)) return '0';
  const provider = getProvider(networkKey);
  const balance = await provider.getBalance(address);
  return ethers.formatUnits(balance, 18);
}

export async function getUsdtBalance(networkKey: string, address: string): Promise<string> {
  const network = NETWORKS[networkKey];
  if (!network) throw new Error(`Unsupported network: ${networkKey}`);
  if (!network.isEvm) return '0';
  const provider = getProvider(networkKey);
  const contract = new ethers.Contract(network.usdtContractAddress, ERC20_ABI, provider);
  const balance = await contract.balanceOf(address);
  return ethers.formatUnits(balance, network.usdtDecimals);
}

export async function getWalletBalances(networkKey: string, address: string): Promise<WalletBalance> {
  const network = NETWORKS[networkKey];
  if (!network) throw new Error(`Unsupported network: ${networkKey}`);
  const [nativeBal, usdtBal] = await Promise.all([
    getNativeBalance(networkKey, address),
    getUsdtBalance(networkKey, address),
  ]);
  return {
    nativeBalance: nativeBal,
    nativeSymbol: network.currencySymbol,
    usdtBalance: usdtBal,
    usdtSymbol: 'USDT',
  };
}

export async function sendNativeToken(
  networkKey: string,
  privateKey: string,
  toAddress: string,
  amount: string
): Promise<SendResult> {
  const network = NETWORKS[networkKey];
  if (!network) throw new Error(`Unsupported network: ${networkKey}`);
  const provider = getProvider(networkKey);
  const wallet = new ethers.Wallet(privateKey, provider);
  const value = ethers.parseUnits(amount, 18);
  const tx = await wallet.sendTransaction({
    to: toAddress,
    value,
  });
  return {
    txHash: tx.hash,
    amount,
    tokenSymbol: network.currencySymbol,
    tokenType: 'native',
  };
}

export async function sendUsdt(
  networkKey: string,
  privateKey: string,
  toAddress: string,
  amount: string
): Promise<SendResult> {
  const network = NETWORKS[networkKey];
  if (!network) throw new Error(`Unsupported network: ${networkKey}`);
  const provider = getProvider(networkKey);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(network.usdtContractAddress, ERC20_ABI, wallet);
  const value = ethers.parseUnits(amount, network.usdtDecimals);
  const tx = await contract.transfer(toAddress, value);
  return {
    txHash: tx.hash,
    amount,
    tokenSymbol: 'USDT',
    tokenType: 'token',
  };
}

export async function sendToken(
  networkKey: string,
  privateKey: string,
  toAddress: string,
  amount: string,
  tokenType: 'native' | 'token'
): Promise<SendResult> {
  if (tokenType === 'native') {
    return sendNativeToken(networkKey, privateKey, toAddress, amount);
  }
  return sendUsdt(networkKey, privateKey, toAddress, amount);
}

export async function waitForTransaction(networkKey: string, txHash: string): Promise<boolean> {
  const provider = getProvider(networkKey);
  const receipt = await provider.waitForTransaction(txHash, 2, 60000);
  return receipt?.status === 1;
}

export function validateAddress(address: string, networkKey?: string): boolean {
  if (networkKey && !isEvmNetwork(networkKey)) {
    return address.length >= 30 && address.startsWith('T');
  }
  return ethers.isAddress(address);
}

export function createNewWallet(networkKey?: string): { address: string; privateKey: string; mnemonic: string } {
  if (networkKey && !isEvmNetwork(networkKey)) {
    throw new Error('Non-EVM wallet creation is not yet supported for this network');
  }
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase ?? '',
  };
}

export function importWalletFromPrivateKey(privateKey: string, networkKey?: string): { address: string; privateKey: string } {
  if (networkKey && !isEvmNetwork(networkKey)) {
    throw new Error('Non-EVM wallet import is not yet supported for this network');
  }
  const wallet = new ethers.Wallet(privateKey);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

export function importWalletFromMnemonic(mnemonic: string, networkKey?: string): { address: string; privateKey: string } {
  if (networkKey && !isEvmNetwork(networkKey)) {
    throw new Error('Non-EVM wallet import is not yet supported for this network');
  }
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

export { NETWORKS, type NetworkConfig, isEvmNetwork };
