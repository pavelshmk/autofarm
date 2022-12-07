import React  from 'react';
import {  UIStore } from "../stores";
import { resolve } from "inversify-react";
import { observer } from 'mobx-react';
import classNames from 'classnames';


@observer
class InitialContainer extends React.Component {
    @resolve(UIStore)
        declare protected readonly UIStore: UIStore;
    componentDidMount() {   
        if(localStorage.getItem('theme')==='light') {
            this.UIStore.changeTheme()
        }    
    }
    render() { 
        
    
        return (
                    <div className={classNames("initial-container", { light: !this.UIStore.darkMode })}>
                        <div className="initial-wrapper">
                            {this.props.children}
                        </div>
                    </div>
        );
    }
}

export default  InitialContainer;
