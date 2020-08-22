import React from 'react';

import UploadElement from './UploadElement';


export default class UploadFiles extends React.Component {
    constructor(props){
        super();

        this.state = {
            selectedFiles: []
        }
    }

    handleFileSelection = (f) => {

        var newSelectedFiles = this.state.selectedFiles;

        loop1:
            for(var i = 0; i < f.target.files.length; i++){
        loop2:
                for(var j = 0; j < newSelectedFiles.length; j++){
                    if(newSelectedFiles[j].name == f.target.files[i].name){
                        console.log('contains');
                        continue loop1;
                    }
                }
                newSelectedFiles.push(f.target.files[i]);
            }

        this.setState({selectedFiles: newSelectedFiles});
    };


    renderInputField(){
        // if(this.state.selectedFiles){
        //     return;
        // }
        return (
            <input type='file' accept='*/*' multiple onChange={(event)=>{
                this.handleFileSelection(event);
            }}
            />
        )
    }


    renderUploadElements(){

        if(!this.state.selectedFiles){
            return;
        }

        var files = [];
        for(var i = 0; i < this.state.selectedFiles.length; i++){
            const j = i;
            files.push(<UploadElement
                key={j}
                file={this.state.selectedFiles[i]}
                target='/upload/'
            />);
        }

        return <div>{files}</div>;
    }


    render(){
        return (
            <div>
            {this.renderInputField()}
            {this.renderUploadElements()}

            </div>
        )
    }


}
