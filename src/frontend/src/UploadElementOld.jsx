import React from 'react';

import ProgressBar from './ProgressBar';
import Button from './UI/Button';
import DetectClickOutside from './DetectClickOutside';

import {ReactComponent as AddSvg} from './svg/add.svg';
import {ReactComponent as SearchSvg} from './svg/search.svg';

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
            suggestions: [],
            searchSuggestions: [],
            suggested: null,
            suggestedIdx: 0,
            suggestedFromSearch: false,
            suggestedExists: null,

            serverObject: null,


            showSuggestions: false,
            uploadId: null,
            offset: 0,
            lastChunkNrSent: 0,
            uploading: false,
            failed: false,
            uploadSpeed: 20,
            chunkSize: 1024*1024,
            maxChunkSizeCoefficient: 20
        }

        this.handleSuggestions = this.handleSuggestions.bind(this);
        this.handleSearchSuggestions = this.handleSearchSuggestions.bind(this);
    }

    componentDidMount(){
        var searchterm = this.props.file.name;
        if(searchterm.includes('.')){
            searchterm = searchterm.split('.', 1)[0];
        }
        if(searchterm.includes('(HD)')){
            searchterm = searchterm.replace('(HD)', '');
        }

        searchterm = searchterm.trim();
        this.searchIdentification(searchterm, this.handleSuggestions);
    }


    prepareInit(){
        if(!this.state.suggested){
            return;
        }

        var query = '?';
        query += 'type=init';
        query += '&id=' + this.state.suggested.id;
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

    resizeImgUrl(x, y, url){

        if(url.search(/_UX[0-9]{2}/) > 0){
            var newSize = '_UX' + x.toString();
            url = url.replace(/_UX[0-9]{2}/, newSize);


        } else if(url.search(/_UY[0-9]{2}/) > 0){
            var newSize = '_UY' + y.toString();
            url = url.replace(/_UY[0-9]{2}/, newSize);

        }

        if(url.search(/[0-9]{2},[0-9]{2}_AL/)){

            var newSize = x.toString() + ',' + y.toString() + '_AL';
            url = url.replace(/[0-9]{2},[0-9]{2}_AL/, newSize);
        }

        return url;
    }


    idExists(){
        if(!this.state.suggested){
            return;
        }
        const id = this.state.suggested.id;

        fetch('/library/exists/?id=' + id)
        .then(res => {
            if(res.ok){
                return res.json();
                this.setState({suggestedExists: false});
            } else{
                this.setState({suggestedExists: true});
            }
        })
        .then(data => {
            if(data['exists']){
                this.setState({serverObject: {}});
            } else{
                this.setState({suggestedExists: false});
            }
        })

        .then(res => {
            if(res.ok){
                return res.json();
            } else{

                throw new Error('Failed to search metadata');
            }
        })
        .then(data => {
            console.log(data);
        })

        .catch((err) => {
            console.log(err);
        });
    }

    selectSuggestion(idx){

        var toggle = false;
        var suggested = null;
        if(this.state.searchSuggestions.length > 0){
            toggle = true;
            suggested = this.state.searchSuggestions[idx];

        } else if(this.state.suggestions.length > 0){
            suggested = this.state.suggestions[idx];
        }

        this.setState({
            suggestedFromSearch: toggle,
            suggested: suggested,
            suggestedIdx: idx,
            showSuggestions: false
        },
        this.idExists);
    }

    handleSuggestions(s){
        if(!this.state.suggested && s.length > 0){
            this.setState({suggested: s[0], suggestions: s}, this.idExists);

        } else{
            this.setState({suggestions: s});
        }
    }

    handleSearchSuggestions(s){

        this.setState({searchSuggestions: s});
    }

    searchIdentification(searchterm, c){

        // Search with filename
        // Remove file extention

        var query = '?search=';
        query += searchterm;



        fetch('/api/metadata/movie/' + query)
        .then(res => {
            if(res.ok){
                return res.json();
            } else{

                throw new Error('Failed to search metadata');
            }
        })
        .then(data => {
            c(data);
        })
    }

    handleSearch(term){
        this.searchIdentification(term, this.handleSearchSuggestions);
    }


    handleUpload(){

        var query = null;

        // Send init request
        if(!this.state.uploadId){

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

            fetch(this.props.target + '/upload/' + query, {method: 'POST', body: chunk})
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

            fetch(this.props.target + '/upload' + query)
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

    updateSuggestion(){
        this.setState({showSuggestions: true});
    }

    renderUploadButton(){

        if(!this.props.file){
            return;
        }

        if(this.state.offset >= this.props.file.size){
            return;
        }


        var tag = '';
        var newState = {};

        if(this.state.uploading){
            tag = 'Pause';
            newState = {uploading: false}
        } else if(!this.state.uploading && this.state.offset > 0){
            tag = 'Continue';
            newState = {uploading: true};

        } else{
            tag = 'Upload';
            newState = {uploading: true}
        }

        return (

        <Button
            onClick={() => {
                this.setState(newState, this.handleUpload);
            }}
            text={tag}
            type={'button'}
        />
        )
    }

    // Show all suggestions but the first.
    // The first item is viewed as the primary suggestion
    renderSuggestions(){

        if(!this.state.showSuggestions){
            return null;
        }
        var suggestions = [];

        if(this.state.searchSuggestions.length > 0){
            suggestions = this.state.searchSuggestions;
        } else if(this.state.suggestions.length > 0){
            suggestions = this.state.suggestions.slice();
        }

        var id_suggestions = [];
        if (suggestions.length > 0){
            for (var i = 0; i < suggestions.length; i++){
                if((i === this.state.suggestedIdx) && !this.state.suggestedFromSearch){
                    if(this.state.searchSuggestions.length < 1){
                        continue;
                    }
                }
                const j = i;
                var t = (
                    <div key={j} className={'shade-on-hover-light'}
                        style={{
                            cursor: 'pointer',
                            paddingTop: '10px'
                        }}
                        onClick={() => {
                        this.selectSuggestion(j);
                    }
                    }>
                        <div  style={{position: 'relative', overflow: 'auto'}}>

                            <img src={suggestions[i].poster_url} style={{float: 'left', marginLeft: '10px'}}/>

                            <div style={{width: '100%', marginLeft: '10px'}}>
                                <div>{suggestions[i].title}</div>
                                <div>({suggestions[i].year})</div>
                            </div>
                        </div>
                        <div
                        className={'separator-line'}
                        style={{marginTop: '10px'}}
                        ></div>
                    </div>
                );
                id_suggestions.push(t);
            }
        }

        return (
            <div style=
                {{
                width: 'calc(100% - 20px)'
            }}>
                <div style={{
                    backgroundColor: 'rgb(255, 120, 0)',
                    padding: '10px',
                    marginTop: '10px',
                    marginBottom: '10px',
                    borderRadius: '10px',
                    position: 'relative'
                }}>
                <div style={{
                    position: 'absolute',
                    left: '0',
                    height: '34px',
                    width: '34px',
                    marginLeft: '10px',
                }}>
                    <SearchSvg

                    />
                </div>
                    <input autoFocus
                    style={{
                        width: '85%',
                        height: '30px',
                        display: 'block',
                        margin: '0px auto',
                        fontSize: '20px',
                        padding: '0',
                        paddingLeft: '10px'
                    }}
                    onChange={(event) => {
                        this.handleSearch(event.target.value);
                    }}
                    >
                    </input>

                </div>
                {id_suggestions}
            </div>
        )
    }

    renderSelected(){

        if(!this.props.file){
            return;
        }

        var changeOverlayButton = null;
        if(!this.state.showSuggestions && this.state.offset === 0){
            changeOverlayButton = (

                <div
                    className={'overlay'}
                    style={{
                        cursor: 'pointer',
                        color: 'rgba(0,0,0,0.0)',
                        position: 'absolute',
                        top: '0',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        height: '100%',
                        width: '100%'
                    }}
                    onClick={this.updateSuggestion.bind(this)}
                >
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}>
                        Change
                    </div>
                </div>

            );

        }

        var suggestion = this.state.suggested;
        var suggestionDiv = null;

        if(suggestion){

            var url = this.resizeImgUrl(64, 88, suggestion.poster_url);

            suggestionDiv = (
                <div style={{position: 'relative', backgroundColor: 'white', padding: '10px'}}>

                    <div style={{overflow: 'auto', position: 'relative', display: 'block'}}>
                        <img
                            src={url}
                            style={{float: 'left', height: '88px'}}
                        />
                        <div style={{width: 'calc(100% - 250px)', minWidth: '100px', float: 'left', marginLeft: '10px'}}>
                            <div style={{
                                fontSize: '1.2em',
                                marginBottom: '10px'
                            }}>{suggestion.title}</div>
                            <div style={{fontWeight: 'bold'}}>({suggestion.year})</div>
                        </div>

                    </div>
                    {changeOverlayButton}
                </div>

            )
        }

        var uploadButton = null;
        var message = null;
        if((this.state.suggestedExists === false) && this.state.suggested){
            uploadButton = (
                <div style={{float: 'right', marginRight: '10px'}}>
                {this.renderUploadButton()}
                </div>
            );
        }
        if(this.state.suggestedExists){
            message = (
                <div style={{float: 'right', marginRight: '10px', color: 'red'}}>
                A movie with that ID exists on the server
                </div>
            );
        } else if(this.state.offset >= this.props.file.size){
            message = (
                <div style={{float: 'right', marginRight: '10px'}}>
                    Upload complete
                </div>
            );
        } else if(this.state.failed){
            message = (
                <div style={{float: 'right', marginRight: '10px', color: 'red'}}>
                    Upload failed
                </div>
            );
        }
        else if(!this.state.suggested){
            message = (
                <div style={{float: 'right', marginRight: '10px'}}>
                    Loading..
                </div>
            );
        } else{
            message = <div></div>
        }


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



    renderProgressBar(){

        if(!this.state.uploading && this.state.offset === 0){
            return;
        }

        if(this.state.failed || (this.state.offset >= this.props.file.size)){
            return <div></div>
        }

        // if(this.state.failed){
        //     return <div>Upload failed</div>
        // }
        //
        // if(this.state.offset >= this.props.file.size){
        //     return <div>Finished uploading</div>
        // }


        var progress = Math.round((this.state.offset/ this.props.file.size) * 100);

        return (
            <div style={{padding: '10px', paddingTop: '0', position: 'relative', height: '100%'}}>
                <div style={{
                    position: 'absolute',
                    top: '-100%',
                    right: '0'
                }}>
                {progress}% (
                    {Number(this.state.offset/(1073741824)).toFixed(1)} of {Number(this.props.file.size/(1073741824)).toFixed(1)} GB)
                </div>
                <div style={{width: '100%'}}><ProgressBar progress={progress}/></div>
            </div>
        )
    }

    render(){

        return (
            <div className={'upload-element'}>

                {this.renderSelected()}

                <DetectClickOutside
                    content={(
                        <div style={{}}>
                        {this.renderSuggestions()}
                        {this.renderProgressBar()}
                        </div>
                    )}
                    onClickOutside={() => {
                        this.setState({
                            showSuggestions: false,
                            searchSuggestions: []
                        });
                    }}
                />

            </div>
        );
    }

}
