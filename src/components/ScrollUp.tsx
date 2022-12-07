import React, { useEffect, useState } from 'react';
import { useScroll, useWindowSize } from "react-use";
import classNames from "classnames";

interface IScrollUpProps {
}

const ScrollUp = ({}: IScrollUpProps) => {
    const [ y, setY ] = useState(0);
    const { width } = useWindowSize();

    useEffect(() => {
        const eventHandler = e => {
            setY((e.target as HTMLDocument).scrollingElement.scrollTop);
        }
        window.addEventListener('scroll', eventHandler);

        return () => window.removeEventListener('scroll', eventHandler);
    }, []);


    return (
        <a
            className={classNames('scroll-top', { visible: y > 200 })}
            onClick={() => document.querySelector('html').scroll({ top: 0, behavior: "smooth" })}
            style={width > 1360 ? { left: width / 2 + 600 } : { right: 30 }}
        />
    )
};

export default ScrollUp;
