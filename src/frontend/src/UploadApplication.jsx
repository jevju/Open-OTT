import React from 'react';

import UploadFiles from './UploadFiles';
import Upload from './Upload';

export default class UploadApplication extends React.Component{


    render(){

        return (

            <div className={'upload-application'}>
                <Upload/>
            </div>
        )
    }
}
