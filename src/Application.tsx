import React  from 'react';
import { Router, Switch, Route } from "react-router-dom";
import { RootStore, UIStore } from "./stores";
import { ToastContainer } from "react-toastify";
import { Provider, resolve } from "inversify-react";
import MainPage from "./pages/MainPage";
import { Modals } from "./modals";
import { observer } from 'mobx-react';
import InitialContainer from './components/InitialContainer';

export const rootStore = new RootStore();
const container = rootStore.container

@observer
class Application extends React.Component {
    
    componentDidMount() {
        rootStore.walletStore.tryReconnect();
    }
    render() {
        return (
            <Provider container={container}>
                <Router history={rootStore.historyStore}>
                    <ToastContainer/>
                    <InitialContainer >
                        <div className="wrapper-inner">
                            <Switch>
                                <Route exact path='/' component={MainPage} />
                            </Switch>
                        </div>
                    </InitialContainer>
                    

                    <Modals />
                </Router>
            </Provider>
        );
    }
}

export default Application;
