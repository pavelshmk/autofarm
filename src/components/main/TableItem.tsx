import React, { useEffect, useRef, useState } from 'react';
import { withTranslation, WithTranslation } from "react-i18next";
import { Modals, ModalStore } from "../../stores/ModalStore";
import { ICONS, NETWORKS } from "../../utils/const";
import { toBNJS } from "../../utils/utilities";
import { observer } from "mobx-react";
import { resolve, useInjection } from "inversify-react";
import { UIStore, WalletStore } from "../../stores";
import { TableRow } from "../../utils/types";
import classNames from "classnames";
import { ValueLoader } from "../ValueLoader";
import { useInViewport } from 'react-in-viewport';
import BN from 'bignumber.js';
import { toast } from "react-toastify";

interface ITableRowProps extends WithTranslation {
    pool: TableRow;
}

function formatVictimTvl(tvl) {
    tvl = tvl || 0
    let suffix = ''
    if (tvl >= 1000000) {
        tvl /= 1000000
        tvl = tvl.toFixed(2)
        suffix = 'M'
    } else if (tvl >= 1000) {
        tvl /= 1000
        tvl = Math.round(tvl)
        suffix = 'k'
    } else if (tvl === 0) {
        tvl = '0'
    } else {
        tvl = tvl.toFixed(2)
    }
    return `$${tvl}${suffix}`
}

const TableRowComponent = observer(({ t, pool }: ITableRowProps) => {
    const rowRef = useRef();

    const walletStore = useInjection(WalletStore);
    const modalStore = useInjection(ModalStore);
    const uiStore = useInjection(UIStore);
    const { inViewport, enterCount, leaveCount } = useInViewport(rowRef, {}, { disconnectOnLeave: false }, {});
    const [ lpEarned, setLpEarned ] = useState<BN>();
    const [ lpStaked, setLpStaked ] = useState<BN>();
    const [ loaded, setLoaded ] = useState(false);
    const [ tooltip, setTooltip ] = useState(false);

    useEffect(() => {
        // console.log('noupdate', !walletStore.account || !walletStore.connected || enterCount === 0);
        if (!walletStore.account || !walletStore.connected || !walletStore.correctNetwork || enterCount === 0)
            return;

        (async () => {
            for (let i = 0; i < 5; i++) {
                try {
                    const erc20 = walletStore.erc20Contract(pool.lp)
                    const decimals = toBNJS(10).pow(await erc20.decimals()).toString()
                    const balance = toBNJS(await erc20.balanceOf(walletStore.account))
                    const master = walletStore.masterContract()
                    let lpStaked;
                    try {
                        lpStaked = toBNJS(await master.userDeposits(pool.pid, walletStore.account)).div(decimals);
                    } catch (e) {
                        if (e.error?.message?.indexOf('SafeMath') !== -1) {
                            lpStaked = toBNJS(0)
                        } else {
                            throw e;
                        }
                    }
                        setLpStaked(lpStaked)
                    const totalDeposited = walletStore.userInfo[pool.pid]?.totalDeposited || 0;
                    const totalWithdrawn = walletStore.userInfo[pool.pid]?.totalWithdrawn || 0;
                    let lpEarned = lpStaked.minus(totalDeposited).plus(totalWithdrawn).div(decimals)
                    if (lpEarned.lt(0))
                        lpEarned = toBNJS(0);
                    setLpEarned(lpEarned);
                } catch (e) {
                    console.error(e);
                }
            }
        })();
    }, [ enterCount > 0, walletStore.account, walletStore.correctNetwork, walletStore.refreshNotifier ]);


    const onTooltip = (e) => {
        e.stopPropagation()
        setTooltip(!tooltip)
    }

    return (
        <div
            className={classNames('pool-row', 'pool-pair-row',  { light: !uiStore.darkMode })}
            key={pool.pid}
            onClick={async () => {
                if (await walletStore.connect()) {
                    if (!walletStore.correctNetwork) {
                        toast.error('Please switch to a corresponding network first');
                    } else {
                        modalStore.showModal(Modals.Token, pool);
                    }
                }
            }}
            ref={rowRef}
        >
            <div className="pool-cell pool-cell--name">
                <div>
                    <div className="tokens">
                        <div className="token token-wrap">
                            <div className={`token-icons`}>
                                <div className={classNames('token-icon', { light: !uiStore.darkMode, curve: pool.token1.includes('crv') })}>
                                    <img src={ICONS[pool.icon1] || uiStore.missingIcon} alt="" />
                                </div>
                                { pool.token2 &&
                                    <div className={classNames('token-icon', { light: !uiStore.darkMode })}>
                                        <img src={ICONS[pool.icon2] || uiStore.missingIcon} alt="" />
                                    </div>
                                }
                            </div>
                            <div className="token-info">
                                <div className="token-names">
                                    <div className={classNames('token-name', { light: !uiStore.darkMode })}>
                                        {pool.token1}
                                    </div>
                                    {pool.token2 && (
                                        <>
                                            <span className={classNames('token-name', { light: !uiStore.darkMode })}>
                                                -
                                            </span>
                                            <div className={classNames('token-name', { light: !uiStore.darkMode })}>
                                                {pool.token2}
                                            </div>
                                        </>
                                    )}
                                    <a href={NETWORKS[walletStore.network].explorerTpl.replace('ADDRESS', pool.lp)} target='_blank' onClick={e => e.stopPropagation()}/>
                                </div>
                                <span className="token-sub-info">{pool.tokenPrefix}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pool-cell">
                <div className="token-container with-usd">
                    <span className="token-sub-text">{t('main::lpStaked')}</span>
                    <ValueLoader loading={typeof lpStaked === 'undefined'}>
                        <div className='zero'>
                            <span className={classNames("value",{ light: !uiStore.darkMode })}>{lpStaked?.toFixed(2) || '0.00'}</span>
                            <span className={classNames("value text-fade",{ light: !uiStore.darkMode })}>${lpStaked?.times(pool.info?.lpTokenPriceInUsd).toFixed(2) || '0.00'}</span>
                        </div>
                    </ValueLoader>
                </div>
            </div>
            <div className="pool-cell">
                <div className="token-container with-usd">
                    <span className="token-sub-text">{t('main::lpEarned')}</span>
                    <ValueLoader loading={typeof lpEarned === 'undefined'}>
                        <div className='zero'>
                            <span className={classNames("value",{ light: !uiStore.darkMode })}>{lpEarned?.toFixed(2) || '0.00'}</span><span className={classNames("value text-fade",{ light: !uiStore.darkMode })}> ${lpEarned?.times(pool.info?.lpTokenPriceInUsd).toFixed(2) || '0.00'}</span>
                        </div>
                    </ValueLoader>
                </div>
            </div>
            <div className="pool-cell">
                <div className="token-container">
                    <span className="token-sub-text">{t('main::tvl')}</span>
                    <div className="nowrap zero">
                        <div className={classNames("first",{ light: !uiStore.darkMode })}>${toBNJS(pool.tvlValue || 0).toFixed(2)}</div>
                        <span className={classNames("secondary",{ light: !uiStore.darkMode })}>{formatVictimTvl(pool.info?.victimTvl)}</span>
                    </div>
                </div>
            </div>
            <div className="pool-cell">
                <div className="token-container">
                    <span className="token-sub-text">{t('main::apy')}</span>
                    <div  className={classNames("apyValue",{ light: !uiStore.darkMode })}>
                        {(pool.apyValue || 0).toFixed(2)}%
                        <div className="tooltip"  onClick={e=>e.stopPropagation()} onTouchEnd={onTooltip} onMouseEnter={()=>setTooltip(true)} onMouseLeave={()=>setTooltip(false)}>
                            <img src={require('../../images/info.svg')}/>
                            <div style={{opacity:tooltip?1:0}} className={classNames("tooltip-info",{ light: !uiStore.darkMode })}>
                                <div className="line"><span>APY</span>{pool.info?.apy?.toFixed(2) || 0}%</div>
                                <div className="line"><span>APR</span> {(pool.info?.victimApy + pool.info?.extraApy).toFixed(2) || 0}%</div>
                                <div className="line"><span>Daily APR</span> {((pool.info?.victimApy + pool.info?.extraApy) / 365).toFixed(2) || 0}%</div>
                                {pool?.info?.lpFeesApy ? <div className="line"><span>Trading fees</span> {pool.info?.lpFeesApy?.toFixed(2) || 0}%</div> : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pool-cell arrow-cell">
                <img src={require('../../images/raw_arrow.svg')} alt="" />
            </div>
        </div>

    )
});

const TableItem = withTranslation()(TableRowComponent);
export default TableItem;
