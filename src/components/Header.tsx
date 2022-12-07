import React from 'react';
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { ModalStore, WalletStore, UIStore } from "../stores";
import { Modals } from "../stores/ModalStore";
import { WithTranslation, withTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { maskAddress } from "../utils/utilities";
import classNames from "classnames";
import { NETWORKS_INFO } from "../stores/WalletStore";
import ClickAwayListener from "react-click-away-listener";
import _ from "lodash";

interface IHeaderProps extends WithTranslation {
}

interface IHeaderState {
    burgerOpen: boolean;
    settingsOpen: boolean;
    badgeMenuOpen: boolean;
    isMobile: boolean
}

@observer
class HeaderComponent extends React.Component<IHeaderProps, IHeaderState> {
    @resolve(WalletStore)
    declare protected readonly walletStore: WalletStore;
    @resolve(ModalStore)
    declare protected readonly modalStore: ModalStore;
    @resolve(UIStore)
    declare protected readonly UIStore: UIStore;
    state: IHeaderState = {
        burgerOpen: false,
        settingsOpen: false,
        badgeMenuOpen: false,
        isMobile: false
    }


    render() {
        const { t } = this.props;
        const { settingsOpen } = this.state;
        const { slippage, updateSlippage } = this.walletStore;

        return (
            <div>
                <div className={classNames("header", { light: !this.UIStore.darkMode })}>
                    <div className={classNames("header-container", { light: !this.UIStore.darkMode })}>
                        <div className='header-row'>
                            <div className="header-left tvl">
                                <span className="group">TVL <span className="value">${this.walletStore.api?.general.totalTvl.toFixed(2)}</span></span>
                                <span className="group">TVL {NETWORKS_INFO[this.walletStore.network].name} <span className="value">${_.sum(this.walletStore.api?.pools.map(p => p.tvl)).toFixed(2)}</span></span>
                            </div>
                            <div className="flex-grow"/>
                            <div className="header-right">
                                <button type="button"
                                        className={classNames("settings-btn", { light: !this.UIStore.darkMode })}
                                        onTouchStart={(e) => e.preventDefault()} onTouchEnd={(e) => {
                                    e.preventDefault();
                                    this.UIStore.changeTheme()
                                }} onClick={() => {
                                    this.UIStore.changeTheme()
                                }}>
                                    <img
                                        src={!this.UIStore.darkMode ? require('../images/Light_icon.svg') : require('../images/Dark_icon.svg')}
                                        alt="" className="dark_ico"/>
                                </button>
                                {/* <label className="checkbox-google">
                                    <div className={classNames("checkbox-label", { light: !this.UIStore.darkMode })}>
                                        <span>Dark</span>
                                        <span>Mode</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        defaultChecked={localStorage.getItem('theme')==='dark'?true:false}
                                        onChange={() => {this.UIStore.changeTheme()}}
                                    />
                                    <span className="checkbox-google-switch"/>
                                </label> */}
                                <div className="settings-wrap">
                                    <button type="button"
                                            className={classNames("settings-btn", { light: !this.UIStore.darkMode })}
                                            onTouchStart={(e) => e.preventDefault()} onTouchEnd={(e) => {
                                        e.preventDefault();
                                        this.setState({ settingsOpen: !settingsOpen })
                                    }} onClick={() => this.setState({ settingsOpen: !settingsOpen })}
                                            style={{ backgroundColor: this.state.settingsOpen && !this.UIStore.darkMode ? '#E9E9F2' : this.state.settingsOpen && this.UIStore.darkMode ? '#31314D' : '' }}>
                                        <img
                                            src={!this.UIStore.darkMode ? require('../images/settingsBlack.svg') : require('../images/settings.svg')}
                                            alt=""/>
                                    </button>
                                    <ClickAwayListener
                                        onClickAway={() => settingsOpen && this.setState({ settingsOpen: false })}>
                                        <div className={classNames('settings-popup', {
                                            active: settingsOpen && this.UIStore.darkMode,
                                            activelight: settingsOpen && !this.UIStore.darkMode
                                        })}>
                                            <span className="settings-title">{t('header::slippageTolerance')}</span>
                                            <div
                                                className={classNames("settings-row first", { light: !this.UIStore.darkMode })}>
                                                <button
                                                    className={classNames('settings-item small', { active: parseFloat(slippage) === 1 }, { light: !this.UIStore.darkMode })}
                                                    onClick={() => updateSlippage('1')}>
                                                    1%
                                                </button>
                                                <button
                                                    className={classNames('settings-item small', { active: parseFloat(slippage) === 3 }, { light: !this.UIStore.darkMode })}
                                                    onClick={() => updateSlippage('3')}>
                                                    3%
                                                </button>

                                                <div className="settings-item-wrap">
                                                    <input type="number"
                                                           className={classNames('settings-item small manual', { active: parseFloat(slippage) !== 3 && parseFloat(slippage) !== 1 }, { light: !this.UIStore.darkMode })}
                                                           value={slippage}
                                                           onChange={e => updateSlippage(e.target.value)}/>
                                                    <div className="settings-item-label">%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </ClickAwayListener>

                                </div>
                                <LanguageSwitcher/>
                            </div>
                        </div>
                        <div className='header-row'>
                            <div className="header-left">
                                <div style={{ display: 'flex' }}>
                                    <img src={require('../images/restake_logo.svg')}
                                         style={{ width: '46px', height: '46px' }}></img>
                                    <div style={{ color: !this.UIStore.darkMode ? "#1C1C34" : "white" }}
                                         className="header-logo-text">Restake
                                    </div>
                                </div>

                            </div>
                            <div className="flex-grow"/>
                            <div className="header-right">
                                <div className='header-wrap'>
                                    {this.walletStore.connected ? (
                                        <div
                                            className={classNames('header-right-logged', { change: !this.walletStore.correctNetwork })}>
                                            {this.walletStore.correctNetwork ? (
                                                <>
                                                    <div className="acc_badge">
                                                        <span className="line">
                                                            <span
                                                                className={classNames('inner-line', { light: !this.UIStore.darkMode })}>
                                                                <span className="round">
                                                                    <img src={require('../images/fox.png')} alt=""/>
                                                                </span>
                                                                <span
                                                                    className={classNames('address', { light: !this.UIStore.darkMode })}>
                                                                    {maskAddress(this.walletStore.account)}
                                                                    <img onClick={() => this.setState({
                                                                        badgeMenuOpen: !this.state.badgeMenuOpen,
                                                                        isMobile: false
                                                                    })}
                                                                         src={this.UIStore.darkMode ? require('../images/Arrow_icon.svg') : require('../images/Arrow_iconb.svg')}
                                                                         className="address_arrow"></img>
                                                                </span>
                                                            </span>
                                                        </span>
                                                    </div>

                                                    {this.state.badgeMenuOpen &&
                                                    (
                                                        <ClickAwayListener
                                                            onClickAway={() =>
                                                                !this.state.isMobile && this.setState({ badgeMenuOpen: false })}
                                                        >

                                                            <ul className={classNames("connect_menu", { light: !this.UIStore.darkMode })}>
                                                                <li className={classNames("connect_menu_el", { light: !this.UIStore.darkMode })}
                                                                    onClick={() => {
                                                                        this.walletStore.resetWallet()
                                                                        this.setState({ badgeMenuOpen: false })
                                                                    }}>
                                                                    {t('header::disconnect')}
                                                                </li>
                                                            </ul>

                                                        </ClickAwayListener>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="error-wrap">
                                                        <p className="error-text">{t('header::changeNetwork', { name: NETWORKS_INFO[this.walletStore.network].name })}</p>
                                                        <img src={require('../images/danger-icon.svg')} alt=""
                                                             className="error-icon"/>
                                                    </div>
                                                    <button type="button" className="user-btn">
                                                        <img src={require('../images/logo-user.svg')} alt=""/>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <button className="btn neon header connect_wallet"
                                                onClick={() => this.walletStore.connect()}>
                                            <span
                                                className={classNames("btn-text", { light: !this.UIStore.darkMode })}>{t('header::connectWallet')}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="logged-mobile">
                    {this.walletStore.connected ? (
                        <div
                            className={classNames('header-right-logged', { change: !this.walletStore.correctNetwork })}>
                            {this.walletStore.correctNetwork ? (
                                <>
                                    <div className="acc_badge">
                                            <span className="line">
                                                <span
                                                    className={classNames('inner-line', { light: !this.UIStore.darkMode })}>
                                                    <span className="round">
                                                        <img src={require('../images/fox.png')} alt=""/>
                                                    </span>
                                                    <span
                                                        className={classNames('address', { light: !this.UIStore.darkMode })}>
                                                        {maskAddress(this.walletStore.account)}
                                                        <img onClick={() => this.setState({
                                                            badgeMenuOpen: !this.state.badgeMenuOpen,
                                                            isMobile: true
                                                        })}
                                                             src={this.UIStore.darkMode ? require('../images/Arrow_icon.svg') : require('../images/Arrow_iconb.svg')}
                                                             className="address_arrow"></img>
                                                    </span>
                                                </span>
                                            </span>
                                    </div>
                                    {this.state.badgeMenuOpen &&
                                    (
                                        <ClickAwayListener
                                            onClickAway={() =>
                                                this.state.isMobile && this.setState({ badgeMenuOpen: false })}
                                        >

                                            <ul className={classNames("connect_menu", { light: !this.UIStore.darkMode })}>
                                                <li className={classNames("connect_menu_el", { light: !this.UIStore.darkMode })}
                                                    onClick={() => {
                                                        this.walletStore.resetWallet()
                                                        this.setState({ badgeMenuOpen: false })
                                                    }}>
                                                    {t('header::disconnect')}
                                                </li>
                                            </ul>

                                        </ClickAwayListener>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="error-wrap">
                                        <p className="error-text">{t('header::changeNetwork', { name: NETWORKS_INFO[this.walletStore.network].name })}</p>
                                        <img src={require('../images/danger-icon.svg')} alt="" className="error-icon"/>
                                    </div>
                                    <button type="button" className="user-btn">
                                        <img src={require('../images/logo-user.svg')} alt=""/>
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <button className="btn neon connect_wallet" style={{ width: '100%' }}

                                onClick={() => this.walletStore.connect()}>
                            <span
                                className={classNames("btn-text", { light: !this.UIStore.darkMode })}>{t('header::connectWallet')}</span>
                        </button>
                    )}
                </div>
            </div>
        )
    }
}

export const Header = withTranslation()(HeaderComponent)
