import React from 'react';
import { RouteProps } from "react-router";
import { Redirect, Route } from "react-router-dom";
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { WalletStore } from "../stores";

interface IProtectedRouteProps extends RouteProps {
}

interface IProtectedRouteState {
}

@observer
export class ProtectedRoute extends React.Component<IProtectedRouteProps, IProtectedRouteState> {
    @resolve(WalletStore)
    declare protected readonly walletStore: WalletStore;

    render() {
        const { component: Component, render, ...rest } = this.props;
        return (
            <Route
                {...rest}
                render={props => {
                    if (!this.walletStore.connected) {
                        this.walletStore.connect();
                        return <Redirect to='/' />;
                    }
                    return Component ? <Component {...props} /> : render(props);
                }}
            />
        )
    }
}