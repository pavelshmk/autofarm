import React from 'react';
import { resolve } from "inversify-react";
import { ModalStore, UIStore, WalletStore } from "../stores";
import { Modal } from "../components/Modal";
import { Modals } from "../stores/ModalStore";
import { observer } from "mobx-react";
import { WithTranslation, withTranslation } from "react-i18next";
import classNames from "classnames";
import { TableRow } from "../utils/types";
import { ICONS, MAX_UINT256, NETWORKS } from "../utils/const";
import { toBNJS } from "../utils/utilities";
import axios from "axios";
import BN from "bignumber.js";
import ClickAwayListener from "react-click-away-listener";
import Timeout from 'await-timeout';
import { reaction } from "mobx";
import { ValueLoader } from "../components/ValueLoader";
import Loader from "../components/Loader";
import _ from "lodash";

interface ITokenModalProps extends WithTranslation {
}

interface ITokenModalState {
    dataLoading: boolean;
    isUnstake: boolean;
    depositBalance?: BN;
    lpBalance?: BN;
    approved: BN;
    depositAmount: string;
    withdrawAmount: string;
    unlocking: boolean;
    loading: boolean;
    erc20Balances: ERC20Balance[];
    tokenDropdown: boolean,
    selectedERC20?: ERC20Balance;
    erc20Approved: BN;
    zapAmount: string;
    zapResult: string,
    lpDecimals: BN;
    btnClass: string;
    btnText?: string;
    inputWidth?: string
}

interface ERC20Balance {
    contract_decimals: number,
    contract_name: string;
    contract_ticker_symbol: string;
    contract_address: string;
    supports_erc?: string[];
    logo_url: string;
    type: string;
    balance: string;
    quote_rate?: number;
    quote: number;
}

const initialState: ITokenModalState = {
    dataLoading: true,
    isUnstake: false,
    depositBalance: undefined,
    lpBalance: undefined,
    approved: toBNJS(0),
    depositAmount: '',
    withdrawAmount: '',
    unlocking: false,
    loading: false,
    erc20Balances: [],
    tokenDropdown: false,
    zapAmount: '',
    selectedERC20: undefined,
    erc20Approved: toBNJS(0),
    zapResult: '0',
    lpDecimals: toBNJS(0),
    btnClass: '',
}

function nanAsZero(value: string) {
    if (value === 'NaN')
        return '0';
    return value;
}

@observer
class TokenModalComponent extends React.Component<ITokenModalProps, ITokenModalState> {
    @resolve(WalletStore)
    declare protected readonly walletStore: WalletStore;
    @resolve(ModalStore)
    declare protected readonly modalStore: ModalStore;
    @resolve(UIStore)
    declare protected readonly uiStore: UIStore;
    state: ITokenModalState = initialState;

    private lastNetwork;

    componentDidMount() {
        reaction(() => this.walletStore.refreshNotifier, () => this.onShow(false));
    }

    loadBalanceAndApproved = async () => {
        const erc20 = this.walletStore.erc20Contract(this.pool.lp);
        const decimals = toBNJS(10).pow(await erc20.decimals()).toString();
        const master = this.walletStore.masterContract();
        let depositBalance; let lpBalance; let approved;
        const promises = [
            master.userDeposits(this.pool.pid, this.walletStore.account)
                .then(val => depositBalance = toBNJS(val).div(decimals))
                .catch(e => { if (e.error?.message?.indexOf('SafeMath') !== -1) { depositBalance = toBNJS(0) } else { throw e } }),
            erc20.balanceOf(this.walletStore.account)
                .then(val => lpBalance = toBNJS(val)),
            erc20.allowance(this.walletStore.account, master.address)
                .then(val => approved = toBNJS(val).div(decimals)),
        ]
        await Promise.all(promises);
        this.setState({ depositBalance, lpBalance, approved, lpDecimals: toBNJS(decimals) });
    }

    onShow = async (resetState = true) => {
        const oldErc20Balances = [ ...this.state.erc20Balances ];
        console.log(oldErc20Balances);
        resetState && this.setState(initialState);
        await this.loadBalanceAndApproved();
        let collectedBalances;
        if (this.walletStore.network !== this.lastNetwork && oldErc20Balances) {
            collectedBalances = [];
            while (true) {
                try {
                    const addressToLogo = {};
                    const tokenListPromise = axios.get(NETWORKS[this.walletStore.network].tokenList)
                        .then(({ data }) => data.tokens.forEach(t => addressToLogo[t.address.toLowerCase()] = t.logoURI));
                    const balancesPromise = axios.get(`https://api.covalenthq.com/v1/${this.walletStore.chainId}/address/${this.walletStore.account}/balances_v2/?key=ckey_bc1d89f20f734208900c6c90031`)
                        .then(({ data: { data } }) => {
                            for (const balance of data.items) {
                                if (balance.quote && balance.supports_erc?.includes?.('erc20')) {
                                    balance.logo_url = addressToLogo[balance.contract_address.toLowerCase()];
                                    collectedBalances.push(balance);
                                }
                            }
                        })
                    await Promise.all([tokenListPromise, balancesPromise]);
                    collectedBalances = _.orderBy(collectedBalances, 'quote', 'desc');
                    this.setState({ erc20Balances: collectedBalances });
                    this.lastNetwork = this.walletStore.network;
                    break;
                } catch (e) {
                    console.error(e);
                    await Timeout.set(100);
                }
                break;
            }
        } else {
            collectedBalances = oldErc20Balances;
            this.setState({ erc20Balances: collectedBalances });
        }

        if (this.state.lpBalance.isZero() && collectedBalances.length) {
            await this.setZap(collectedBalances[0]);
        }
        await Timeout.set(0);
        this.setState({ dataLoading: false });
    }


    onWithdraw = async () => {
        this.setState({ loading: true, btnClass: 'loading', btnText: this.props.t('btn::pending') });
        try {
            const erc20 = this.walletStore.erc20Contract(this.pool.lp);
            const decimals = toBNJS(10).pow(await erc20.decimals()).toString();
            const master = this.walletStore.masterContract();
            await this.walletStore.sendTransactionUnstake(
                master, 'withdraw', this.pool.pid,
                toBNJS(this.state.withdrawAmount).times(decimals).integerValue().toFixed(0)
            )
            this.setState({
                btnClass: 'success',
                btnText: this.props.t('btn::success'),
                depositAmount: '',
                withdrawAmount: '',
                zapAmount: ''
            });
            setTimeout(() => this.setState({ btnClass: '', btnText: '' }), 2000);
            this.walletStore.requestRefresh();
        } catch (e) {
            this.setState({ btnClass: 'failed', btnText: this.props.t('btn::failed') });
            setTimeout(() => this.setState({ btnClass: '', btnText: '' }), 2000);
            throw e;
        } finally {
            this.setState({ loading: false });
        }
    }

    onDeposit = async () => {
        this.setState({ loading: true, btnClass: 'loading', btnText: this.props.t('btn::pending') });
        try {
            const erc20 = this.walletStore.erc20Contract(this.pool.lp);
            const decimals = toBNJS(10).pow(await erc20.decimals()).toString();
            const master = this.walletStore.masterContract();
            await this.walletStore.sendTransaction(
                master, 'deposit(uint256,uint256)', this.pool.pid,
                toBNJS(this.state.depositAmount).times(decimals).integerValue().toFixed(0)
            )
            this.setState({
                btnClass: 'success',
                btnText: this.props.t('btn::success'),
                depositAmount: '',
                withdrawAmount: '',
                zapAmount: ''
            });
            setTimeout(() => this.setState({ btnClass: '', btnText: '' }), 2000);
            this.walletStore.requestRefresh();
        } catch (e) {
            this.setState({ btnClass: 'failed', btnText: this.props.t('btn::failed') });
            setTimeout(() => this.setState({ btnClass: '', btnText: '' }), 2000);
            throw e;
        } finally {
            this.setState({ loading: false });
        }
    }

    onApprove = async () => {
        this.setState({ loading: true, unlocking: true, btnClass: 'loading', btnText: this.props.t('btn::pending') });
        try {
            const erc20 = this.walletStore.erc20Contract(this.pool.lp);
            const master = this.walletStore.masterContract();
            await this.walletStore.sendTransaction(erc20, 'approve', master.address, MAX_UINT256)
            this.setState({ btnClass: '', btnText: undefined });
            await this.loadBalanceAndApproved();
        } catch (e) {
            this.setState({ btnClass: 'failed', btnText: this.props.t('btn::failed') });
            setTimeout(() => this.setState({ btnClass: '', btnText: '' }), 2000);
            throw e;
        } finally {
            this.setState({ loading: false, unlocking: false });
        }
    }

    onZapApprove = async () => {
        this.setState({ loading: true, unlocking: true, btnClass: 'loading', btnText: this.props.t('btn::pending') });
        try {
            const erc20 = this.walletStore.erc20Contract(this.state.selectedERC20.contract_address);
            const master = this.walletStore.masterContract();
            await this.walletStore.sendTransaction(erc20, 'approve', master.address, MAX_UINT256);
            this.setState({ btnClass: '', btnText: undefined });
            await this.setZap(this.state.selectedERC20);
        } catch (e) {
            this.setState({ btnClass: 'failed', btnText: this.props.t('btn::failed') });
            setTimeout(() => this.setState({ btnClass: '', btnText: '' }), 2000);
            throw e;
        } finally {
            this.setState({ loading: false, unlocking: false });
        }
    }

    onZap = async () => {
        this.setState({ loading: true, btnClass: 'loading', btnText: this.props.t('btn::pending') });
        try {
            const erc20 = this.walletStore.erc20Contract(this.state.selectedERC20.contract_address);
            const decimals = toBNJS(10).pow(await erc20.decimals()).toString();
            const master = this.walletStore.masterContract();
            console.log(this.state.zapAmount, this.state.selectedERC20?.quote_rate, this.pool?.info?.lpTokenPriceInUsd, toBNJS(98).minus(this.walletStore.slippage).div(100));
            await this.walletStore.sendTransaction(
                master, 'zapAndDeposit(address,uint256,uint256,uint256)',
                this.state.selectedERC20.contract_address,
                this.pool.pid,
                toBNJS(this.state.zapAmount).times(decimals).integerValue().toFixed(0),
                toBNJS(this.state.zapAmount).times(this.state.selectedERC20?.quote_rate).div(this.pool?.info?.lpTokenPriceInUsd).times(toBNJS(98).minus(this.walletStore.slippage).div(100)).integerValue().toFixed(0),
            )
            this.setState({
                btnClass: 'success',
                btnText: this.props.t('btn::success'),
                depositAmount: '',
                withdrawAmount: '',
                zapAmount: ''
            });
            setTimeout(() => this.setState({ btnClass: '', btnText: '' }), 2000);
            this.walletStore.requestRefresh();
        } catch (e) {
            this.setState({ btnClass: 'failed', btnText: this.props.t('btn::failed') });
            setTimeout(() => this.setState({ btnClass: '', btnText: '' }), 2000);
            throw e;
        } finally {
            this.setState({ loading: false });
        }
    }
    onMaxValue = async (field: string, value: string) => {
        if (field === 'depositAmount') {
            this.setState({
                depositAmount: value
            })
        } else if (field === 'withdrawAmount') {
            this.setState({
                withdrawAmount: value
            })
        } else if (field === 'zapAmount') {
            this.setState({
                zapAmount: value
            })
        }
        this.setState({
            inputWidth:
                value.length < 6 ? '' :
                    value.length > 5 && value.length <= 13 ? (value.length + 1) * 12 + 'px' :
                        value.length > 13 ? ((value.length + 1) * 10) + 'px' : ''
        })
    }
    setZap = async (selectedERC20: ERC20Balance) => {
        this.setState({
            selectedERC20,
            erc20Approved: toBNJS(0),
            tokenDropdown: false,
            zapAmount: '',
            zapResult: ''
        });
        const master = this.walletStore.masterContract();
        const erc20 = this.walletStore.erc20Contract(selectedERC20.contract_address);
        const decimals = toBNJS(10).pow(await erc20.decimals()).toString();
        const approved = toBNJS(await erc20.allowance(this.walletStore.account, master.address)).div(decimals);
        this.setState({ erc20Approved: approved });
    }

    get pool(): TableRow {
        return this.modalStore.tempStorage;
    }

    render() {
        const { t } = this.props;
        const {
            isUnstake, approved, depositBalance, lpBalance, depositAmount, withdrawAmount,
            loading, tokenDropdown, erc20Balances, dataLoading,
            selectedERC20, erc20Approved, zapAmount, lpDecimals, btnClass, btnText
        } = this.state;

        const pool = this.pool;

        const approveRequired = approved.lte(depositAmount);
        const zapApproveRequired = erc20Approved.lte(zapAmount);
        // const baseEarning = depositBalance.times(pool?.info?.lpTokenPriceInWeth);
        // const dailyEarning = baseEarning.times(Math.exp((pool?.info?.victimApy + pool?.info?.lpFeesApy) / 100 / 365) - 1);
        // const monthlyEarning = baseEarning.times(Math.exp((pool?.info?.victimApy + pool?.info?.lpFeesApy) / 100 / 12) - 1);
        // const annualEarning = baseEarning.times(Math.exp((pool?.info?.victimApy + pool?.info?.lpFeesApy) / 100) - 1);

        const zapReceive = toBNJS(zapAmount).times(selectedERC20?.quote_rate).div(pool?.info?.lpTokenPriceInUsd).times('.98');

        const cleanValue = e => {
            return e.target.value.replace(/[^0-9.]/g, '');
        }

        const onSubmit = async () => {
            if (isUnstake) {
                await this.onWithdraw();
            } else {
                if (selectedERC20) {
                    if (zapApproveRequired)
                        await this.onZapApprove();
                    else
                        await this.onZap();
                } else {
                    if (approveRequired)
                        await this.onApprove();
                    else
                        await this.onDeposit();
                }
            }
        }
        const tokenList = erc20Balances.length ? (
            <ClickAwayListener onClickAway={e => tokenDropdown && this.setState({ tokenDropdown: false })}>
                <div className={classNames('token-list', { light: !this.uiStore.darkMode })}>
                    {selectedERC20 && (
                        <div className={classNames('token-item', { light: !this.uiStore.darkMode })}
                             onClick={() => this.setState({
                                 tokenDropdown: false,
                                 selectedERC20: undefined,
                                 depositAmount: '',
                                 withdrawAmount: '',
                                 inputWidth: ''
                             })}>
                            <div className={classNames('token-wrap-img', { light: !this.uiStore.darkMode })}>
                                <img src={ICONS[this.pool?.icon1] || this.uiStore.missingIcon} alt=""/>
                                {this.pool?.token2 &&
                                <img src={ICONS[this.pool?.icon2] || this.uiStore.missingIcon} alt=""
                                     className="left"/>}
                            </div>
                            <div className="token-wrap-c-row">
                                <span className={classNames('token-wrap-coin', { light: !this.uiStore.darkMode })}
                                      style={{ /*fontSize: this.pool?.token1.length + (this.pool?.token2 && this.pool.token2.length) > 12 ? '14px' : '20px'*/ }}>{this.pool?.token1}{this.pool?.token2 && `/ ${this.pool.token2}`}</span>
                                <span className="token-wrap-c-info">{lpBalance?.div(lpDecimals).toFixed(6)}</span>
                            </div>

                            <div className="token-item-col">
                                <span
                                    className={classNames('token-item-text', { light: !this.uiStore.darkMode })}>{lpBalance?.div(lpDecimals).toFixed(6)}</span>
                                <span
                                    className="token-wrap-info rel"> ${nanAsZero(lpBalance?.div(lpDecimals).times(pool?.info?.lpTokenPriceInUsd).toFixed(2))}</span>
                            </div>
                        </div>
                    )}
                    {erc20Balances.filter(b => b.contract_address !== selectedERC20?.contract_address).map(balance => (
                        <div className={classNames('token-item', { light: !this.uiStore.darkMode })}
                             onClick={() => this.setZap(balance)} key={balance.contract_address}>
                            <div className={classNames('token-wrap-img', { light: !this.uiStore.darkMode })}>
                                <img src={balance.logo_url || this.uiStore.missingIcon} alt=""/>
                            </div>
                            <div className="token-wrap-c-row">
                                <span className={classNames('token-wrap-coin', { light: !this.uiStore.darkMode })}
                                      style={{ /*fontSize: balance.contract_name.length > 10 ? '14px' : '20px'*/ }}>{balance.contract_name}</span>
                                <span className="token-wrap-c-info"> {depositBalance?.toFixed(2)}</span>
                            </div>


                            <div className="token-item-col">
                                <span
                                    className={classNames('token-item-text', { light: !this.uiStore.darkMode })}>{toBNJS(balance.balance).div(toBNJS(10).pow(balance.contract_decimals)).toFixed(6)}</span>
                                <span className="token-wrap-info rel"> ${nanAsZero(balance.quote.toFixed(2))}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </ClickAwayListener>
        ) : null;

        const totalDeposited = this.walletStore.userInfo[pool?.pid]?.totalDeposited || 0;
        const totalWithdrawn = this.walletStore.userInfo[pool?.pid]?.totalWithdrawn || 0;
        let earned = lpBalance?.minus(totalDeposited).plus(totalWithdrawn).div(lpDecimals);
        if (earned?.lt(0))
            earned = toBNJS(0);


        return (
            <Modal modalKey={Modals.Token} onShow={this.onShow}>
                {pool && (
                    dataLoading ? (
                        <Loader/>
                    ) : (
                        <div className={classNames('connect connect-token', { light: !this.uiStore.darkMode })}>
                            <div className={classNames('head', 'token-header', { light: !this.uiStore.darkMode })}>
                                <div className="migrate-img">
                                    <img src={ICONS[pool?.icon1] || this.uiStore.missingIcon} alt=""/>
                                    {pool?.token2 && <img src={ICONS[pool.icon2] || this.uiStore.missingIcon} alt=""/>}
                                </div>
                                <p className="migrate-text">
                                    <span> {pool?.token1}{pool?.token2 && `-${pool.token2}`}</span></p>
                                <div className="flex-grow"/>
                                <img className="migrate-close" src={require('../images/close.svg')} alt=""
                                     onClick={() => this.modalStore.hideModals()}/>
                            </div>

                            <div className="migrate-body">
                                <div className='migrate-head'>
                                    <div className={classNames('migrate-head-wrap', { light: !this.uiStore.darkMode })}>
                                        <div className="migrate-col">
                                            <ValueLoader loading={typeof depositBalance === 'undefined'}>
                                                <div className="migrate-col-row mb">
                                                    <span className="migrate-info">{t('modals::token::staked')}</span>
                                                    {/* <span className={classNames('migrate-count', { light: !this.uiStore.darkMode })}>{depositBalance?.toFixed(2)}</span>
                                                    <span className="migrate-count-dollar">   ${depositBalance?.times(pool?.info?.lpTokenPriceInUsd).toFixed(2)}</span> */}
                                                </div>
                                            </ValueLoader>

                                            <ValueLoader loading={typeof earned === 'undefined'}>
                                                <div className="migrate-col-row mb">
                                                    <span className="migrate-info">{t('modals::token::earned')}</span>
                                                    {/* <span className={classNames('migrate-count', { light: !this.uiStore.darkMode })}>{earned?.toFixed(2)}</span>
                                                    <span className="migrate-count-dollar">   ${earned?.times(pool?.info?.lpTokenPriceInUsd).toFixed(2)}</span> */}
                                                </div>
                                            </ValueLoader>

                                            <div className="migrate-col-row last">
                                                <span className="migrate-info">{t('modals::token::apy')}</span>
                                                {/* <span className={classNames('migrate-count','apy', { light: !this.uiStore.darkMode })}>{((pool?.info?.apy + pool?.info?.lpFeesApy) || 0).toFixed(2)}%</span> */}
                                            </div>
                                        </div>
                                        <div className="migrate-col">
                                            <ValueLoader loading={typeof depositBalance === 'undefined'}>
                                                <div className="migrate-col-row mb">
                                                    {/* <span className="migrate-info">{t('modals::token::staked')}</span> */}
                                                    <span
                                                        className={classNames('migrate-count', { light: !this.uiStore.darkMode })}>{depositBalance?.toFixed(4)}</span>
                                                    <span
                                                        className="migrate-count-dollar">${depositBalance?.times(pool?.info?.lpTokenPriceInUsd).toFixed(2)}</span>
                                                </div>
                                            </ValueLoader>

                                            <ValueLoader loading={typeof earned === 'undefined'}>
                                                <div className="migrate-col-row mb">
                                                    {/* <span className="migrate-info">{t('modals::token::earned')}</span> */}
                                                    <span
                                                        className={classNames('migrate-count', { light: !this.uiStore.darkMode })}>{earned?.toFixed(4)}</span>
                                                    <span
                                                        className="migrate-count-dollar">${earned?.times(pool?.info?.lpTokenPriceInUsd).toFixed(2)}</span>
                                                </div>
                                            </ValueLoader>

                                            <div className="migrate-col-row last">
                                                {/* <span className="migrate-info">{t('modals::token::apy')}</span> */}
                                                <span
                                                    className={classNames('migrate-count', 'apy', { light: !this.uiStore.darkMode })}>{((pool?.info?.apy + pool?.info?.lpFeesApy) || 0).toFixed(4)}%</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div className='token-bool'>
                                    <div className={classNames('token-bool-stake', { active: !this.state.isUnstake })}
                                         onClick={() => {
                                             this.setState({ isUnstake: false, inputWidth: '' })
                                         }} style={{
                                        color: !this.state.isUnstake && !this.uiStore.darkMode ? '#1C1C34' : '',
                                        fontWeight: !this.state.isUnstake && !this.uiStore.darkMode ? 600 : 500
                                    }}>{t('modals::token::stakeSw')}</div>

                                    <div className={classNames('token-bool-stake', { active: this.state.isUnstake })}
                                         onClick={() => {
                                             this.setState({ isUnstake: true, inputWidth: '' })
                                         }} style={{
                                        color: this.state.isUnstake && !this.uiStore.darkMode ? '#1C1C34' : '',
                                        fontWeight: this.state.isUnstake && !this.uiStore.darkMode ? 600 : 500
                                    }}>{t('modals::token::unstakeSw')}</div>
                                </div>


                                {isUnstake ? (
                                    <div className='token-wrapper'>
                                        <div className={classNames('token-wrap', { light: !this.uiStore.darkMode })}>
                                            {/* <button type="button" className="token-open" style={{ opacity: 0 }}>
                                                <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.5093 1.12158L6.75456 5.96029L1.99984 1.12158" stroke="white" strokeWidth="3"/>
                                                </svg>
                                            </button> */}
                                            <div style={{ display: 'flex' }}>
                                                <div
                                                    className={classNames('token-wrap-img', { light: !this.uiStore.darkMode })}>
                                                    <img src={ICONS[pool?.icon1] || this.uiStore.missingIcon} alt=""/>
                                                    {pool?.token2 &&
                                                    <img src={ICONS[pool.icon2] || this.uiStore.missingIcon} alt=""/>}
                                                </div>

                                                <div className="token-wrap-c-row">
                                                    <span
                                                        className={classNames('token-wrap-coin', { light: !this.uiStore.darkMode })}
                                                        style={{ fontSize: pool?.token1.length + (pool?.token2 && `-${pool.token2}`).length > 10 ? '14px' : '20px' }}>{pool?.token1}{pool?.token2 && `-${pool.token2}`}</span>
                                                    <span className="token-wrap-c-info"> <ValueLoader
                                                        loading={typeof depositBalance === 'undefined'}>{depositBalance?.toFixed(2)}</ValueLoader></span>
                                                </div>
                                            </div>


                                            <div
                                                className={classNames('token-wrap-col', { light: !this.uiStore.darkMode })}>
                                                <div className="token-wrap-row">
                                                    <button type="button"
                                                            className={classNames('token-wrap-max', { light: !this.uiStore.darkMode })}
                                                            onClick={() => this.onMaxValue('withdrawAmount', depositBalance.toString())}>
                                                        MAX
                                                    </button>
                                                    <input
                                                        type="text"
                                                        placeholder="0"
                                                        step='.00001'
                                                        value={withdrawAmount}
                                                        maxLength={15}
                                                        onChange={e => {
                                                            this.setState({ withdrawAmount: cleanValue(e) })
                                                            if (e.target.value.length < 11) {
                                                                this.setState({ inputWidth: '' })
                                                            }
                                                            if (e.target.value.length > 10) {
                                                                this.setState({ inputWidth: ((e.target.value.length + 1) * 12) + 'px' })
                                                            }
                                                            if (e.target.value.length > 13) {
                                                                this.setState({ inputWidth: ((e.target.value.length + 1) * 10) + 'px' })
                                                            }
                                                        }}
                                                        onBlur={() => this.setState({ withdrawAmount: toBNJS(withdrawAmount).gt(depositBalance) ? depositBalance.toString() : (toBNJS(withdrawAmount).lt(0) ? '0' : withdrawAmount) })}
                                                        style={{
                                                            fontSize: withdrawAmount.length > 13 ? '16px' : undefined,
                                                            width: this.state.inputWidth
                                                        }}
                                                    /></div>
                                                <span
                                                    className="token-wrap-info">${nanAsZero(toBNJS(withdrawAmount).times(pool?.info?.lpTokenPriceInUsd).toFixed(2))}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    !selectedERC20 ? (
                                        <div className={classNames('token-wrapper', { active: tokenDropdown })}>
                                            {tokenList}
                                            <div
                                                className={classNames('token-wrap token-wrap-zap', { light: !this.uiStore.darkMode })}>
                                                <div
                                                    className='token-wrap-zap-active-zone'
                                                    onClick={() => this.setState({ tokenDropdown: !tokenDropdown })}
                                                >
                                                    <div className="bg-container">
                                                        <button type="button" className="token-open"
                                                                style={{ display: erc20Balances.length > 0 ? 'block' : 'none' }}>
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg">
                                                                <path
                                                                    d="M11.7071 3.29289C12.0771 3.66286 12.0965 4.25061 11.7655 4.6435L11.7071 4.70711L6.70711 9.70711C6.33714 10.0771 5.74939 10.0965 5.3565 9.76552L5.29289 9.70711L0.292893 4.70711C-0.0976305 4.31658 -0.0976305 3.68342 0.292893 3.29289C0.662864 2.92292 1.25061 2.90345 1.6435 3.23448L1.70711 3.29289L6 7.5855L10.2929 3.29289C10.6629 2.92292 11.2506 2.90345 11.6435 3.23448L11.7071 3.29289Z"
                                                                    fill={this.uiStore.darkMode ? "white" : '#1C1C34'}/>
                                                            </svg>

                                                        </button>
                                                        <div style={{ display: 'flex' }}>
                                                            <div
                                                                className={classNames('token-wrap-img', { light: !this.uiStore.darkMode })}>
                                                                <img
                                                                    src={ICONS[pool?.icon1] || this.uiStore.missingIcon}
                                                                    alt=""/>
                                                                {pool?.token2 &&
                                                                <img src={ICONS[pool.icon2] || this.uiStore.missingIcon}
                                                                     alt=""/>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="token-wrap-c-row">
                                                        <span
                                                            className={classNames('token-wrap-coin', { light: !this.uiStore.darkMode })}
                                                            style={{ fontSize: pool?.token1.length + (pool?.token2 && `-${pool.token2}`).length > 10 ? '14px' : '20px' }}>{pool?.token1}{pool?.token2 && `-${pool.token2}`}</span>
                                                        <span className="token-wrap-c-info"><ValueLoader
                                                            loading={typeof lpBalance === 'undefined'}>{lpBalance?.div(lpDecimals).toFixed(2) || '0.00'}</ValueLoader></span>
                                                    </div>
                                                </div>
                                                <div className='token-wrap-col-wrapper'
                                                     style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <div
                                                        className={classNames('token-wrap-col', { light: !this.uiStore.darkMode })}>
                                                        <div className="token-wrap-row">
                                                            <button type="button"
                                                                    className={classNames('token-wrap-max', { light: !this.uiStore.darkMode })}
                                                                    onClick={() => this.onMaxValue('depositAmount', lpBalance.div(lpDecimals).toString())}


                                                            >MAX
                                                            </button>
                                                            <input
                                                                type="text"
                                                                placeholder="0"
                                                                value={depositAmount}
                                                                step='.00001'
                                                                maxLength={15}
                                                                onChange={e => {
                                                                    this.setState({ depositAmount: cleanValue(e) })
                                                                    if (e.target.value.length < 11) {
                                                                        this.setState({ inputWidth: '' })
                                                                    }
                                                                    if (e.target.value.length > 10) {
                                                                        this.setState({ inputWidth: ((e.target.value.length + 1) * 12) + 'px' })
                                                                    }
                                                                    if (e.target.value.length > 13) {
                                                                        this.setState({ inputWidth: ((e.target.value.length + 1) * 10) + 'px' })
                                                                    }
                                                                }}
                                                                onBlur={() => this.setState({ depositAmount: toBNJS(depositAmount).gt(lpBalance.div(lpDecimals)) ? lpBalance.div(lpDecimals).toString() : (toBNJS(depositAmount).lt(0) ? '0' : depositAmount) })}
                                                                style={{
                                                                    fontSize: depositAmount.length > 13 ? '16px' : undefined,
                                                                    width: this.state.inputWidth
                                                                }}
                                                            />
                                                        </div>
                                                        <span
                                                            className="token-wrap-info"> ${nanAsZero(toBNJS(depositAmount || 0).times(pool?.info?.lpTokenPriceInUsd).toFixed(2))}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={classNames('token-wrapper', { active: tokenDropdown })}>
                                                <div
                                                    className={classNames('token-wrap token-wrap-zap', { light: !this.uiStore.darkMode })}>
                                                    <div
                                                        className='token-wrap-zap-active-zone'
                                                        onClick={() => this.setState({ tokenDropdown: !tokenDropdown })}
                                                    >
                                                        <div className="bg-container">
                                                            <button
                                                                onClick={() => this.setState({ tokenDropdown: !tokenDropdown })}
                                                                type="button" className="token-open"
                                                                style={{ opacity: erc20Balances.length > 0 ? 1 : 0 }}>

                                                                <svg width="12" height="12" viewBox="0 0 12 12"
                                                                     fill="none"
                                                                     xmlns="http://www.w3.org/2000/svg">
                                                                    <path
                                                                        d="M11.7071 3.29289C12.0771 3.66286 12.0965 4.25061 11.7655 4.6435L11.7071 4.70711L6.70711 9.70711C6.33714 10.0771 5.74939 10.0965 5.3565 9.76552L5.29289 9.70711L0.292893 4.70711C-0.0976305 4.31658 -0.0976305 3.68342 0.292893 3.29289C0.662864 2.92292 1.25061 2.90345 1.6435 3.23448L1.70711 3.29289L6 7.5855L10.2929 3.29289C10.6629 2.92292 11.2506 2.90345 11.6435 3.23448L11.7071 3.29289Z"
                                                                        fill={this.uiStore.darkMode ? "white" : 'black'}/>
                                                                </svg>
                                                            </button>
                                                            <div
                                                                className={classNames('token-wrap-img', { light: !this.uiStore.darkMode })}>
                                                                <img
                                                                    src={selectedERC20.logo_url || this.uiStore.missingIcon}
                                                                    alt=""/>
                                                            </div>
                                                        </div>
                                                        <div className="token-wrap-c-row">
                                                            <span
                                                                className={classNames('token-wrap-coin', { light: !this.uiStore.darkMode })}
                                                                style={{ fontSize: selectedERC20.contract_name?.length > 10 ? '14px' : '20px' }}>{selectedERC20.contract_name}</span>
                                                            <span
                                                                className="token-wrap-c-info"> {depositBalance?.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className='token-wrap-col-wrapper'
                                                         style={{ display: 'flex', justifyContent: 'flex-end' }}>

                                                        <div
                                                            className={classNames('token-wrap-col', { light: !this.uiStore.darkMode })}>
                                                            <div className="token-wrap-row">
                                                                <button
                                                                    type="button"
                                                                    className={classNames('token-wrap-max', { light: !this.uiStore.darkMode })}
                                                                    onClick={() => this.onMaxValue('zapAmount', toBNJS(selectedERC20.balance).div(toBNJS(10).pow(selectedERC20.contract_decimals)).toString())}
                                                                >
                                                                    MAX
                                                                </button>

                                                                <input
                                                                    type="text"
                                                                    placeholder="0"
                                                                    value={zapAmount}
                                                                    maxLength={15}
                                                                    onChange={e => {
                                                                        this.setState({ zapAmount: cleanValue(e) })
                                                                        if (e.target.value.length < 11) {
                                                                            this.setState({ inputWidth: '' })
                                                                        }
                                                                        if (e.target.value.length > 10) {
                                                                            this.setState({ inputWidth: ((e.target.value.length + 1) * 12) + 'px' })
                                                                        }
                                                                        if (e.target.value.length > 13) {
                                                                            this.setState({ inputWidth: ((e.target.value.length + 1) * 10) + 'px' })
                                                                        }
                                                                    }}
                                                                    onBlur={() => this.setState({ depositAmount: toBNJS(depositAmount).gt(lpBalance.div(lpDecimals)) ? lpBalance.div(lpDecimals).toString() : (toBNJS(depositAmount).lt(0) ? '0' : depositAmount) })}
                                                                    style={{
                                                                        fontSize: zapAmount.length > 13 ? '16px' : undefined,
                                                                        width: this.state.inputWidth
                                                                    }}
                                                                />
                                                            </div>
                                                            <span
                                                                className="token-wrap-info"> ${nanAsZero(toBNJS(selectedERC20.quote_rate).times(zapAmount).toFixed(2))}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {tokenList}
                                            </div>
                                            <div className="unstake-img">
                                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="48" height="48" rx="24"
                                                          fill={this.uiStore.darkMode ? "#32334A" : "rgba(247, 247, 253, 1)"}/>
                                                    <path
                                                        d="M29.7071 25.2929C30.0771 25.6629 30.0965 26.2506 29.7655 26.6435L29.7071 26.7071L24.7071 31.7071C24.3371 32.0771 23.7494 32.0965 23.3565 31.7655L23.2929 31.7071L18.2929 26.7071C17.9024 26.3166 17.9024 25.6834 18.2929 25.2929C18.6629 24.9229 19.2506 24.9035 19.6435 25.2345L19.7071 25.2929L24 29.5855L28.2929 25.2929C28.6629 24.9229 29.2506 24.9035 29.6435 25.2345L29.7071 25.2929Z"
                                                        fill={this.uiStore.darkMode ? "white" : "#1C1C34"}/>
                                                    <path
                                                        d="M29.7071 17.2929C30.0771 17.6629 30.0965 18.2506 29.7655 18.6435L29.7071 18.7071L24.7071 23.7071C24.3371 24.0771 23.7494 24.0965 23.3565 23.7655L23.2929 23.7071L18.2929 18.7071C17.9024 18.3166 17.9024 17.6834 18.2929 17.2929C18.6629 16.9229 19.2506 16.9035 19.6435 17.2345L19.7071 17.2929L24 21.5855L28.2929 17.2929C28.6629 16.9229 29.2506 16.9035 29.6435 17.2345L29.7071 17.2929Z"
                                                        fill={this.uiStore.darkMode ? "white" : "#1C1C34"}/>
                                                </svg>

                                            </div>
                                            <div className="token-wrapper">
                                                <div
                                                    className={classNames('token-wrap', { light: !this.uiStore.darkMode })}>
                                                    <div style={{ display: 'flex' }}>
                                                        <div
                                                            className={classNames('token-wrap-img', { light: !this.uiStore.darkMode })}>
                                                            <img src={ICONS[pool?.icon1] || this.uiStore.missingIcon}
                                                                 alt=""/>
                                                            {pool?.token2 &&
                                                            <img src={ICONS[pool.icon2] || this.uiStore.missingIcon}
                                                                 alt=""/>}
                                                        </div>
                                                        <div className="token-wrap-c-row">
                                                            <span
                                                                className={classNames('token-wrap-coin', { light: !this.uiStore.darkMode })}
                                                                style={{ fontSize: pool?.token1.length + (pool?.token2 && `-${pool.token2}`).length > 10 ? '14px' : '20px' }}>{pool?.token1}{pool?.token2 && `-${pool.token2}`}</span>
                                                            <span
                                                                className="token-wrap-c-info"> {depositBalance?.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={classNames('token-wrap-col readonly', { light: !this.uiStore.darkMode })}>
                                                        <input type="text" placeholder="0" readOnly
                                                               value={nanAsZero(zapReceive.toFixed(5))} style={{

                                                            // width:this.state.inputWidth
                                                        }}/>
                                                        <span
                                                            className="token-wrap-info small"> ${nanAsZero(zapReceive.times(pool?.info?.lpTokenPriceInUsd).toFixed(2))}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )
                                )}
                            </div>
                            <div className="migrate-footer">
                                <button
                                    className={classNames('new-btn', btnClass, { light: !this.uiStore.darkMode })}
                                    disabled={
                                        loading
                                        || isUnstake && (parseFloat(withdrawAmount) <= 0 || toBNJS(withdrawAmount).gt(depositBalance) || toBNJS(withdrawAmount).isNaN())
                                        || !isUnstake && (
                                            !selectedERC20 && (parseFloat(depositAmount) <= 0 || toBNJS(depositAmount).times(lpDecimals).gt(lpBalance) || toBNJS(depositAmount).isNaN())
                                            || selectedERC20 && (parseFloat(zapAmount) <= 0 || toBNJS(zapAmount).times(toBNJS(10).pow(selectedERC20.contract_decimals)).gt(selectedERC20.balance) || toBNJS(zapAmount).isNaN())
                                        )
                                    }
                                    onClick={onSubmit}
                                >
                                    {btnText || (isUnstake ? t('modals::token::unstakeBtn') : (!selectedERC20 && approveRequired || selectedERC20 && zapApproveRequired ? t('modals::token::approveBtn') : t('modals::token::stakeBtn')))}
                                </button>
                            </div>
                        </div>
                    )
                )}
            </Modal>
        )
    }
}

export const TokenModal = withTranslation()(TokenModalComponent)
