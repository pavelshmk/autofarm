import React from 'react';
import { withTranslation, WithTranslation } from "react-i18next";
import _ from "lodash";
import classNames from "classnames";
import ClickAwayListener from "react-click-away-listener";
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { UIStore, WalletStore } from "../../stores";
import { NETWORKS } from "../../utils/const";

interface ITokenSearchProps extends WithTranslation {
    onChange: (value: string) => any;
    value?: string;
}

interface ITokenSearchState {
    editing: boolean;
}

@observer
class TokenSearchComponent extends React.Component<ITokenSearchProps, ITokenSearchState> {
    @resolve(WalletStore)
    declare protected readonly walletStore: WalletStore;
    @resolve(UIStore)
    declare protected readonly UIStore: UIStore;
    state: ITokenSearchState = {
        editing: false,
    }

    render() {
        const { t, onChange, value } = this.props;
        const { editing } = this.state;

        const pools = NETWORKS[this.walletStore.network].pools;
        const tokens = Array.from(new Set(_.concat(pools.map(pool => pool.token1), pools.map(pool => pool.token2))))

        const regex = new RegExp(`.*${value}.*`, 'i');
        const filteredTokens = tokens.filter(token => regex.test(token) && token.length)

        return (
            <ClickAwayListener onClickAway={() => editing && this.setState({ editing: false })} >
                <div className={classNames("searchbox", { active: editing, 'has-value': !!value, light: !this.UIStore.darkMode})}
                // style={this.UIStore.darkMode&&}
                style={{minWidth:'150px'}}
                >
                    <input
                        type="text"
                        placeholder={t('main::searchPlaceholder')}
                        value={value || ''}
                        style={{maxWidth:'100%'}}
                        onChange={e => onChange(e.target.value)}
                        onFocus={() => this.setState({ editing: true })}
                    />
                    <div className="clear" onClick={() => onChange(undefined)}/>
                    <ul className={classNames("search-dropdown", { light: !this.UIStore.darkMode})}>
                        {filteredTokens.map(token => (
                            <li key={token} onClick={() => this.setState({ editing: false }, () => onChange(token))}>
                                <div className="title">
                                    {token}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </ClickAwayListener>
        )
    }
}

const TokenSearch = withTranslation()(TokenSearchComponent);
export default TokenSearch;
