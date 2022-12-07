import { injectable } from "inversify";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from 'web3modal';
import { action, makeObservable, observable, runInAction } from "mobx";
import * as Ethers from 'ethers';
import { RootStore } from "./RootStore";
import defer from "defer-promise";
import { Modals } from "./ModalStore";
import { APIResponse, JsonPool, UserInfoEntry } from "../utils/types";
import ERC20_ABI from "../utils/contracts/erc20.abi.json";
import MASTER_ABI from "../utils/contracts/master.abi.json";
import VAMPIRE_ADAPTER_ABI from "../utils/contracts/vampireAdapter.abi.json";
import BN from "bignumber.js";
import { ContractContext as ERC20ContractContext } from "../utils/contracts/erc20";
import { ContractContext as MasterContractContext } from "../utils/contracts/master";
import { ContractContext as VampireAdapterContractContext } from "../utils/contracts/vampireAdapter";
import { INFURA_ID, NETWORKS } from "../utils/const";
import { WalletLink } from "walletlink";
import axios from "axios";
import { deserialize } from "typescript-json-serializer";
import store from "store";
import { MIGRATE_ABIS } from "../utils/pools/adapterAbis";
import { toBNJS } from "../utils/utilities";

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider, // required
        infuraId: INFURA_ID,
        options: {
            rpc: {
                56: 'https://dataseed4.binance.org/',
                97: 'https://data-seed-prebsc-1-s3.binance.org:8545/',
            }
        }
    },
    'custom-walletlink': {
        display: {
            logo: '',
            name: 'WalletLink',
            description: '',
        },
        package: WalletConnectProvider,
        connector: async (arg1, arg2) => {
            const walletLink = new WalletLink({
                appName: 'Razer',
                darkMode: true,
            });
            const provider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);
            await provider.enable();
            return provider;
        }
    }
    /*'custom-binancewallet': {
        display: {
            logo: '',
            name: 'BinanceWallet',
            description: '',
        },
        package: WalletConnectProvider,
        connector: async (arg1, arg2) => {
            console.log('connector called')
            let provider = null;
            if (typeof (window as any).BinanceChain !== 'undefined') {
                provider = (window as any).BinanceChain;
                try {
                    await provider.request({ method: 'eth_requestAccounts' })
                } catch (error) {
                    throw new Error("User Rejected");
                }
            } else {
                throw new Error("No BinanceChain Provider found");
            }
            return provider;
        }
    }*/
}

export const NETWORKS_INFO = {
    eth: { chainId: 1, name: 'Ethereum Mainnet' },
    bsc: { chainId: 56, name: 'Binance Smart Chain' },
    polygon: { chainId: 137, name: 'Polygon Mainnet' },
    heco: { chainId: 128, name: 'HECO' },
    avax: { chainId: 43114, name: 'Avalanche' },
    fantom: { chainId: 250, name: 'Fantom Opera' },
}

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
})

if (window.ethereum)
    window.ethereum.autoRefreshOnNetworkChange = false;

@injectable()
export class WalletStore {
    private rawProvider: any ;
    public provider: Ethers.providers.Web3Provider;
    private apiInterval;
    private apiAddress;

    @observable connected: boolean = false;
    @observable correctNetwork: boolean = false;
    @observable account?: string;
    @observable ethBalance?: BN;
    @observable chainId?: number;
    public connectDefer: DeferPromise.Deferred<string>;
    @observable api?: APIResponse;
    @observable network: 'bsc' | 'eth' | 'polygon' | 'heco' | 'avax' | 'fantom' = 'eth';
    @observable slippage: string = '3';
    @observable userInfo: { [pid: number]: UserInfoEntry } = {};
    @observable refreshNotifier?: number;

    public constructor(protected rootStore: RootStore) {
        makeObservable(this);
        this.network = store.get('network') || 'eth';
        this.apiInterval = setInterval(() => this.loadAPI(this.apiAddress), 10000);
    }

    loadAPI = async (address: string) => {
        this.apiAddress = address;
        const api = await axios.get(address);
        runInAction(() => this.api = deserialize(api.data, APIResponse));
    }

    @action resetWallet = () => {
        web3Modal.clearCachedProvider();
        localStorage.clear();
        this.connected = false;
    }

    tryReconnect = async () => {
        if (this.connected)
            return;

        try {
            this.rawProvider = await web3Modal.connectTo(web3Modal.cachedProvider);
            this.provider = new Ethers.providers.Web3Provider(this.rawProvider);
        } catch (e) {
            console.log(e);
            return;
        }
        if (!await this.initProvider(web3Modal.cachedProvider))
            return;
    }

    @action async connect() {
        if (this.connected)
            return true;

        this.connectDefer = defer();
        this.rootStore.modalStore.showModal(Modals.Connect);
        let id;

        try {
            id = await this.connectDefer.promise;
            this.rootStore.modalStore.hideModals();
            this.rawProvider = await web3Modal.connectTo(id);
            this.provider = new Ethers.providers.Web3Provider(this.rawProvider);
        } catch (e) {
            console.log(e);
            return false;
        }
        if (!await this.initProvider(id))
            return false;
        this.rootStore.modalStore.hideModals();
        return true;
    }

    @action async initProvider(id: string) {
        let chainId = (await this.ethers().getNetwork()).chainId;
        if (this.network !== 'eth' && chainId !== NETWORKS_INFO[this.network].chainId) {
            try {
                await this.provider.send('wallet_addEthereumChain', [NETWORKS[this.network].chainParameters]);
                this.rawProvider = await web3Modal.connectTo(id);
                this.provider = new Ethers.providers.Web3Provider(this.rawProvider);
                chainId = (await this.ethers().getNetwork()).chainId;
            } catch (e) {
                console.log(e);
            }
        }

        this.rawProvider.on?.('accountsChanged', () => this.resetWallet());
        this.rawProvider.on?.('chainChanged', async (arg) => {
            if (arg === NETWORKS[this.network].chainParameters.chainId) {
                runInAction(() => this.correctNetwork = true);
                this.rawProvider = await web3Modal.connectTo(id);
                this.provider = new Ethers.providers.Web3Provider(this.rawProvider);
                await this.initProvider(id);
            } else {
                runInAction(() => this.correctNetwork = false);
            }
        });

        const account = (await this.ethers().listAccounts())[0];
        runInAction(() => { this.chainId = chainId; this.account = account; this.connected = true });

        runInAction(() => this.correctNetwork = chainId === NETWORKS_INFO[this.network].chainId);
        if (chainId !== NETWORKS_INFO[this.network].chainId) {
            this.provider = this.rawProvider = undefined;
            return false;
        }

        await this.updateUserInfo();

        return true;
    }

    ethers = (): Ethers.providers.Web3Provider | Ethers.providers.InfuraProvider => {
        return this.provider;
    }

    get signerOrProvider() {
        return this.connected ? this.ethers().getSigner() : this.ethers();
    }

    erc20Contract(address: string): ERC20ContractContext {
        return new Ethers.Contract(address, ERC20_ABI, this.connected && this.signerOrProvider || undefined) as unknown as ERC20ContractContext;
    }

    vampireAdapterContract(address: string): VampireAdapterContractContext {
        return new Ethers.Contract(address, VAMPIRE_ADAPTER_ABI, this.connected && this.signerOrProvider || undefined) as unknown as VampireAdapterContractContext;
    }

    masterContract(address?: string): MasterContractContext {
        return new Ethers.Contract(address || NETWORKS[this.network].master, MASTER_ABI, this.connected && this.signerOrProvider || undefined) as unknown as MasterContractContext;
    }

    getMigrateContract(pool: JsonPool) {
        if (!pool.migrate)
            return null;
        return new Ethers.Contract(pool.migrate.address, MIGRATE_ABIS[pool.migrate.abi], this.signerOrProvider);
    }

    switchNetwork = async (network: 'eth' | 'bsc' | 'polygon' | 'heco' | 'avax' | 'fantom') => {
        store.set('network', network);

        runInAction(() => { this.network = network; this.correctNetwork = false; this.userInfo = {} });
        const connected = this.connected;

        if (connected) {
            try {
                const resp = await this.provider.send('wallet_switchEthereumChain', [{ chainId: NETWORKS[this.network].chainParameters.chainId }]);
                console.log(resp);
                this.provider = new Ethers.providers.Web3Provider(this.rawProvider);
            } catch (e) {
                try {
                    await this.provider.send('wallet_addEthereumChain', [NETWORKS[this.network].chainParameters]);
                    this.provider = new Ethers.providers.Web3Provider(this.rawProvider);
                } catch (e) {}
            }

            const chainId = (await this.ethers().getNetwork()).chainId;
            runInAction(() => this.correctNetwork = NETWORKS_INFO[network].chainId === chainId);

            await this.updateUserInfo();
        }
    }

    updateUserInfo = async () => {
        try {
            const userInfoData = await axios.get(`https://toolto.farm/api/user-info/${this.network}/${this.account}`);
            const userInfo = {};
            userInfoData.data.userInfo.forEach(e => {
                e = deserialize(e, UserInfoEntry);
                userInfo[e.pid] = e;
            });
            runInAction(() => this.userInfo = userInfo);
        } catch (e) {
            console.error('unable to load user info')
        }
    }

    @action updateSlippage = (val: string) => {
        this.slippage = val;
    }

    @action requestRefresh = () => {
        this.refreshNotifier = Math.random();
    }

    private _sendTransaction = async (contract: any, name: string, args: any[], gasLimitMultiplier: string = '1.1') => {
        const estimate = toBNJS(await contract.estimateGas[name](...args));
        const tx = await contract[name](
            ...args,
            {
                gasLimit: estimate.times(gasLimitMultiplier).integerValue().toString(),
            }
        );
        await tx.wait()
    }

    sendTransaction = async (contract: any, name: string, ...args: any[]) => {
        await this._sendTransaction(contract, name, args);
    }

    sendTransactionUnstake = async (contract: any, name: string, ...args: any[]) => {
        await this._sendTransaction(contract, name, args, '1.15');
    }
}
