import React from 'react';

import UploadElement from './UploadElement';
import Button from './UI/Button';

import {ReactComponent as UploadSvg } from './svg/upload.svg';

export default class UploadFiles extends React.Component {
    constructor(props){
        super();

        this.state = {
            selectedFiles: [],

        }
    }


    handleExists(files){
        var tempSelected = this.state.selectedFiles;
        for (var i = 0; i < files.length; i++){
            for (var j = 0; j < tempSelected.length; j++){
                if (files[i].name === tempSelected[j].file.name){

                    tempSelected[j].file.exists = files[i].exists;
                }
            }
        }

        this.setState({selectedFiles: tempSelected});
    }

    // Check if the file is already uploaded to the server
    isFileUploaded(files){

        var body = [];
        for(var i = 0; i < files.length; i++){
            var file = {
                "size": files[i].file.size,
                "name": files[i].file.name,
                "lastModified": files[i].file.lastModified
            }
            body.push(file);
        }

        fetch(this.props.target + '/exists/?files', {method: 'POST', body: JSON.stringify(body)})
        .then(res => {

            if(res.ok){
                return res.json();
            } else{
                this.setState({failed: true});
                throw new Error('Exists request not accepted');
            }
        })
        .then(data => {
            console.log(data)
            this.handleExists(data);
        })
        .catch((err) => {
            console.log(err);
        });

        return false;
    }




    handleFileSelection = (f) => {



        var newSelectedFiles = this.state.selectedFiles;


        // Add files that is not already selected
        loop1:
            for(var i = 0; i < f.target.files.length; i++){
                for(var j = 0; j < newSelectedFiles.length; j++){
                    if(newSelectedFiles[j].file.name === f.target.files[i].name){
                        continue loop1;

                    }
                }

                var newFile = {};
                newFile.file = f.target.files[i];
                newFile.visible = false;

                newSelectedFiles.push(newFile);
            }

        this.isFileUploaded(newSelectedFiles);
        this.setState({selectedFiles: newSelectedFiles});
    };


    renderInputField(){


        return (
            <div style={{width: '200px', margin: '0 auto'}}>
                <Button
                    onClick={this.handleFileSelection.bind(this)}
                    text={<UploadSvg />}
                    type={'input'}
                />
            </div>
        )


        return (
            <div style={{
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                width: '100%'

            }}>
                <div className={'btn'} style={{borderRadius: '8px', textAlign: 'center', width: '50%', height: '40px', display: 'inline-block', position: 'relative'}}>
                    <button
                    style={{
                        border: '2px solid gray',
                        color: 'inherit',
                        borderRadius: '8px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        backgroundColor: 'inherit',
                        width: '100%',
                        height: '100%'
                    }}>Select files</button>
                    <input
                        type='file'
                        accept='*/*'
                        multiple
                        style={{
                            height: '100%',
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            opacity: '0',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                        onChange={(event)=>{
                        this.handleFileSelection(event);
                    }}
                    />
                </div>
            </div>
        )
    }


    renderUploadElements(){

        if(!this.state.selectedFiles){
            return;
        }

        var files = [];
        for(var i = 0; i < this.state.selectedFiles.length; i++){
            const j = i;

            // Not yet determined if file exists
            if(this.state.selectedFiles[i].file.exists == null){
                continue;
            }

            // File exists on server
            if(this.state.selectedFiles[i].file.exists){
                continue;
            }

            files.push(<UploadElement
                key={j}
                file={this.state.selectedFiles[i].file}
                target={this.props.target}
            />);
        }

        return <div>{files}</div>;
    }


    render(){
        return (
            <div>
                <div style={{marginBottom: '40px', marginTop: '40px'}}>
                    {this.renderInputField()}
                </div>
                <div>
                    {this.renderUploadElements()}
                </div>

            </div>
        )
    }


}
