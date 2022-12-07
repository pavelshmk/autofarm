import React from 'react';

interface IScrollLockProps {
}

interface IScrollLockState {
}

export class ScrollLock extends React.Component<IScrollLockProps, IScrollLockState> {
    componentDidMount() {
        document.body.classList.add('overflow');
    }

    componentWillUnmount() {
        document.body.classList.remove('overflow');
    }

    render() {
        return null;
    }
}