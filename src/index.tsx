import "reflect-metadata";
import "babel-polyfill";

import React from 'react';
import ReactDOM from 'react-dom';
import Application from './Application';
import './sass/index.scss';
import 'react-toastify/scss/main.scss'
import 'react-slidedown/lib/slidedown.css';

import './i18n';

ReactDOM.render(
    <Application />,
    document.getElementById('wrapper')
);
