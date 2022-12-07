import { injectable } from "inversify";
import { RootStore } from "./RootStore";
import { action, makeObservable, observable, runInAction } from "mobx";
import { ICONS } from "../utils/const";



@injectable()
export class UIStore {
    @observable darkMode: boolean

    constructor(private readonly rootStore: RootStore) {
        makeObservable(this);
        this.darkMode = true
    }
    @action changeTheme = async () => {
        runInAction(() =>
            this.darkMode = !this.darkMode
        )
        if (!this.darkMode) {
            localStorage.setItem('theme', 'light')
        }
        else if (this.darkMode) {
            localStorage.setItem('theme', 'dark')
        }
    }

    get missingIcon() {
        return this.darkMode ? ICONS.missing_d : ICONS.missing_l;
    }
}
