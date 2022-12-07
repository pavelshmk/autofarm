import React from 'react';
import classNames from "classnames";
import { observer } from "mobx-react";
import { useInjection } from "inversify-react";
import { UIStore } from "../stores";

export const ValueLoader = observer(({ loading, children }: { loading?: boolean, children?: React.ReactNode | React.ReactNodeArray }) => {
    const uiStore = useInjection(UIStore);
    return <span className={classNames('value-loader', { loading, dark: uiStore.darkMode })}>{children}</span>
});
