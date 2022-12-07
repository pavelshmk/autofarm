import React from 'react';
import { resolve } from "inversify-react";
import { ModalStore, UIStore, WalletStore } from "../stores";
import { Modal } from "../components/Modal";
import { Modals } from "../stores/ModalStore";
import { observer } from "mobx-react";
import { WithTranslation, withTranslation } from "react-i18next";
import classNames from "classnames";
interface IConnectModalProps extends WithTranslation  {
}

interface IConnectModalState {
}

@observer
class ConnectModalComponent extends React.Component<IConnectModalProps, IConnectModalState> {
    @resolve(WalletStore)
    declare protected readonly walletStore: WalletStore;
    @resolve(ModalStore)
    declare protected readonly modalStore: ModalStore;
    @resolve(UIStore)
    declare protected readonly UIStore: UIStore;
    render() {
        const { t } = this.props;

        return (
            <Modal modalKey={Modals.Connect}>
                <div className={classNames('connect', { light: !this.UIStore.darkMode })}>
                    <div className="head co">
                        <div className={classNames('name', { light: !this.UIStore.darkMode })}>
                            {t('modals::connect::title')}
                        </div>
                        <div className="flex-grow"></div>
                        <img src={require('../images/close.svg')} alt="" onClick={() => this.modalStore.hideModals()} style={{cursor:'pointer'}}/>
                    </div>
                    <button className={classNames('btn', { light: !this.UIStore.darkMode })} onClick={() => this.walletStore.connectDefer.resolve('injected')}>
                        <div className="imgin"><img src={require('../images/MetaMask.svg')} alt="" /></div>
                        <span className="name">MetaMask</span>
                    </button>
                    <button className={classNames('btn', { light: !this.UIStore.darkMode })} onClick={() => this.walletStore.connectDefer.resolve('walletconnect')}>
                        <div className="imgin"><img src={require('../images/w_icon.svg')} alt="" /></div>
                        <span className="name">Wallet Connect</span>
                    </button>
                    <button className={classNames('btn', { light: !this.UIStore.darkMode })} onClick={() => this.walletStore.connectDefer.resolve('custom-walletlink')}>
                    <div className="imgin"><img src={require('../images/target2.svg')} alt="" /></div>
                        <span className="name">Coinbase Wallet</span>
                    </button>
                    <div className='get-wallet'>
                        <div className={classNames('get-text', { light: !this.UIStore.darkMode })}>
                            {t('modals::connect::noWallet')}&nbsp;<a href="#">{t('modals::connect::getWallet')}</a>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}

export const ConnectModal = withTranslation()(ConnectModalComponent)