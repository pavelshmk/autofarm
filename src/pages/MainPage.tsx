import React from 'react'
import { Trans, withTranslation, WithTranslation } from 'react-i18next'
import _ from 'lodash'
import classNames from 'classnames'
import ClickAwayListener from 'react-click-away-listener'
import { JsonPool, OtherTableRow, Pool, TableRow } from '../utils/types'
import { observer } from 'mobx-react'
import { resolve } from 'inversify-react'
import { ModalStore, UIStore, WalletStore } from '../stores'
import { NETWORKS } from '../utils/const'
import TokenSearch from '../components/main/TokenSearch'
import { toBNJS } from '../utils/utilities'
import { reaction } from 'mobx'
import { Header } from '../components/Header'
import Loader from '../components/Loader'
import OtherTableItem from '../components/main/OtherTableItem'
import TableItem from '../components/main/TableItem'
import { ScrollLock } from "../components/ScrollLock";
import ScrollUp from "../components/ScrollUp";

interface IMainPageProps extends WithTranslation {
}

interface IMainPageState {
    networksOpen: boolean
    infoToken?: TableRow
    fullTable: TableRow[]
    otherPools: OtherTableRow[]
    otherLoading: boolean
    netEnter?: string,
    protocolFilter?: string
    tokenFilter?: string
    stakedOnlyFilter: boolean
    dropdownNetworks: boolean
    changeNetworkOpen: boolean
    listsOpen: boolean
    orderOpen: boolean
    orderField: 'lpStaked' | 'lpEarned' | 'tvlValue' | 'victimTvlValue' | 'apyValue';
}

export const networks = [
    {
        label: 'Ethereum',
        id: 'eth',
        activeIcon: require('../images/ETH_neon.svg'),
        inactiveIcon: require('../images/ETH.svg')
    },
    {
        label: 'BSC',
        id: 'bsc',
        activeIcon: require('../images/BSC_neon.svg'),
        inactiveIcon: require('../images/BSC.svg')
    },
    {
        label: 'Polygon',
        id: 'polygon',
        activeIcon: require('../images/POLYGON_neon.svg'),
        inactiveIcon: require('../images/POLYGON.svg')
    },
    {
        label: 'HECO',
        id: 'heco',
        activeIcon: require('../images/HECO_neon.svg'),
        inactiveIcon: require('../images/HECO.svg')
    },
    {
        label: 'AVAX',
        id: 'avax',
        activeIcon: require('../images/AVAX_active.svg'),
        inactiveIcon: require('../images/AVAX.svg')
    },
    {
        label: 'Fantom',
        id: 'fantom',
        activeIcon: require('../images/PHANTOM_active.svg'),
        inactiveIcon: require('../images/PHANTOM.svg')
    },
]

@observer
class MainPageComponent extends React.Component<IMainPageProps, IMainPageState> {
    @resolve(WalletStore)
    protected declare readonly walletStore: WalletStore
    @resolve(ModalStore)
    protected declare readonly modalStore: ModalStore
    @resolve(UIStore)
    declare protected readonly UIStore: UIStore;

    state: IMainPageState = {
        networksOpen: false,
        fullTable: [],
        otherPools: [],
        otherLoading: false,
        netEnter: '',
        stakedOnlyFilter: false,
        orderField: 'victimTvlValue',
        orderOpen: false,
        listsOpen: false,
        changeNetworkOpen: false,
        dropdownNetworks: false
    }

    componentDidMount() {
        reaction(
            () => this.walletStore.network,
            () => {
                this.setState({ otherPools: [] })
                this.buildFullTable();
                this.updatePersonalData();
            },
        )
        reaction(
            () => this.walletStore.correctNetwork,
            (val) => {
                if (!val) return
                this.updatePersonalData()
            },
        )

        reaction(() => this.walletStore.refreshNotifier, this.updatePersonalData);

        this.buildFullTable()
    }

    buildFullTable = async () => {
        try {
            await this.walletStore.loadAPI(NETWORKS[this.walletStore.network].api)
        } catch (e) {
            console.error(e);
        }
        const poolInfos: { [pid: number]: Pool } = {}
        this.walletStore.api?.pools.forEach((pool) => (poolInfos[pool.id] = pool))
        const fullTable: TableRow[] = [];
        ((NETWORKS[this.walletStore.network].pools as unknown) as JsonPool[]).forEach((pool) => {
            const info = poolInfos[pool.pid]
            fullTable.push({
                ...pool,
                lpStaked: undefined,
                lpEarned: undefined,
                apyValue: info?.apy + info?.lpFeesApy,
                tvlValue: info?.tvl,
                victimTvlValue: info?.victimTvl,
                info,
            })
        })
        this.setState({ fullTable });
    }

    updatePersonalData = async () => {
        console.log('upd');
        if (!this.walletStore.correctNetwork || !this.walletStore.api) {
            this.setState({ otherLoading: false })
            return
        }
        if (!this.state.otherPools.length) {
            this.setState({ otherLoading: true })
        }
        const network = this.walletStore.network
        const otherPools = []
        const promises = NETWORKS[this.walletStore.network].pools.map(
            async (jsonPool: JsonPool) => {
                if (!jsonPool.migrate)
                    return;
                for (let i = 0; i < 5; i++) {
                    try {
                        const adapter = this.walletStore.vampireAdapterContract(jsonPool.adapter)
                        const decimals = toBNJS(10).pow(await this.walletStore.erc20Contract(jsonPool.lp).decimals());
                        const amount = toBNJS(await adapter.lockedAmount(this.walletStore.account, jsonPool.victimPID)).div(decimals)
                        const pool = this.walletStore.api.pools.filter((p) => p.lpTokenAddress === jsonPool.lp)[0]
                        if (!pool)
                            return
                        const usdAmount = amount.times(pool.lpTokenPriceInUsd)
                        otherPools.push({
                            pool,
                            jsonPool,
                            amount,
                            usdAmount,
                        })
                        return;
                    } catch (e) {
                        console.error(e);
                    }
                }
            },
        )
        await Promise.all(promises)
        if (network !== this.walletStore.network)
            return
        this.setState({
            otherPools: _.sortBy(otherPools.filter(p => p.amount.gt(0)), 'pid'),
            otherLoading: false,
        })
    }

    switchNetwork = async (
        network: 'bsc' | 'eth' | 'polygon' | 'heco' | 'avax' | 'fantom',
    ) => {
        if (network === this.walletStore.network)
            return;

        this.setState({
            protocolFilter: undefined,
            otherPools: [],
            otherLoading: true,
            changeNetworkOpen: false,
        })
        await this.buildFullTable()
        await this.walletStore.switchNetwork(network)
        // location.reload();
        await this.updatePersonalData()
    }

    render() {
        const { t } = this.props
        const {
            changeNetworkOpen,
            protocolFilter,
            networksOpen,
            orderField,
            orderOpen,
            stakedOnlyFilter,
            infoToken,
            tokenFilter,
            fullTable,
            otherPools,
            otherLoading,
            dropdownNetworks,
            listsOpen
        } = this.state
        const network = this.walletStore.network

        const orderItems = {
            lpStaked: t('main::lpStaked'),
            lpEarned: t('main::lpEarned'),
            tvlValue: t('main::tvl'),
            victimTvlValue: t('main::victimTvl'),
            apyValue: t('main::apy'),
        }
        const light = {
            color: '#1C1C34',
            WebkitTextStroke:'0px',
            filter: 'drop-shadow(0 0 0px #126594)'
        }
        const ico = {

            filter: 'grayscale(0)'
        }
        const inactiveIco = {
            filter: 'grayscale(0.8)'
        }

        let filteredTable = fullTable;
        if (protocolFilter)
            filteredTable = filteredTable.filter(
                (pool) => pool.target == protocolFilter,
            )
        if (stakedOnlyFilter)
            filteredTable = filteredTable.filter((pool) => pool.lpStaked?.gt(0))
        if (tokenFilter)
            filteredTable = filteredTable.filter(
                (pool) => new RegExp(`.*${tokenFilter}.*`, 'i').test(`${pool.token1}${pool.token2 || ''}`),
            )
        filteredTable = _.sortBy(filteredTable, (pool) => pool[orderField] || 0)
        filteredTable = filteredTable.reverse();

        const activeNetwork = networks.filter(n => n.id === network)[0];

        return (
            <>
                <Header/>
                <div className="content">
                    {/*<div className="longcat">
                        <div className="longcat__head"/>
                        <div className="longcat__body"/>
                        <div className="longcat__legs"/>
                    </div>*/}
                    <div className="network">
                        {changeNetworkOpen && <div className='fade active' />}
                        <div
                            className={classNames('span-oval', { active: changeNetworkOpen, light: !this.UIStore.darkMode })}
                        >
                            {changeNetworkOpen && <ScrollLock />}
                            <span className="span-oval-title">{t('main::selectNetwork')}</span>
                            <div className="close-mob-nav">
                                <img src={require('../images/close.svg')} alt="" onClick={() => this.setState({ changeNetworkOpen: false })}/>
                            </div>
                            {networks.map(n => (
                                <a
                                    type='button'
                                    className={classNames('btn-oval', { active: network === n.id})}
                                    key={n.id}
                                    onClick={() => this.switchNetwork(n.id as any)}
                                    onMouseEnter={()=>this.setState({netEnter: n.id})}
                                    onMouseLeave={()=>this.setState({netEnter: ''})}
                                >
                                    <img src={n.activeIcon} style={this.state.netEnter === n.id?ico:inactiveIco} alt="" className="inactive"/>
                                    <img src={n.activeIcon} alt="" className='active'/>
                                    <p style={network === n.id&&!this.UIStore.darkMode?light:null} className={classNames('network-title', { active: network === n.id})}>{n.label}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="protocol">
                        <div className="div-farm">
                        {/* <div
                            className="network-mob-wrap"
                            onClick={() =>
                                this.setState({ changeNetworkOpen: !changeNetworkOpen })
                            }
                        >
                            <img src={activeNetwork.activeIcon} alt="" className="active"/>
                            <div className="network-mob-title">{activeNetwork.label}</div>
                            <div className="flex-grow"/>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.7071 3.29289C12.0771 3.66286 12.0965 4.25061 11.7655 4.6435L11.7071 4.70711L6.70711 9.70711C6.33714 10.0771 5.74939 10.0965 5.3565 9.76552L5.29289 9.70711L0.292893 4.70711C-0.0976309 4.31658 -0.0976309 3.68342 0.292893 3.29289C0.662864 2.92292 1.25061 2.90345 1.6435 3.23448L1.70711 3.29289L6 7.5855L10.2929 3.29289C10.6629 2.92292 11.2506 2.90345 11.6435 3.23448L11.7071 3.29289Z" fill={!this.UIStore.darkMode?"#1C1C34":"white"}/>
                            </svg>

                        </div> */}
                         <div className="network-mob-wrap">

                                <div style={{width:'100%'}} className={classNames('select', { open: dropdownNetworks })}>
                                    <div
                                        className={classNames('selected', 'smain', { light: !this.UIStore.darkMode })}
                                        onClick={() => this.setState({ dropdownNetworks: !dropdownNetworks })}
                                        style={{padding:0,
                                            paddingLeft: '16px',
                                            paddingRight: '16px',
                                            backgroundColor: dropdownNetworks&&!this.UIStore.darkMode?'#E9E9F2':dropdownNetworks&&this.UIStore.darkMode?'#31314D':''
                                        }}
                                    >

                                        <img src={activeNetwork.activeIcon} alt="" />
                                        <div className="network-mob-title">{activeNetwork.label}</div>
                                        <div className="flex-grow"/>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.7071 3.29289C12.0771 3.66286 12.0965 4.25061 11.7655 4.6435L11.7071 4.70711L6.70711 9.70711C6.33714 10.0771 5.74939 10.0965 5.3565 9.76552L5.29289 9.70711L0.292893 4.70711C-0.0976309 4.31658 -0.0976309 3.68342 0.292893 3.29289C0.662864 2.92292 1.25061 2.90345 1.6435 3.23448L1.70711 3.29289L6 7.5855L10.2929 3.29289C10.6629 2.92292 11.2506 2.90345 11.6435 3.23448L11.7071 3.29289Z" fill={!this.UIStore.darkMode?"#1C1C34":"white"}/>
                                        </svg>

                                    </div>
                                    <ClickAwayListener
                                        onClickAway={() =>
                                           dropdownNetworks && this.setState({ dropdownNetworks: false })
                                        }
                                    >
                                        <ul className={classNames('dropdown','dmain', { light: !this.UIStore.darkMode })}>
{/*
                                            <li onClick={() =>
                                                this.setState({
                                                    protocolFilter: undefined,
                                                    networksOpen: false,
                                                })
                                            }>
                                                {activeNetwork.label}
                                            </li> */}
                                            {networks.map((n, key) => (
                                                <li
                                                    key={key}
                                                    onClick={() => {
                                                        this.setState({ dropdownNetworks: false })
                                                        network !== n.id && this.switchNetwork(n.id as any)
                                                    }}
                                                >
                                                    {n.label}
                                                </li>
                                            ))}
                                        </ul>
                                    </ClickAwayListener>
                                </div>
                            </div>
                            <ClickAwayListener
                                onClickAway={() =>
                                        this.setState({ listsOpen: false })
                                    }
                                >
                                <div>
                                    <div className="open-lists-button" onClick={()=>this.setState({listsOpen: !this.state.listsOpen})}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M13.8293 19.0001C13.4175 17.8349 12.3063 17 11 17C9.69375 17 8.58249 17.8349 8.17067 19.0001L3 19C2.44772 19 2 19.4477 2 20C2 20.5523 2.44772 21 3 21L8.17102 21.0009C8.58312 22.1656 9.69412 23 11 23C12.3059 23 13.4169 22.1656 13.829 21.0009L21 21C21.5523 21 22 20.5523 22 20C22 19.4477 21.5523 19 21 19L13.8293 19.0001ZM12 20C12 19.4477 11.5523 19 11 19C10.4477 19 10 19.4477 10 20C10 20.5523 10.4477 21 11 21C11.5523 21 12 20.5523 12 20Z" fill={!this.UIStore.darkMode?"#1C1C34":"white"}/>
                                            <path fillRule="evenodd" clipRule="evenodd" d="M19.8293 11.0001C19.4175 9.83485 18.3063 9 17 9C15.6937 9 14.5825 9.83485 14.1707 11.0001L3 11C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13L14.171 13.0009C14.5831 14.1656 15.6941 15 17 15C18.3059 15 19.4169 14.1656 19.829 13.0009L21 13C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11L19.8293 11.0001ZM18 12C18 11.4477 17.5523 11 17 11C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13C17.5523 13 18 12.5523 18 12Z" fill={!this.UIStore.darkMode?"#1C1C34":"white"}/>
                                            <path fillRule="evenodd" clipRule="evenodd" d="M9.82933 3.00009C9.41751 1.83485 8.30625 1 7 1C5.69375 1 4.58249 1.83485 4.17067 3.00009L3 3C2.44772 3 2 3.44772 2 4C2 4.55228 2.44772 5 3 5L4.17102 5.0009C4.58311 6.16562 5.69412 7 7 7C8.30588 7 9.41688 6.16562 9.82898 5.0009L21 5C21.5523 5 22 4.55228 22 4C22 3.44772 21.5523 3 21 3L9.82933 3.00009ZM8 4C8 3.44772 7.55228 3 7 3C6.44772 3 6 3.44772 6 4C6 4.55228 6.44772 5 7 5C7.55228 5 8 4.55228 8 4Z" fill={!this.UIStore.darkMode?"#1C1C34":"white"}/>
                                        </svg>
                                    </div>
                                    {this.state.listsOpen &&

                                        <div>
                                             <div className="protocol_list">
                                <h2 className="small_title">{t('main::protocolTitle')}</h2>
                                <div className={classNames('select', { open: networksOpen })}>
                                    <div
                                        className={classNames('selected', 'smain', { light: !this.UIStore.darkMode })}
                                        onClick={() => this.setState({ networksOpen: !networksOpen })}
                                        style={{
                                            backgroundColor: this.state.networksOpen&&!this.UIStore.darkMode?'#E9E9F2':this.state.networksOpen&&this.UIStore.darkMode?'#31314D':''
                                        }}
                                    >
                                        {protocolFilter ? NETWORKS[network].protocols[protocolFilter] : t('main::allProtocols')}
                                        <div className="flex-grow"/>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.7071 3.29289C12.0771 3.66286 12.0965 4.25061 11.7655 4.6435L11.7071 4.70711L6.70711 9.70711C6.33714 10.0771 5.74939 10.0965 5.3565 9.76552L5.29289 9.70711L0.292893 4.70711C-0.0976309 4.31658 -0.0976309 3.68342 0.292893 3.29289C0.662864 2.92292 1.25061 2.90345 1.6435 3.23448L1.70711 3.29289L6 7.5855L10.2929 3.29289C10.6629 2.92292 11.2506 2.90345 11.6435 3.23448L11.7071 3.29289Z" fill={!this.UIStore.darkMode?"#1C1C34":"white"}/>
                                        </svg>

                                    </div>
                                    <ClickAwayListener
                                        onClickAway={() =>
                                            networksOpen && this.setState({ networksOpen: false })
                                        }
                                    >
                                        <ul className={classNames('dropdown','dmain', { light: !this.UIStore.darkMode })}>

                                            <li onClick={() =>
                                                this.setState({
                                                    protocolFilter: undefined,
                                                    networksOpen: false,
                                                })
                                            }>
                                                All
                                            </li>
                                            {_.map(NETWORKS[network].protocols, (name, key) => (
                                                <li
                                                    key={key}
                                                    onClick={() =>
                                                        this.setState({
                                                            protocolFilter: key,
                                                            networksOpen: false,
                                                        })
                                                    }
                                                >
                                                    {name}
                                                </li>
                                            ))}
                                        </ul>
                                    </ClickAwayListener>
                                </div>
                            </div>
                            <TokenSearch
                                value={tokenFilter}
                                onChange={(tokenFilter) => this.setState({ tokenFilter })}
                            />
                            <div className="sort_list">
                                <h2 className="small_title">{t('main::sortByTitle')}</h2>
                                <div className={classNames('select sec', { open: orderOpen })}>
                                    <div
                                        className={classNames('selected', 'smain2', { light: !this.UIStore.darkMode })}
                                        onClick={() => this.setState({ orderOpen: !orderOpen })}
                                        style={{
                                            backgroundColor: this.state.orderOpen&&!this.UIStore.darkMode?'#E9E9F2':this.state.orderOpen&&this.UIStore.darkMode?'#31314D':''
                                        }}
                                    >
                                        {orderItems[orderField]}
                                        <div className="flex-grow"/>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.7071 3.29289C12.0771 3.66286 12.0965 4.25061 11.7655 4.6435L11.7071 4.70711L6.70711 9.70711C6.33714 10.0771 5.74939 10.0965 5.3565 9.76552L5.29289 9.70711L0.292893 4.70711C-0.0976309 4.31658 -0.0976309 3.68342 0.292893 3.29289C0.662864 2.92292 1.25061 2.90345 1.6435 3.23448L1.70711 3.29289L6 7.5855L10.2929 3.29289C10.6629 2.92292 11.2506 2.90345 11.6435 3.23448L11.7071 3.29289Z" fill={!this.UIStore.darkMode?"#1C1C34":"white"}/>
                                        </svg>

                                    </div>
                                    <ClickAwayListener
                                        onClickAway={() =>
                                            orderOpen && this.setState({ orderOpen: false })
                                        }
                                    >
                                        <ul className={classNames('dropdown', 'dmain', { light: !this.UIStore.darkMode })} >

                                            {_.map(orderItems, (name, key) => (
                                                <li
                                                    style={{width:'170px'}}
                                                    key={key}
                                                    onClick={() =>
                                                        this.setState({
                                                            orderField: key as any,
                                                            orderOpen: false,
                                                        })
                                                    }
                                                >
                                                    {name}
                                                </li>
                                            ))}
                                        </ul>
                                    </ClickAwayListener>
                                </div>
                            </div>
                                        </div>
                                    }
                                </div>
                            </ClickAwayListener>
                            <div className="protocol_list">
                                <h2 className="small_title">{t('main::protocolTitle')}</h2>
                                <div className={classNames('select', { open: networksOpen })}>
                                    <div
                                        className={classNames('selected', 'smain', { light: !this.UIStore.darkMode })}
                                        onClick={() => this.setState({ networksOpen: !networksOpen })}
                                        style={{
                                            backgroundColor: this.state.networksOpen&&!this.UIStore.darkMode?'#E9E9F2':this.state.networksOpen&&this.UIStore.darkMode?'#31314D':''
                                        }}
                                    >
                                        {protocolFilter ? NETWORKS[network].protocols[protocolFilter] : t('main::allProtocols')}
                                        <div className="flex-grow"/>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.7071 3.29289C12.0771 3.66286 12.0965 4.25061 11.7655 4.6435L11.7071 4.70711L6.70711 9.70711C6.33714 10.0771 5.74939 10.0965 5.3565 9.76552L5.29289 9.70711L0.292893 4.70711C-0.0976309 4.31658 -0.0976309 3.68342 0.292893 3.29289C0.662864 2.92292 1.25061 2.90345 1.6435 3.23448L1.70711 3.29289L6 7.5855L10.2929 3.29289C10.6629 2.92292 11.2506 2.90345 11.6435 3.23448L11.7071 3.29289Z" fill={!this.UIStore.darkMode?"#1C1C34":"white"}/>
                                        </svg>

                                    </div>
                                    <ClickAwayListener
                                        onClickAway={() =>
                                            networksOpen && this.setState({ networksOpen: false })
                                        }
                                    >
                                        <ul className={classNames('dropdown','dmain', { light: !this.UIStore.darkMode })}>

                                            <li onClick={() =>
                                                this.setState({
                                                    protocolFilter: undefined,
                                                    networksOpen: false,
                                                })
                                            }>
                                                All
                                            </li>
                                            {_.map(NETWORKS[network].protocols, (name, key) => (
                                                <li
                                                    key={key}
                                                    onClick={() =>
                                                        this.setState({
                                                            protocolFilter: key,
                                                            networksOpen: false,
                                                        })
                                                    }
                                                >
                                                    {name}
                                                </li>
                                            ))}
                                        </ul>
                                    </ClickAwayListener>
                                </div>
                            </div>
                            <TokenSearch
                                value={tokenFilter}
                                onChange={(tokenFilter) => this.setState({ tokenFilter })}
                            />
                            <div className="sort_list">
                                <h2 className="small_title">{t('main::sortByTitle')}</h2>
                                <div className={classNames('select sec', { open: orderOpen })}>
                                    <div
                                        className={classNames('selected', 'smain2', { light: !this.UIStore.darkMode })}
                                        onClick={() => this.setState({ orderOpen: !orderOpen })}
                                        style={{
                                            backgroundColor: this.state.orderOpen&&!this.UIStore.darkMode?'#E9E9F2':this.state.orderOpen&&this.UIStore.darkMode?'#31314D':''
                                        }}
                                    >
                                        {orderItems[orderField]}
                                        <div className="flex-grow"/>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.7071 3.29289C12.0771 3.66286 12.0965 4.25061 11.7655 4.6435L11.7071 4.70711L6.70711 9.70711C6.33714 10.0771 5.74939 10.0965 5.3565 9.76552L5.29289 9.70711L0.292893 4.70711C-0.0976309 4.31658 -0.0976309 3.68342 0.292893 3.29289C0.662864 2.92292 1.25061 2.90345 1.6435 3.23448L1.70711 3.29289L6 7.5855L10.2929 3.29289C10.6629 2.92292 11.2506 2.90345 11.6435 3.23448L11.7071 3.29289Z" fill={!this.UIStore.darkMode?"#1C1C34":"white"}/>
                                        </svg>

                                    </div>
                                    <ClickAwayListener
                                        onClickAway={() =>
                                            orderOpen && this.setState({ orderOpen: false })
                                        }
                                    >
                                        <ul className={classNames('dropdown', 'dmain', { light: !this.UIStore.darkMode })} >

                                            {_.map(orderItems, (name, key) => (
                                                <li
                                                    style={{width:'170px'}}
                                                    key={key}
                                                    onClick={() =>
                                                        this.setState({
                                                            orderField: key as any,
                                                            orderOpen: false,
                                                        })
                                                    }
                                                >
                                                    {name}
                                                </li>
                                            ))}
                                        </ul>
                                    </ClickAwayListener>
                                </div>
                            </div>
                            <label className={classNames('checkbox-google', { light: !this.UIStore.darkMode })}>
                                <div className="checkbox-label">
                                    <Trans i18nKey='main::stakedOnly'>
                                        <span>Staked</span>
                                        <span>Only</span>
                                    </Trans>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={stakedOnlyFilter}
                                    onChange={() =>
                                        this.setState({ stakedOnlyFilter: !stakedOnlyFilter })
                                    }
                                />
                                <span className={classNames('checkbox-google-switch', { light: !this.UIStore.darkMode })}/>
                            </label>

                            </div>


                    </div>
                    <div className="pool-container">
                        <div className="pool-container-wrapper">
                            {otherPools.length ? (
                                <>
                                    <h2 className={classNames('pool-title', { light: !this.UIStore.darkMode })}>{t('main::yourOtherPools')} ({otherPools.length})</h2>
                                    <div className="pool-body pool-body-migrate">
                                        {otherLoading ? (
                                            <Loader/>
                                        ) : otherPools.length > 0 ? (
                                            otherPools.map((pool) => (
                                                <OtherTableItem key={pool.jsonPool.pid + Math.random()} pool={pool}/>
                                            ))
                                        ) : (
                                            <p className="no-liquidity">
                                                {t('main::noLiquidity')}
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : null}
                            <h2 className={classNames('pool-title', { light: !this.UIStore.darkMode })}>{t('main::activePools')} ({filteredTable.length})</h2>
                            <div className="pool-body pool-body-main">
                                {filteredTable.length === 0 && tokenFilter && (
                                    <p>
                                        {t('main::noResults', { query: tokenFilter })}
                                    </p>
                                )}
                                {filteredTable.map((pool) => (
                                    <TableItem key={pool.adapter + pool.pid} pool={pool} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <ScrollUp />
                </div>

            </>
        )
    }
}

const MainPage = withTranslation()(MainPageComponent)
export default MainPage
