export interface NetworkConfig {
  key: string;
  name: string;
  shortName: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  currencySymbol: string;
  currencyName: string;
  usdtContractAddress: string;
  usdtDecimals: number;
  logoColor: string;
  logoGradient: string;
  isTestnet?: boolean;
  isEvm: boolean;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    key: 'ethereum',
    name: 'Ethereum',
    shortName: 'ETH',
    chainId: 1,
    rpcUrl: 'https://ethereum.drpc.org',
    explorerUrl: 'https://etherscan.io',
    currencySymbol: 'ETH',
    currencyName: 'Ether',
    usdtContractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    usdtDecimals: 6,
    logoColor: '#627EEA',
    logoGradient: 'from-[#627EEA] to-[#8A9BFF]',
    isEvm: true,
  },
  bsc: {
    key: 'bsc',
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    chainId: 56,
    rpcUrl: 'https://bsc.drpc.org',
    explorerUrl: 'https://bscscan.com',
    currencySymbol: 'BNB',
    currencyName: 'BNB',
    usdtContractAddress: '0x55d398326f99059fF775485246999027B3197955',
    usdtDecimals: 18,
    logoColor: '#F0B90B',
    logoGradient: 'from-[#F0B90B] to-[#FFD700]',
    isEvm: true,
  },
  polygon: {
    key: 'polygon',
    name: 'Polygon',
    shortName: 'POL',
    chainId: 137,
    rpcUrl: 'https://polygon.drpc.org',
    explorerUrl: 'https://polygonscan.com',
    currencySymbol: 'POL',
    currencyName: 'POL',
    usdtContractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B8e2E5',
    usdtDecimals: 6,
    logoColor: '#8247E5',
    logoGradient: 'from-[#8247E5] to-[#A66BFF]',
    isEvm: true,
  },
  arbitrum: {
    key: 'arbitrum',
    name: 'Arbitrum One',
    shortName: 'ARB',
    chainId: 42161,
    rpcUrl: 'https://arbitrum.drpc.org',
    explorerUrl: 'https://arbiscan.io',
    currencySymbol: 'ETH',
    currencyName: 'Ether',
    usdtContractAddress: '0xFd086bC7CD5C481DCC9C85bE42c295c6FdE4180e',
    usdtDecimals: 6,
    logoColor: '#28A0F0',
    logoGradient: 'from-[#28A0F0] to-[#5BC0FF]',
    isEvm: true,
  },
  optimism: {
    key: 'optimism',
    name: 'Optimism',
    shortName: 'OP',
    chainId: 10,
    rpcUrl: 'https://optimism.drpc.org',
    explorerUrl: 'https://optimistic.etherscan.io',
    currencySymbol: 'ETH',
    currencyName: 'Ether',
    usdtContractAddress: '0x94b008aA00579c1307B0EF2c499aD688FE9042E1',
    usdtDecimals: 6,
    logoColor: '#FF0420',
    logoGradient: 'from-[#FF0420] to-[#FF6B6B]',
    isEvm: true,
  },
  avalanche: {
    key: 'avalanche',
    name: 'Avalanche C-Chain',
    shortName: 'AVAX',
    chainId: 43114,
    rpcUrl: 'https://avalanche.drpc.org',
    explorerUrl: 'https://snowtrace.io',
    currencySymbol: 'AVAX',
    currencyName: 'AVAX',
    usdtContractAddress: '0x9702230A8Ea53601f5cD2dc00fDBc277b3Ddef47',
    usdtDecimals: 6,
    logoColor: '#E84142',
    logoGradient: 'from-[#E84142] to-[#FF6B6B]',
    isEvm: true,
  },
  base: {
    key: 'base',
    name: 'Base',
    shortName: 'BASE',
    chainId: 8453,
    rpcUrl: 'https://base.drpc.org',
    explorerUrl: 'https://basescan.org',
    currencySymbol: 'ETH',
    currencyName: 'Ether',
    usdtContractAddress: '0x50cEdD5d75dee76C15E26b5ACcAB38E11D9c4eF4',
    usdtDecimals: 6,
    logoColor: '#0052FF',
    logoGradient: 'from-[#0052FF] to-[#3B82F6]',
    isEvm: true,
  },
  tron: {
    key: 'tron',
    name: 'Tron',
    shortName: 'TRX',
    chainId: 728126421,
    rpcUrl: 'https://tron.drpc.org',
    explorerUrl: 'https://tronscan.org',
    currencySymbol: 'TRX',
    currencyName: 'TRON',
    usdtContractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    usdtDecimals: 6,
    logoColor: '#FF060A',
    logoGradient: 'from-[#FF060A] to-[#FF4D4D]',
    isEvm: false,
  },
  fantom: {
    key: 'fantom',
    name: 'Fantom',
    shortName: 'FTM',
    chainId: 250,
    rpcUrl: 'https://fantom.drpc.org',
    explorerUrl: 'https://ftmscan.com',
    currencySymbol: 'FTM',
    currencyName: 'Fantom',
    usdtContractAddress: '0x049d68029688eAbF473097a2fC38ef616A4EeE1f',
    usdtDecimals: 6,
    logoColor: '#13B5EC',
    logoGradient: 'from-[#13B5EC] to-[#5BC0FF]',
    isEvm: true,
  },
  cronos: {
    key: 'cronos',
    name: 'Cronos',
    shortName: 'CRO',
    chainId: 25,
    rpcUrl: 'https://cronos.drpc.org',
    explorerUrl: 'https://cronoscan.com',
    currencySymbol: 'CRO',
    currencyName: 'Cronos',
    usdtContractAddress: '0x66e428c32941c844eeD69c0148c0b799e65b6c27',
    usdtDecimals: 6,
    logoColor: '#002D74',
    logoGradient: 'from-[#002D74] to-[#0A5BC4]',
    isEvm: true,
  },
  mantle: {
    key: 'mantle',
    name: 'Mantle',
    shortName: 'MNT',
    chainId: 5000,
    rpcUrl: 'https://mantle.drpc.org',
    explorerUrl: 'https://mantlescan.org',
    currencySymbol: 'MNT',
    currencyName: 'Mantle',
    usdtContractAddress: '0xcE9d37849739262019f3d3e6990992f565913384',
    usdtDecimals: 6,
    logoColor: '#46E5B3',
    logoGradient: 'from-[#46E5B3] to-[#7FFFD4]',
    isEvm: true,
  },
  blast: {
    key: 'blast',
    name: 'Blast',
    shortName: 'BLAST',
    chainId: 81457,
    rpcUrl: 'https://blast.drpc.org',
    explorerUrl: 'https://blastscan.io',
    currencySymbol: 'ETH',
    currencyName: 'Ether',
    usdtContractAddress: '0x298Bb1976C6CA7E1a0A7Ce17639c85E01a72C451',
    usdtDecimals: 6,
    logoColor: '#FFCC00',
    logoGradient: 'from-[#FFCC00] to-[#FFE44D]',
    isEvm: true,
  },
  linea: {
    key: 'linea',
    name: 'Linea',
    shortName: 'LNA',
    chainId: 59144,
    rpcUrl: 'https://linea.drpc.org',
    explorerUrl: 'https://lineascan.build',
    currencySymbol: 'ETH',
    currencyName: 'Ether',
    usdtContractAddress: '0x1cC96B0Ad793c29B3833a80d529eD10b23B4f696',
    usdtDecimals: 6,
    logoColor: '#121212',
    logoGradient: 'from-[#2D2D2D] to-[#5A5A5A]',
    isEvm: true,
  },
  scroll: {
    key: 'scroll',
    name: 'Scroll',
    shortName: 'SCR',
    chainId: 534352,
    rpcUrl: 'https://scroll.drpc.org',
    explorerUrl: 'https://scrollscan.com',
    currencySymbol: 'ETH',
    currencyName: 'Ether',
    usdtContractAddress: '0x7c5c28Feb7aDD42f77B1d9107c9e01a560B2c00D',
    usdtDecimals: 6,
    logoColor: '#FFFEFD',
    logoGradient: 'from-[#E8E8E8] to-[#FFFFFF]',
    isEvm: true,
  },
  zksync: {
    key: 'zksync',
    name: 'zkSync',
    shortName: 'ZK',
    chainId: 324,
    rpcUrl: 'https://zksync.drpc.org',
    explorerUrl: 'https://explorer.zksync.io',
    currencySymbol: 'ETH',
    currencyName: 'Ether',
    usdtContractAddress: '0x4933a1da8015d2ce3e832970a74e57c660a9d0d2',
    usdtDecimals: 6,
    logoColor: '#186DDF',
    logoGradient: 'from-[#186DDF] to-[#4A9BFF]',
    isEvm: true,
  },
  manta: {
    key: 'manta',
    name: 'Manta Pacific',
    shortName: 'MNTA',
    chainId: 169,
    rpcUrl: 'https://manta-pacific.drpc.org',
    explorerUrl: 'https://pacific-explorer.manta.network',
    currencySymbol: 'ETH',
    currencyName: 'Ether',
    usdtContractAddress: '0x5c1d29a72E15c10B6f8fBca3c5e24D3fb03F7C67',
    usdtDecimals: 6,
    logoColor: '#19E6A4',
    logoGradient: 'from-[#19E6A4] to-[#5CFFD4]',
    isEvm: true,
  },
  opbnb: {
    key: 'opbnb',
    name: 'opBNB',
    shortName: 'opBNB',
    chainId: 204,
    rpcUrl: 'https://opbnb.drpc.org',
    explorerUrl: 'https://opbnbscan.com',
    currencySymbol: 'BNB',
    currencyName: 'BNB',
    usdtContractAddress: '0x6eA1a667566925A2c72D6d12F2d6733Df96e3d83',
    usdtDecimals: 18,
    logoColor: '#F0B90B',
    logoGradient: 'from-[#F0B90B] to-[#FFD700]',
    isEvm: true,
  },
  metis: {
    key: 'metis',
    name: 'Metis',
    shortName: 'METIS',
    chainId: 1088,
    rpcUrl: 'https://metis.drpc.org',
    explorerUrl: 'https://andromeda-explorer.metis.io',
    currencySymbol: 'METIS',
    currencyName: 'Metis',
    usdtContractAddress: '0x9B4CA393DfB8d3E06Bb07c89B057A2392D393E5A',
    usdtDecimals: 6,
    logoColor: '#00D4FF',
    logoGradient: 'from-[#00D4FF] to-[#5BE5FF]',
    isEvm: true,
  },
};

export const NETWORK_LIST = Object.values(NETWORKS);

export const EVM_NETWORKS = NETWORK_LIST.filter((n) => n.isEvm);
export const NON_EVM_NETWORKS = NETWORK_LIST.filter((n) => !n.isEvm);

export function isEvmNetwork(key: string): boolean {
  const n = NETWORKS[key];
  return n ? n.isEvm : true;
}

export function getNetwork(key: string): NetworkConfig | undefined {
  return NETWORKS[key];
}

export function getExplorerTxUrl(networkKey: string, txHash: string): string {
  const network = NETWORKS[networkKey];
  if (!network) return '#';
  return `${network.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(networkKey: string, address: string): string {
  const network = NETWORKS[networkKey];
  if (!network) return '#';
  return `${network.explorerUrl}/address/${address}`;
}
