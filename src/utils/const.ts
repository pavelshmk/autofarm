import { DOWNLOADED_ICONS } from './token-icons'
import _ from 'lodash'
import avaxPools from '../utils/pools/avax.json'
import bscPools from '../utils/pools/bsc.json'
import ethPools from '../utils/pools/eth.json'
import fantomPools from '../utils/pools/fantom.json'
import hecoPools from '../utils/pools/heco.json'
import polygonPools from '../utils/pools/polygon.json'

const poolsByNetwork = {
    avax: avaxPools,
    bsc: bscPools,
    eth: ethPools,
    fantom: fantomPools,
    heco: hecoPools,
    polygon: polygonPools,
}

const poolTargetLabels = {
    alchemix: 'Alchemix',
    autofarm: 'Autofarm',
    convexmain: 'Convex Main',
    convexsingle: 'Convex Single',
    dodo: 'DODO',
    hyperjump: 'Hyperjump',
    mdx: 'MDX',
    quickswap: 'QuickSwap',
    pangolin: 'Pangolin',
    polysushiswap: 'SushiSwap',
    spiritswap: 'SpiritSwap',
    spookyswap: 'SpookySwap',
    sushiswap: 'SushiSwap',
    sushiswapV2: 'SushiSwap V2',
    vesper: 'Vesper',
}

function getNetworkProtocolsSpec(network) {
    const targets: string[] = _.uniq(poolsByNetwork[network].map((p) => p.target))
    targets.sort()
    return _.fromPairs(targets.map((target) => [target, poolTargetLabels[target] || target]))
}

export const INFURA_ID = 'b266401a3b4242aebe375aa154e80e9d'
export const MAX_UINT256 = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'

export const ICONS = {
    ...DOWNLOADED_ICONS,
    missing: require('../images/crypto_empty.svg'),
    missing_d: require('../images/crypto_missing_d.svg'),
    missing_l: require('../images/crypto_missing_l.svg'),
}

export const NETWORKS = {
    avax: {
        master: '0xf87433688C56f06Cd8DAf045ee7e787d8D5680fB',
        pools: avaxPools,
        api: 'https://toolto.farm/api/avax/data',
        protocols: getNetworkProtocolsSpec('avax'),
        chainParameters: {
            chainId: '0xa86a',
            chainName: 'Avalanche',
            nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
            },
            rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
            blockExplorerUrls: ['https://cchain.explorer.avax.network'],
        },
        explorerTpl: 'https://cchain.explorer.avax.network/address/ADDRESS',
        tokenList: 'https://raw.githubusercontent.com/complusnetwork/default-token-list/master/default-tokenlist-ava.json',
    },
    bsc: {
        master: '0xf87433688C56f06Cd8DAf045ee7e787d8D5680fB',
        pools: bscPools,
        api: 'https://toolto.farm/api/bsc/data',
        protocols: getNetworkProtocolsSpec('bsc'),
        chainParameters: {
            chainId: '0x38',
            chainName: 'BSC',
            nativeCurrency: {
                name: 'Binance Coin',
                symbol: 'BNB',
                decimals: 18,
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/'],
        },
        explorerTpl: 'https://bscscan.com/address/ADDRESS',
        tokenList: 'https://gateway.pinata.cloud/ipfs/QmdKy1K5TMzSHncLzUXUJdvKi1tHRmJocDRfmCXxW5mshS',
    },
    eth: {
        master: '0xf87433688C56f06Cd8DAf045ee7e787d8D5680fB',
        pools: ethPools,
        api: 'https://toolto.farm/api/eth/data',
        protocols: getNetworkProtocolsSpec('eth'),
        chainParameters: {
            chainId: '0x1',
            chainName: 'BSC',
            nativeCurrency: {
                name: 'Binance Coin',
                symbol: 'BNB',
                decimals: 18,
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/'],
        },
        explorerTpl: 'https://etherscan.com/address/ADDRESS',
        tokenList: 'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
    },
    fantom: {
        master: '0xf87433688C56f06Cd8DAf045ee7e787d8D5680fB',
        pools: fantomPools,
        api: 'https://toolto.farm/api/fantom/data',
        protocols: getNetworkProtocolsSpec('fantom'),
        chainParameters: {
            chainId: '0xfa',
            chainName: 'Fantom Opera',
            nativeCurrency: {
                name: 'FTM',
                symbol: 'FTM',
                decimals: 18,
            },
            rpcUrls: ['https://rpcapi.fantom.network'],
            blockExplorerUrls: ['https://ftmscan.com'],
        },
        explorerTpl: 'https://ftmscan.com/address/ADDRESS',
        tokenList: 'https://raw.githubusercontent.com/Crocoswap/tokenlists/main/fantomfinance.tokenlist.json',
    },
    heco: {
        master: '0xf87433688C56f06Cd8DAf045ee7e787d8D5680fB',
        pools: hecoPools,
        api: 'https://toolto.farm/api/heco/data',
        protocols: getNetworkProtocolsSpec('heco'),
        chainParameters: {
            chainId: '0x80',
            chainName: 'HECO',
            nativeCurrency: {
                name: 'HT',
                symbol: 'HT',
                decimals: 18,
            },
            rpcUrls: ['https://http-mainnet-node.huobichain.com'],
            blockExplorerUrls: ['https://hecoinfo.com/'],
        },
        explorerTpl: 'https://hecoinfo.com/address/ADDRESS',
        tokenList: 'https://raw.githubusercontent.com/complusnetwork/default-token-list/master/default-tokenlist-heco.json',
    },
    polygon: {
        master: '0xf87433688C56f06Cd8DAf045ee7e787d8D5680fB',
        pools: polygonPools,
        api: 'https://toolto.farm/api/polygon/data',
        protocols: getNetworkProtocolsSpec('polygon'),
        chainParameters: {
            chainId: '0x89',
            chainName: 'Polygon',
            nativeCurrency: {
                name: 'MATIC Token',
                symbol: 'MATIC',
                decimals: 18,
            },
            rpcUrls: ['https://rpc-mainnet.maticvigil.com'],
            blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com'],
        },
        explorerTpl: 'https://explorer-mainnet.maticvigil.com/address/ADDRESS',
        tokenList: 'https://raw.githubusercontent.com/complusnetwork/default-token-list/master/default-tokenlist-matic.json',
    },
}
