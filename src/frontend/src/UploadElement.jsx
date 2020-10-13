import React from 'react';

import ProgressBar from './ProgressBar';
import Button from './UI/Button';
import DetectClickOutside from './DetectClickOutside';

import {ReactComponent as AddSvg} from './svg/add.svg';
import {ReactComponent as SearchSvg} from './svg/search.svg';



export default class UploadElement extends React.Component {
    constructor(props){
        super(props);
        this.state = {
        }

    }

    componentDidMount(){
        console.log('comp mounted');
    }

    renderUploadButton(){

        // if (! ('offset' in this.props.status)){
        //     return null;
        // }


        var tag = '';

        if(this.props.uploading){
            tag = 'Pause';
        }
        else if(! this.props.status.exists){
            tag = 'Upload';
        } else{


            // if uploaded size > 0 and uploaded size < totalfilesize:
            // show continue button
            tag = 'continue';
        }
        console.log(this.props.status);
        //
        // if(! this.props.uploading){
        //     tag = 'Upload';
        // } else{
        //     tag = 'Pause';
        // }

        // if(this.props.uploading){
        //     tag = 'Pause';
        //     newState = {uploading: false}
        // } else if(!this.state.uploading && this.props.status.offset > 0){
        //     tag = 'Continue';
        //     newState = {uploading: true};
        //
        // } else{
        //     tag = 'Upload';
        //     newState = {uploading: true}
        // }

        // return(
        //     <button onClick={this.props.onUpload.bind(this, this.props.id)}>Upload</button>
        // )

        return (
            <Button
                onClick={this.props.onUpload.bind(this, this.props.id)}
                text={tag}
                type={'button'}
            />
        )
    }

    renderSelected(){
        if(!this.props.file){
            return;
        }

        var uploadButton = null;
        var message = null;
        var suggestionDiv = null;

        uploadButton = (
            <div style={{float: 'right', marginRight: '10px'}}>
                {this.renderUploadButton()}
            </div>
        );


        return (
            <div>
                <div style={{overflow: 'auto', position: 'relative', padding: '10px'}}>
                    <div style={{float: 'left', fontWeight: 'bold', marginLeft: '10px'}}>
                        {this.props.file.name}
                    </div>
                    {uploadButton}
                    {message}
                </div>
                <div
                    className={'separator-line'}
                    style={{
                        border: '1px solid rgba(0,0,0,0.2)',
                        marginLeft: '10px',
                        marginRight: '10px',
                        width: 'calc(100% - 20px)'
                    }}
                ></div>
                {suggestionDiv}

            </div>
        )
    }


    render(){

        console.log('here')


        return (
            <div className={'upload-element'}>

                {this.renderSelected()}

                {this.props.k}
                <button onClick={this.props.onUpload.bind(this, this.props.id)}>Upload</button>
            </div>
        );
    }

}
