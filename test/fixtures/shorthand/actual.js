import {__} from 'react-intl';
import React from 'react';

export default class Foo extends React.Component {
    render() {
        return (
            <div>
                <h1>{__('Hello World!')}</h1>
                <p>{__('Another message')}</p>
            </div>
        );
    }
}
