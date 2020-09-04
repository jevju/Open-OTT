import React from 'react';

import UploadFiles from './UploadFiles';

export default class UploadApplication extends React.Component{


    render(){

        return (

            <div className={'upload-application'}>
                <UploadFiles target='/library'/>
            </div>
        )
    }
}
