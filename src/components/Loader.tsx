import React from 'react';

interface ILoaderProps {
}

interface ILoaderState {
}

class Loader extends React.Component<ILoaderProps, ILoaderState> {
    render() {
        return (
            <div className='loader-wrapper'>
                <img src={require('../images/loader.png')} className='loader' />
            </div>
        )
    }
}

export default Loader;
