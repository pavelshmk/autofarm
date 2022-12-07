import React from 'react';
import ClickAwayListener from "react-click-away-listener";
import classNames from "classnames";
import _ from "lodash";
import i18next from "i18next";
import { withTranslation, WithTranslation } from "react-i18next";
import { UIStore } from '../stores';
import { resolve } from 'inversify-react';

interface ILanguageSwitcherProps extends WithTranslation {
}

interface ILanguageSwitcherState {
    open: boolean;
}

const languages = {
    en: 'English',
    ru: 'Русский',
    cn: '中文',
}

class LanguageSwitcherComponent extends React.Component<ILanguageSwitcherProps, ILanguageSwitcherState> {
    state: ILanguageSwitcherState = {
        open: false,
    }
    @resolve(UIStore)
    declare protected readonly UIStore: UIStore;
    render() {
        const { open } = this.state;

        return (
            <div className="lang-select">
                <div className={classNames('select', 'unlogged', { open })}>
                    <div className={classNames('selected',
                     {light: !this.UIStore.darkMode})} onTouchStart={(e) =>e.preventDefault()} onTouchEnd={(e) =>{e.preventDefault(); this.setState({ open: !open })}} onClick={() => this.setState({ open: !open })} 
                     style={{backgroundColor: this.state.open&&!this.UIStore.darkMode?'#E9E9F2':this.state.open&&this.UIStore.darkMode?'#31314D':''}}
                     >
                        <div className="lang-select-title">{languages[i18next.language].slice(0,2).toUpperCase()}</div>
                        <div className="flex-grow"/>
                    </div>
                    <ClickAwayListener onClickAway={() => open && this.setState({ open: false })}>
                        <ul className={classNames("dropdown", { light: !this.UIStore.darkMode, lang:true})}>
                            {/* <li className="dropdown-lang">&nbsp;</li> */}
                            {_.map(languages, (value, key) => (
                                <li className={classNames("dropdown-lang", { light: this.UIStore.darkMode, lang:true})} key={key} onClick={() => { i18next.changeLanguage(key); this.setState({ open: false }) }}>{value}</li>
                            ))}
                        </ul>
                    </ClickAwayListener>
                </div>
            </div>
        )
    }
}

const LanguageSwitcher = withTranslation()(LanguageSwitcherComponent);
export default LanguageSwitcher;