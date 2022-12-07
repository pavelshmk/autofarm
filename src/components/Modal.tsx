import React from 'react';
import { inject, observer } from "mobx-react";
import { Modals, ModalStore, PERSISTENT_MODALS } from "../stores/ModalStore";
import { resolve } from "inversify-react";
import { ScrollLock } from "./ScrollLock";
import classNames from "classnames";
import { reaction } from "mobx";
import ClickAwayListener from "react-click-away-listener";

interface IModalProps {
    modalClassName?: string;
    wrapClassName?: string;
    children: React.ReactNode | React.ReactNodeArray;
    show?: boolean;
    onHide?: () => any;
    onShow?: () => any;
    modalKey?: Modals;
}

interface IModalState {
}

@observer
export class Modal extends React.Component<IModalProps, IModalState> {
    fade: HTMLDivElement;

    @resolve(ModalStore)
    declare private readonly modalStore: ModalStore;

    hide = () => {
        if (PERSISTENT_MODALS.includes(this.props.modalKey))
            return;
        this.props.onHide ? this.props.onHide() : this.modalStore.hideModals();
    }

    componentDidMount() {
        reaction(() => this.props.modalKey && this.modalStore.activeModal, val => val === this.props.modalKey && this.props.onShow && this.props.onShow());
    }

    render() {
        let { modalClassName, wrapClassName, children, show, modalKey } = this.props;

        if (!show && modalKey)
            show = this.modalStore.activeModal === modalKey;

        return (
            <>
                {show && <ScrollLock />}
                <div className={classNames('fade', { active: show })}>
                    <ClickAwayListener onClickAway={() => show && this.hide()}>
                        <div className="popup">
                        {/*<div className={classNames('base-popup', 'mask', { active: show }, wrapClassName)}>*/}
                        {/*    <div className={classNames('base-popup__drop', { active: show }, modalClassName)}>*/}
                                {children}
                                {/*{!PERSISTENT_MODALS.includes(modalKey) && (
                                    <a className='js-close' onClick={() => this.modalStore.hideModals()}>
                                        <img src={require('../images/icons/icon-close.svg')} alt=""/>
                                    </a>
                                )}*/}
                        </div>
                    </ClickAwayListener>
                </div>
            </>
        )
    }
}
