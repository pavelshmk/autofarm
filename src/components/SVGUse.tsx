import React from 'react';

interface ISVGUseProps {
    href: string;
}

interface ISVGUseState {
}

export class SVGUse extends React.Component<ISVGUseProps, ISVGUseState> {
    render() {
        const { href } = this.props;
        const useTag = `<use xlink:href="${href}" />`
        return (
            <svg dangerouslySetInnerHTML={{ __html: useTag }} />
        )
    }
}