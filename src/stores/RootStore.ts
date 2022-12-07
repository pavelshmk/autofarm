import * as stores from './';
import { createBrowserHistory, History } from "history";
import { syncHistoryWithStore } from "mobx-react-router";
import { wrapHistory } from "oaf-react-router";
import { Container } from 'inversify';

export class RootStore {
    public historyStore: History;
    public routerStore: stores.RouterStore;
    public modalStore: stores.ModalStore;
    public walletStore: stores.WalletStore;
    public UIStore: stores.UIStore;
    public container: Container;

    public constructor() {
        const browserHistory = createBrowserHistory();
        wrapHistory(browserHistory, {
            smoothScroll: true,
            primaryFocusTarget: 'body',
        });

        this.routerStore = new stores.RouterStore();
        this.historyStore = syncHistoryWithStore(browserHistory, this.routerStore);
        this.modalStore = new stores.ModalStore(this);
        this.walletStore = new stores.WalletStore(this);
        this.UIStore = new stores.UIStore(this);
        this.container = new Container();
        this.container.bind(stores.RouterStore).toConstantValue(this.routerStore);
        this.container.bind(stores.HistoryStore).toConstantValue(this.historyStore);
        this.container.bind(stores.ModalStore).toConstantValue(this.modalStore);
        this.container.bind(stores.WalletStore).toConstantValue(this.walletStore);
        this.container.bind(stores.UIStore).toConstantValue(this.UIStore);
    }
}
