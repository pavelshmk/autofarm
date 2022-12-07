import React from 'react';
import { withTranslation, WithTranslation } from "react-i18next";
import { ICONS, NETWORKS } from "../../utils/const";
import { toBNJS } from "../../utils/utilities";
import { Modals, ModalStore } from "../../stores/ModalStore";
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { UIStore, WalletStore } from "../../stores";
import { OtherTableRow } from "../../utils/types";
import classNames from 'classnames';

interface IOtherRowProps extends WithTranslation {
    pool: OtherTableRow;
}

interface IOtherRowState {
}
console.log('test')
@observer
class OtherRowComponent extends React.Component<IOtherRowProps, IOtherRowState> {
    @resolve(WalletStore)
    declare protected readonly walletStore: WalletStore;
    @resolve(ModalStore)
    declare protected readonly modalStore: ModalStore;
    @resolve(UIStore)
    declare protected readonly uiStore: UIStore;
    render() {
        const { t, pool } = this.props;

        return (
            <div className={classNames('pool-row','pool-row-migration', 'pool-pair-row','nonHover', { light: !this.uiStore.darkMode })}>
                <div className="pool-cell">
                    <div>
                        <div className="tokens">
                            <div className="token token-wrap">
                                <div className={`token-icons`}>
                                <div className={`token-icon`}>
                                    <img src={ICONS[pool.jsonPool.icon1] || this.uiStore.missingIcon} alt="" />
                                </div>
                                {pool.jsonPool.token2 &&
                                    <div className="token-icon">
                                        <img src={ICONS[pool.jsonPool.icon2] || this.uiStore.missingIcon} alt="" />
                                    </div>
                                }
                                </div>
                                <div className="token-info">
                                    <div className="token-names">
                                        <div className={classNames('token-name', { light: !this.uiStore.darkMode })}>
                                            {pool.jsonPool.token1}
                                        </div>
                                        {pool.jsonPool.token2 && (
                                            <>
                                            <span className={classNames('token-name', { light: !this.uiStore.darkMode })}>
                                                -
                                            </span>
                                            <div className={classNames('token-name', { light: !this.uiStore.darkMode })}>
                                                {pool.jsonPool.token2}
                                            </div>
                                            </>
                                        )}
                                     <a href={NETWORKS[this.walletStore.network].explorerTpl.replace('ADDRESS', pool.jsonPool.lp)} target='_blank' onClick={e => e.stopPropagation()}/>
                                    </div>
                                    <span className="token-sub-info">{pool.jsonPool.tokenPrefix}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pool-cell">
                    <div className="token-container with-usd">
                        <span className="token-sub-text">{t('main::lpStaked')}</span>
                        <div  className='values'>
                            <span className={classNames('value', { light: !this.uiStore.darkMode })}>{pool.amount.toFixed(2)}</span>
                            <span className={classNames('value', { light: !this.uiStore.darkMode })}>${pool.usdAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className={classNames('pool-cell', { light: !this.uiStore.darkMode })}>
                    <div className="token-container">
                        <span className="token-sub-text">{t('main::oldApy')}</span>
                        <div className={classNames('old-apy', { light: !this.uiStore.darkMode })}>{toBNJS(pool.pool.victimApy + pool.pool.lpFeesApy + pool.pool.extraApy).toFixed(2)}%</div>
                    </div>
                </div>

                <div className={classNames('pool-cell', { light: !this.uiStore.darkMode })}>
                    <img className="desk-img" src={require('../../images/Migrate_Arrow_ill.svg')} alt="" />
                    <img className="mob-img" src={require('../../images/Migrate_Arrow_ill.svg')} alt="" />
                </div>

                <div className={classNames('pool-cell', { light: !this.uiStore.darkMode })}>
                    <div className="token-container">
                        <span className="token-sub-text">{t('main::newApy')}</span>
                        <div className={classNames('new-apy', { light: !this.uiStore.darkMode })}>{toBNJS(pool.pool.apy).toFixed(2)}%</div>
                    </div>
                </div>
                <div className="pool-cell">
                    <button type="button" className={classNames('btn', 'neon','table-neon', { light: !this.uiStore.darkMode })} onClick={async () => await this.walletStore.connect() && this.modalStore.showModal(Modals.Migrate, pool)}>Migrate</button>
                </div>
            </div>
        )
    }
}

const OtherTableItem = withTranslation()(OtherRowComponent);
export default OtherTableItem;
