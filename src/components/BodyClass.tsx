import React from 'react';

interface IBodyClassProps {
    className: string;
}

interface IBodyClassState {
}

export class BodyClass extends React.Component<IBodyClassProps, IBodyClassState> {
    componentDidMount() {
        document.body.classList.add(this.props.className);
    }

    componentWillUnmount() {
        document.body.classList.remove(this.props.className);
    }

    render() {
        return null;
    }
}