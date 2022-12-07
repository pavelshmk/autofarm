import React from 'react';
import { ConnectModal } from "./ConnectModal";
import { TokenModal } from "./TokenModal";
import { MigrateModal } from "./MigrateModal";

export class Modals extends React.Component {
    render() {
        return (
            <>
                <ConnectModal />
                <TokenModal />
                <MigrateModal />
            </>
        )
    }
}
