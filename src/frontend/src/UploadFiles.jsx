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

        this.handleUpload = this.handleUpload.bind(this);
        this.updateSelected = this.updateSelected.bind(this);
    }


    handleExists(status, name){

        console.log(status, name);

        // var tempSelected = this.state.selectedFiles;
        // for (var i = 0; i < files.length; i++){
        //     for (var j = 0; j < tempSelected.length; j++){
        //         if (files[i].name === tempSelected[j].file.name){
        //
        //             tempSelected[j].file.exists = files[i].exists;
        //         }
        //     }
        // }
        //
        // this.setState({selectedFiles: tempSelected});
    }

    updateSelected(f){
        console.log('updating');
        console.log(f);

        var newSelected = this.state.selectedFiles;
        newSelected.push(f);
        this.setState({selectedFiles: newSelected});


    }

    // Check if the file is already uploaded to the server
    getFileInfo(f, callback){
        console.log('Get file info of ' + f.name);

        // for(var i = 0; i <s.length; i++){
        var query = '?';
        query += 'size=' + String(f.size);
        query += '&name=' + f.name;
        query += '&lastModified=' + f.lastModified;

        fetch('/library/info/file' + query)
        .then(res => {
            if(res.ok){
                return res.json();
            } else{
                throw new Error('File info request not accepted');
            }
        })
        .then(data => {
            // f.status = data;

            // var tempSelected = this.state.selectedFiles;
            // tempSelected.push(f);
            // this.setState({selectedFiles: tempSelected});
            console.log('Got file info');

            callback(data);

        })
        .catch((err) => {
            console.log(err);
        });
        // }

    }



    handleFileSelection = (f) => {

        // Add files that is not already selected
        loop:
            for(var i = 0; i < f.target.files.length; i++){
                for(var j = 0; j < this.state.selectedFiles.length; j++){
                    if(f.target.files[i].name === this.state.selectedFiles[j].name){
                        console.log('selected already');
                        continue loop;
                    }
                }

                // var newFile = {};
                // newFile.file = f.target.files[i];
                // newFile.status = null;
                // newFile.uploading = false;
                // newFile.uploadId = null;

                // newSelectedFiles.push(newFile);
                this.getFileInfo(f.target.files[i], this.updateSelected);
            }





        // console.log('new selected');
        // console.log(newSelectedFiles);
        // this.getFileInfo(newSelectedFiles);
        // this.setState({selectedFiles: newSelectedFiles});
    };

    prepareInit(j){
        // if(!this.state.suggested){
        //     return;
        // }

        var query = '?';
        query += 'type=init';
        query += '&id=' + this.state.selectedFiles[j].suggested.id;
        query += '&size=' + String(this.state.selectedFiles[j].file.size);
        query += '&name=' + this.state.selectedFiles[j].file.name;
        query += '&lastModified=' + this.state.selectedFiles[j].file.lastModified;
        return query;
    }

    prepareChunk(j){
        var query = '?';
        query += 'type=chunk';
        query += '&offset=' + String(this.state.selectedFiles[j].status.offset);
        query += '&upload_id=' + this.state.selectedFiles[j].upload_id;
        return query;
    }

    upload(j){
        console.log('upload fuction ', j);

        if(!this.state.selectedFiles[j].uploading){
            return;
        }

        var query = null;

        // Send init request
        if(!this.state.selectedFiles[j].uploadId){

            query = this.prepareInit();
            console.log("sending init packet");
            console.log(query);
            fetch(this.props.target + '/upload' + query)
            .then(res => {

                if(res.ok){
                    return res.json()
                } else{
                    this.setState({failed: true});
                    throw new Error('Init not accepted');
                }
            })
            .then(data => {
                var sfs = this.state.selectedFiles;
                sfs[j].uploadId = data.uploadId;
                this.setState({selectedFiles: sfs});
                this.upload(j);
            })
            .catch((err) => {
                console.log(err);
            });
        }
        // Send chunk of file to server
        else{



            var offset = 0;
            if('offset' in this.state.selectedFiles[j].status){
                if(this.state.selectedFiles[j].status.offset >= this.props.file.size){
                    return;
                } else{
                    offset = this.state.selectedFiles[j].status.offset;
                }
            }


            // Calculate chunk size dynamically based on measured upload speed
            // var speed = (20/ this.state.uploadSpeed);
            // if(speed > this.state.maxChunkSizeCoefficient){
            //     speed = this.state.maxChunkSizeCoefficient;
            // }
            // var chunkSize = this.state.chunkSize * speed;

            var chunkSize = 1024*1024*20;


            query = this.prepareChunk();
            // var chunk = this.props.file.slice(this.state.offset, this.state.offset + chunkSize);
            var chunk = this.props.file.slice(this.state.offset, this.state.offset + chunkSize);

            var t1 = new Date().getTime();

            fetch(this.props.target + '/upload/' + query, {method: 'POST', body: chunk})
            .then(res => {
                if(res.ok){
                    return res.json();
                } else{
                    throw new Error('Upload failed');
                }
            })
            .then(data => {

                // var t2 = new Date().getTime();
                // this.setState({uploadSpeed: t2 - t1});
                console.log(data);
                var sfs = this.state.selectedFiles;
                sfs[j].status.offset = data.offset;

                // Recursively send next chunk or end transmission
                this.setState({selectedFiles: sfs}, this.handleUpload(j));

                // this.handleUpload(j);
            })
            .catch((err) => {
                console.log(err);
            });

            // Update parser/ chunk information
            this.setState({offset: this.state.offset + chunkSize});
            // this.setState({lastChunkNrSent: this.state.lastChunkNrSent + 1});

        }
        // Last chunk sent, send end message
        // else{
        //     query = this.prepareEnd();
        //     console.log('Sending end packet');
        //
        //     fetch(this.props.target + '/upload' + query)
        //     .then(res => {
        //         if(res.ok){
        //             return res.json()
        //         } else{
        //             this.setState({failed: true});
        //             throw new Error('Upload failed');
        //         }
        //     })
        //     .then(data => {
        //
        //         console.log('Uploaded');
        //
        //         // Clear all data
        //         // this.setState({uploadId: null});
        //         // this.setState({offset: 0});
        //         // this.setState({lastChunkNrSent: 0});
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //     });
    }

    handleUpload(j){


        var sfs = this.state.selectedFiles;

        if(!sfs[j].uploading){
            sfs[j].uploading = true;
        } else{
            sfs[j].uploading = false;
        }

        this.setState({selectedFiles: sfs}, this.upload(j));
        // this.setState({
        //   data: this.state.data.map(el => (el.id === id ? Object.assign({}, el, { text }) : el))
        // });
        //
        // this.setState({
        //     selectedFiles: this.state.selectedFiles.map(el => (el.id === id))
        // })


    }

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

        var uploadingFiles = [];
        var uploadedFiles = [];
        for(var i = 0; i < this.state.selectedFiles.length; i++){
            const j = i;
            console.log(this.state.selectedFiles)

            var size = Number(this.state.selectedFiles[i]['size']);
            var size_uploaded = Number(this.state.selectedFiles[i]['size_uploaded']);
            console.log(size, size_uploaded);

            if(size_uploaded >= size){
                uploadedFiles.push(
                    <div key={j}>
                        {this.state.selectedFiles[i].name}

                    </div>
                )
            } else{
                uploadingFiles.push(
                    <div key={j}>
                    {this.state.selectedFiles[i].name}
                    {"\tUploaded: "}
                    {this.state.selectedFiles[i].size_uploaded}

                    </div>
                );
            }

        }

        return (

            <div>
            Uploading:
            <br/>
            {uploadingFiles}
            <br/>
            Uploaded:
            <br/>
            {uploadedFiles}
            </div>

        )

        // console.log(this.state.selectedFiles);
        // return null;

        var files = [];
        for(var i = 0; i < this.state.selectedFiles.length; i++){
            // Not yet determined if file exists
            if(this.state.selectedFiles[i].status.exists === null){
                continue;
            }

            // File exists on server
            if(this.state.selectedFiles[i].status.exists){
                continue;
            }

            const j = i;
            console.log(this.state.selectedFiles[i]);


            files.push(<UploadElement
                key={j}
                id={i}
                file={this.state.selectedFiles[i].file}
                status={this.state.selectedFiles[i].status}
                onUpload={this.handleUpload}
                uploading={this.state.selectedFiles[i].uploading}
            />);
        }

        return (<div>{files}</div>);
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
