import React from 'react';
import { resolve } from "inversify-react";
import { ModalStore, UIStore, WalletStore } from "../stores";
import { Modal } from "../components/Modal";
import { Modals } from "../stores/ModalStore";
import { observer } from "mobx-react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { OtherTableRow } from "../utils/types";
import { toBNJS } from "../utils/utilities";
import { ICONS } from "../utils/const";
import classNames from "classnames";

interface IMigrateModalProps extends WithTranslation {
}

interface IMigrateModalState {
    loading: boolean;
    btnText: string;
    btnClass: string;
    state: number;
    failed: boolean;
    ready:number;

}

const initialState = {
    loading: false,
    btnText: 'Migrate',
    btnClass: '',
    state: 0,
    failed: false,
    ready: 1
};

function ProcessItem({ state, num, label, labelClass, failed, theme, last = false, ready,loading }) {
    const loadingItem = state === num && loading;
    const pending = state < num && !ready;
    const done = state > num;
    const current = state === num;
    const first = state === 0 && num === 1;

    return (
        <div className="process__item" style={{zIndex:current||first?3:1,marginBottom:label?.includes('LP')?"-20px":"0px"}}>
            <div className={classNames('process__img', { 'spiner-loader': loadingItem })}>

                 {ready&&
                <svg className="process__ready"  viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect  rx="60" fill='#7379FF'/>
                </svg>

                 }
                 {(!loadingItem && !ready||pending  ) &&
                <svg className="process__ready"  viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect  rx="60" fill={theme?"#31314D":'#F3F3F3'}/>
                </svg>

                 }
                 {failed&&ready && <img src={require('../images/failedMigrate.svg')}  alt="" />}
                {loadingItem && !failed &&
                <div className="process__load">
                    <svg>
                        <circle

                        stroke="white"

                        fill="#7379FF"
                        style={{transform:'translateY(15px)'}}
                        r="54"
                        cx="60"
                        cy="60"/>
                    </svg>
                </div>


                }
                {done && <img src={require('../images/p8.svg')} alt="" />}

            </div>
            <span className={`process__name ${failed&&ready? 'process__name_failed':loadingItem||ready ? 'process__name_loading' : pending ? 'process__name_pending' : 'process__name_done'}`} style={{width:label?.includes('LP')?"67px":""}}>{label}</span>
            {/* {!last && <div className={classNames('line', { fill: state > num })} />} */}
        </div>
    )
}

@observer
class MigrateModalComponent extends React.Component<IMigrateModalProps, IMigrateModalState> {
    state: IMigrateModalState = initialState

    @resolve(WalletStore)
    declare protected readonly walletStore: WalletStore;
    @resolve(ModalStore)
    declare protected readonly modalStore: ModalStore;
    @resolve(UIStore)
    declare protected readonly uiStore: UIStore;
    componentDidMount() {
    }

    onMigrate = async () => {
        const { t } = this.props;
        const { state } = this.state;
        try {
            this.setState({ failed: false });

            const pool: OtherTableRow = this.modalStore.tempStorage;
            const lp = this.walletStore.erc20Contract(pool.jsonPool.lp);
            const adapter = this.walletStore.vampireAdapterContract(pool.jsonPool.adapter);
            const master = this.walletStore.masterContract();
            const migrateContract = this.walletStore.getMigrateContract(pool.jsonPool);
            const amount = await adapter.lockedAmount(this.walletStore.account, pool.jsonPool.victimPID)

            if (state < 2) {
                this.setState({ loading: true, btnClass: 'loading', btnText: t('btn::pending'), state: 1 })
                // const userInfo = await migrateContract.userInfo(pool.jsonPool.victimPID, this.walletStore.account);
                const withdrawInputs = migrateContract.interface.getFunction('withdraw').inputs.length;
                if (withdrawInputs === 1) {
                    await this.walletStore.sendTransactionUnstake(migrateContract, 'withdraw', amount);
                } else if (withdrawInputs === 2) {
                    await this.walletStore.sendTransactionUnstake(migrateContract, 'withdraw', pool.jsonPool.victimPID, amount);
                } else {
                    await this.walletStore.sendTransactionUnstake(migrateContract, 'withdraw', pool.jsonPool.victimPID, amount, this.walletStore.account);
                }
                this.setState({ state: 2, ready:2 })
            }
            if (state < 3) {
                if (toBNJS(await lp.allowance(this.walletStore.account, master.address)).lt(toBNJS(amount))) {
                    await this.walletStore.sendTransaction(lp, 'approve', master.address, amount);
                }
                this.setState({ state: 3, ready:3 })
            }
            if (state < 4) {
                this.setState({ loading:true })
                await this.walletStore.sendTransaction(master, 'deposit(uint256,uint256)', pool.jsonPool.pid, amount);
                this.setState({ loading:true })

                // this.setState({ loading: false, btnClass: 'loading', btnText: t('btn::pending'), state: 1 })
            }

            this.setState({ btnClass: 'success', btnText: t('btn::done'),loading: false, state: 4, ready:0 });
            this.walletStore.requestRefresh();
        }
         catch (e) {

            console.error(e);
            this.setState({failed: true,  loading: false, btnClass: '', btnText: t('btn::retry')});
            setTimeout(() => this.setState({ btnClass: '', btnText: t('btn::retry'), failed: false,  loading: false}), 2000);
        }
    }

    render() {
        const { t } = this.props;
        const { loading, btnText, btnClass, state, failed } = this.state;
        const pool: OtherTableRow = this.modalStore.tempStorage;

        return (
            <Modal modalKey={Modals.Migrate} onShow={() => this.setState(initialState)}>
                <div className={classNames('connect', { light: !this.uiStore.darkMode })}>

                    <div className="migrate-body">
                    <div  className={classNames('head', 'migrate-header', { light: !this.uiStore.darkMode })}>
                            <div className="migrate-img">
                            <img src={ICONS[pool?.jsonPool?.icon1] || this.uiStore.missingIcon} alt="" />
                            {pool?.jsonPool?.token2 && <img src={ICONS[pool.jsonPool.icon2] || this.uiStore.missingIcon} alt="" />}
                            </div>

                            <span>{pool?.jsonPool?.token1}{pool?.jsonPool?.token2 && `-${pool.jsonPool.token2}`}</span>

                        <div className="flex-grow" />
                        <img className="migrate-close-m" src={require('../images/close.svg')} alt="" onClick={() => this.modalStore.hideModals()} />
                    </div>

                    <p className="migrate-text-m">
                            <Trans i18nKey='modals::migrate::migrate'>Migrate from {{ from: pool?.jsonPool?.target.toUpperCase() }}</Trans>
                        </p>
                        <div className="migrate-head">
                            <div className={classNames('migrate-head-wrap', { light: !this.uiStore.darkMode })}>
                                <div className='migrate-col'>
                                    <div className="migrate-row">
                                        <span className="migrate-info">{t('modals::migrate::staked')}</span>
                                        {/* <div className="migrate-col-row">
                                            <span className={classNames('migrate-count', { light: !this.uiStore.darkMode })}>{pool?.amount?.toFixed(2)} </span>
                                            <span className="migrate-count-dollar"> ${pool?.usdAmount?.toFixed(2)}</span>
                                        </div> */}
                                    </div>
                                    <div className="migrate-row">
                                        <span className="migrate-info">{t('modals::migrate::oldAPY')}</span>
                                        {/* <span className={classNames('migrate-count', { light: !this.uiStore.darkMode })}>{toBNJS(pool?.pool?.victimApy + pool?.pool?.lpFeesApy + pool?.pool?.extraApy).toFixed(2)}%</span> */}
                                    </div>
                                    <div className="migrate-content">
                                        <span className="migrate-content-text">{t('modals::migrate::newAPY')}</span>
                                        {/* <span className="migrate-content-count">{toBNJS(pool?.pool?.apy + pool?.pool?.lpFeesApy).toFixed(2)}%</span> */}
                                    </div>
                                    {/* <div className="migrate-head-post-text">

                                        And additional retrospective governance tokens yield
                                    </div> */}
                                </div>
                                <div className='migrate-col'>
                                    <div className="migrate-row">
                                        {/* <span className="migrate-info">{t('modals::migrate::staked')}</span> */}
                                        <div className="migrate-col-row">
                                            <span className={classNames('migrate-count', { light: !this.uiStore.darkMode })}>{pool?.amount?.toFixed(2)}</span>
                                            <span className="migrate-count-dollar">	&nbsp;${pool?.usdAmount?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="migrate-row">
                                        {/* <span className="migrate-info">{t('modals::migrate::oldAPY')}</span> */}
                                        <span className={classNames('migrate-count', { light: !this.uiStore.darkMode })}>{toBNJS(pool?.pool?.victimApy + pool?.pool?.lpFeesApy + pool?.pool?.extraApy).toFixed(2)}%</span>
                                    </div>
                                    <div className="migrate-content">
                                        {/* <span className="migrate-content-text">{t('modals::migrate::newAPY')}</span> */}
                                        <span className="migrate-content-count">{toBNJS(pool?.pool?.apy + pool?.pool?.lpFeesApy).toFixed(2)}%</span>
                                        <div className="migrate-head-post-text">
                                        And additional retrospective governance tokens yield
                                    </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    <span className="migrate-process-text">{t('modals::migrate::migrationProcess')}</span>
                        <div className="process">
                            <ProcessItem state={state} num={1} theme={this.uiStore.darkMode} label={t('modals::migrate::unstakeLP')} labelClass='process__name_unstake' failed={failed} ready={this.state.ready===1} loading={loading}/>
                            <img className={classNames('migr-devider', { light: !this.uiStore.darkMode })} src={require('../images/migrateArrow.svg')}></img>
                            {/* <span className={classNames('migr-devider', { light: !this.uiStore.darkMode })} style={{left: '93px'}}/> */}
                            <ProcessItem state={state} num={2} theme={this.uiStore.darkMode} label={t('modals::migrate::approveLP')} labelClass='process__name_approve' failed={failed} ready={this.state.ready===2} loading={loading}/>
                            <img className={classNames('migr-devider', { light: !this.uiStore.darkMode })} src={require('../images/migrateArrow.svg')}></img>
                            {/* <span className={classNames('migr-devider', { light: !this.uiStore.darkMode })}  style={{left: '237px'}}/> */}
                            <ProcessItem state={state} num={3} theme={this.uiStore.darkMode} label={t('modals::migrate::stakeLP')} labelClass='process__name_stake' failed={failed} last ready={this.state.ready===3} loading={loading}/>
                        </div>
                    </div>
                    <div className="migrate-footer migrate-button" style={{ position: 'relative', zIndex: 10 }}>
                        <button disabled={loading} className={classNames('new-btn', btnClass, {light: !this.uiStore.darkMode})} onClick={()=> state<4?this.onMigrate():this.modalStore.hideModals()}>
                            {btnText || t('modals::migrate::migrateBtn')}
                        </button>
                    </div>
                </div>
            </Modal>
        )
    }
}

export const MigrateModal = withTranslation()(MigrateModalComponent)
