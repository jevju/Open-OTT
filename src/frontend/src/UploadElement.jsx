import React from 'react';

import ProgressBar from './ProgressBar';


// TODO: Init request sent immediately after component load, to check with server wheather the file is accepted or not.
// TODO: Pause/ resume button, cancel/ delete button. Cancel/ delete sends end-request to server, but since size is not correct server will delete it and not add the upload to the library. Or can send a cancel-request type, add another type to server to accept. Send cancel with uploadId
// TODO: Target sent as prop. Target needs to be a requirement.

// TODO!!: Add movapi to select movie imdb-id before uploading
// TODO: Make themed button component, and Progress bar Component

// TODO: Dynamic chunk size, Chunk size adjusted to upload speed. The slower the speed, the smaller the chunk size. Need to measure the upload speed to calculate.

export default class UploadElement extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            uploadId: null,
            offset: 0,
            lastChunkNrSent: 0,
            uploading: false,
            failed: false,
            uploadSpeed: 20,
            chunkSize: 1024*1024,
            maxChunkSizeCoefficient: 20
        }

        this.styles = {
            border: '1px solid red'
        }
    }



    prepareInit(){
        var query = '?';
        query += 'type=init';
        query += '&size=' + String(this.props.file.size);
        query += '&name=' + this.props.file.name;
        query += '&lastModified=' + this.props.file.lastModified;
        return query;
    }

    prepareChunk(){
        var query = '?';
        query += 'type=chunk';
        query += '&offset=' + String(this.state.offset);
        query += '&chunkNr=' + String(this.state.lastChunkNrSent + 1);
        query += '&uploadId=' + this.state.uploadId;
        return query;
    }

    prepareEnd(){
        var query = '?';
        query += 'type=end';
        query += '&uploadId=' + this.state.uploadId;
        return query;
    }


    handleUpload(){

        var query = null;

        // Send init request
        if(!this.state.uploadId){

            query = this.prepareInit();
            console.log("sending init packet")
            fetch(this.props.target + query)
            .then(res => {

                if(res.ok){
                    return res.json()
                } else{
                    this.setState({failed: true});
                    throw new Error('Init not accepted');
                }
            })
            .then(data => {

                this.setState({uploadId: data.uploadId})
                this.handleUpload();
            })
            .catch((err) => {
                console.log(err);
            });
        }
        // Send chunk of file to server
        else if(this.state.offset < this.props.file.size){

            if(!this.state.uploading){
                return;
            }

            // Calculate chunk size dynamically based on measured upload speed
            var speed = (20/ this.state.uploadSpeed);
            if(speed > this.state.maxChunkSizeCoefficient){
                speed = this.state.maxChunkSizeCoefficient;
            }
            var chunkSize = this.state.chunkSize * speed;

            chunkSize = 1024*1024*20;


            query = this.prepareChunk();
            // var chunk = this.props.file.slice(this.state.offset, this.state.offset + chunkSize);
            var chunk = this.props.file.slice(this.state.offset, this.state.offset + chunkSize);

            var t1 = new Date().getTime();

            fetch(this.props.target + query, {method: 'POST', body: chunk})
            .then(res => {
                if(res.ok){
                    return res.json();
                } else{
                    this.setState({failed: true});
                    throw new Error('Upload failed');
                }
            })
            .then(data => {

                var t2 = new Date().getTime();
                this.setState({uploadSpeed: t2 - t1});

                // Recursively send next chunk or end transmission
                this.handleUpload();
            })
            .catch((err) => {
                console.log(err);
            });

            // Update parser/ chunk information
            this.setState({offset: this.state.offset + chunkSize});
            this.setState({lastChunkNrSent: this.state.lastChunkNrSent + 1});

        }
        // Last chunk sent, send end message
        else{
            query = this.prepareEnd();
            console.log('Sending end packet');

            fetch(this.props.target + query)
            .then(res => {
                if(res.ok){
                    return res.json()
                } else{
                    this.setState({failed: true});
                    throw new Error('Upload failed');
                }
            })
            .then(data => {

                console.log('Uploaded');

                // Clear all data
                // this.setState({uploadId: null});
                // this.setState({offset: 0});
                // this.setState({lastChunkNrSent: 0});
            })
            .catch((err) => {
                console.log(err);
            });
        }



    }


    renderUploadButton(){

        if(!this.props.file){
            return;
        }

        if(this.state.offset >= this.props.file.size){
            return;
        }

        if(this.state.uploading){
            return (
                <button onClick={() => {
                    this.setState({uploading: false})
                }
                }>Pause</button>
            )
        } else if(!this.state.uploading && this.state.offset > 0){
            return (
                <button onClick={() => {
                    this.setState({uploading: true}, this.handleUpload)
                }
                }>Continue</button>
            )
        } else{
            return (
                <button onClick={() => {
                    this.setState({uploading: true}, this.handleUpload)
                }
                }>Upload</button>
            )
        }
    }


    renderSelected(){

        if(!this.props.file){
            return;
        }
        console.log(this.props.file);
        return <div>{this.props.file.name}</div>
    }


    renderProgressBar(){

        if(!this.state.uploading && this.state.offset === 0){
            return;
        }

        if(this.state.failed){
            return <div>Upload failed</div>
        }

        if(this.state.offset >= this.props.file.size){
            return <div>Finished uploading</div>
        }

        const style = {
            width: '85%',
            float: 'left',
            marginRight: '10px'
        }

        var progress = Math.round((this.state.offset/ this.props.file.size) * 100);

        return (
            <div>
                <div style={style}><ProgressBar progress={progress}/></div>
                <div>
                    {progress}% (
                    {Number(this.state.offset/(1073741824)).toFixed(1)} of {Number(this.props.file.size/(1073741824)).toFixed(1)} GB)
                </div>
            </div>
        )
    }

    render(){

        return (
            <div style={this.styles}>
                {this.renderSelected()}
                {this.renderUploadButton()}
                {this.renderProgressBar()}

            </div>
        );
    }

}
