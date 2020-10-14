import React from 'react';

import SuggestionCell from './SuggestionCell';

export default class Upload extends React.Component {
    constructor(props){
        super();

        this.state = {
            files: [], // List of all files
            initQue: [], // Files waiting to retrieve serverInfo and metadata
            selectedQue: [], // Files ready for metadata confirmation and upload
            waitingQue: [], // Files waiting for upload
            uploadingQue: [], // Files currently uploading
            finishedQue: [], // Files finished uploading
            existQue: [], // Selected files that was already found in the server library
        }

        this.max_simultanous_uploads = 1;
        this.max_file_selections = 2;

        this.onSelect = this.onSelect.bind(this);
        this.onSuggestionChange = this.onSuggestionChange.bind(this);
        this.onUpload = this.onUpload.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    componentDidUpdate(){


        if((this.state.initQue.length > 0) && (this.state.selectedQue.length < this.max_file_selections)){
            const i = this.state.initQue[0];
            var obj = this.state.files[i];

            if(!('server' in obj)){
                this.getFileInfo(i);
            } else if(obj.server.size_uploaded >= obj.server.size){
                this.queAdd('exist', i);
                this.queRemove('init', i);
            } else if(!('suggestions' in obj)){
                var term = obj.name;
                if(term.includes('(')){
                    term = term.split('(', 1)[0];
                }
                if(term.includes('.')){
                    term = term.split('.', 1)[0];
                }

                this.getSuggestions(term, i);

            } else if(this.max_file_selections >= this.state.selectedQue.length){
                this.queAdd('selected', i);
                this.queRemove('init', i);
            }
        }

        // for(var iter = 0; iter < this.state.initQue.length; iter++){
        //     const i = this.state.initQue[iter];
        //
        //     var obj = this.state.files[i];
        //
        //     if(!('server' in obj)){
        //         this.getFileInfo(i);
        //         continue;
        //     }
        //
        //     if(obj.server.size_uploaded >= obj.server.size){
        //         this.queAdd('exist', i);
        //         this.queRemove('init', i);
        //         continue;
        //     }
        //
        //     if(!('suggestions' in obj)){
        //         var term = obj.name;
        //         if(term.includes('(')){
        //             term = term.split('(', 1)[0];
        //         }
        //         if(term.includes('.')){
        //             term = term.split('.', 1)[0];
        //         }
        //
        //         this.getSuggestions(term, i);
        //         continue;
        //     }
        //
        //     if(this.max_file_selections >= this.state.selectedQue.length){
        //         this.queAdd('selected', i);
        //         this.queRemove('init', i);
        //     } else{
        //         break;
        //     }
        //
        // }

        if((this.state.waitingQue.length > 0) && (this.state.uploadingQue.length < this.max_simultanous_uploads)){
            const idx = this.state.waitingQue[0];
            this.queAdd('uploading', idx);
            this.queRemove('waiting', idx);
            var temp = this.state.files;
            temp[idx]['uploading'] = true;
            this.setState({files: temp}, this.upload(idx));
        }
    }

    // Retrieve file info from server
    // Update files list
    getFileInfo(idx){
        var query = '?';
        query += 'size=' + String(this.state.files[idx].size);
        query += '&name=' + this.state.files[idx].name;
        query += '&lastModified=' + this.state.files[idx].lastModified;

        fetch('/library/info/file' + query)
        .then(res => {
            if(res.ok){
                return res.json();
            } else{
                throw new Error('File info request not accepted');
            }
        })
        .then(data => {
            var files = this.state.files;
            files[idx]['server'] = data;
            this.setState({files: files});

        })
        .catch((err) => {
            var files = this.state.files;
            files[idx]['statusMessage'] = 'Unable to access server';
            this.setState({files: files});
        });
    }

    getSuggestions(term, idx){
        var query = '?search=' + term;
        fetch('/metadata/movie/' + query)
        .then(res => {
            if(res.ok){
                return res.json()
            } else{
                throw new Error('Unable to get suggestions');
            }
        })
        .then(data => {
            var temp = this.state.files;
            temp[idx]['suggestions'] = data;
            temp[idx]['suggestedIdx'] = 0;
            this.setState({files: temp});
        })
        .catch((err) => {
            console.log(err);
        });
    }

    prepareInit(idx){
        var query = '?';
        query += 'type=init';
        query += '&id=' + this.state.files[idx].suggestions[this.state.files[idx].suggestedIdx].id;
        query += '&size=' + String(this.state.files[idx].size);
        query += '&name=' + this.state.files[idx].name;
        query += '&lastModified=' + this.state.files[idx].lastModified;
        return query;
    }

    prepareChunk(idx){
        var query = '?';
        query += 'type=chunk';
        query += '&offset=' + String(this.state.files[idx].server.size_uploaded);
        query += '&upload_id=' + this.state.files[idx].server.id;
        return query;
    }

    prepareComplete(idx){
        var query = '?';
        query += 'type=complete';
        query += '&id=' + this.state.files[idx].suggestions[this.state.files[idx].suggestedIdx].id;
        query += '&upload_id=' + this.state.files[idx].server.id;
        return query;
    }

    // Recursive upload file
    upload(idx){

        if(!("uploading" in this.state.files[idx])){
            return;
        }
        if(!this.state.files[idx].uploading){
            return;
        }

        // Send init request
        if(!('initiated' in this.state.files[idx])){
            query = this.prepareInit(idx);
            fetch('/library/upload/' + query)
            .then(res => {
                if(res.ok){
                    return res.json()
                } else{
                    throw new Error('Init not accepted');
                }
            })
            .then(data => {
                var temp = this.state.files;
                this.state.files[idx].initiated = true;
                this.setState({files: temp}, this.upload(idx));
            })
            .catch((err) => {
                console.log(err);
            });
        }
        // Send chunk
        else if(this.state.files[idx].server.size_uploaded < this.state.files[idx].server.size) {
            const offset = this.state.files[idx].server.size_uploaded;

            if(offset >= this.state.files[idx].size){
                return;
            }
            const serverInfo = this.state.files[idx].server;

            const chunkSize = 1024*1024*20;

            var query = this.prepareChunk(idx);

            var chunk = this.state.files[idx].file.slice(offset, offset + chunkSize);

            fetch('/library/upload/' + query, {method: 'POST', body: chunk})
            .then(res =>{
                if(res.ok){
                    return res.json();
                } else{
                    throw new Error('Upload failed');
                }
            })
            .then(data => {
                var temp = this.state.files;
                this.state.files[idx].server.size_uploaded = data['offset'];
                this.setState({files: temp}, this.upload(idx));
            })
            .catch((err) => {
                console.log(err);
            });

        }
        // Upload finished
        else{

            // Send complete request to download external metadata files to server
            // Add to finished que on successful response

            // Processing...

            const query = this.prepareComplete(idx);

            fetch('/library/upload/' + query)
            .then(res => {
                if(res.ok){
                    console.log('upload complete');
                    this.queAdd('finished', idx);
                    this.queRemove('uploading', idx);

                } else{
                    throw new Error('Upload complete failed');
                }
            })
            .catch((err) => {
                console.log(err);
            })

        }
    }

    queAdd(que, idx){
        if(que === 'init'){
            var temp = this.state.initQue;
            temp.push(idx);
            this.setState({initQue: temp});
        } else if(que === 'selected'){
            var temp = this.state.selectedQue;
            temp.push(idx);
            this.setState({selectedQue: temp});
        } else if(que === 'waiting'){
            temp = this.state.waitingQue;
            temp.push(idx);
            this.setState({waitingQue: temp});
        } else if(que === 'uploading'){
            temp = this.state.uploadingQue;
            temp.push(idx);
            this.setState({uploadingQue: temp});
        } else if(que === 'finished'){
            temp = this.state.finishedQue;
            temp.push(idx);
            this.setState({finishedQue: temp});
        } else if(que === 'exist'){
            temp = this.state.existQue;
            temp.push(idx);
            this.setState({existQue: temp});
        }
    }

    queRemove(que, idx){
        if(que === 'init'){
            const q = this.state.initQue;
            const i = q.indexOf(idx);
            if(i > -1){q.splice(i, 1);}
            this.setState({initQue: q});
        } else if(que === 'selected'){
            const q = this.state.selectedQue;
            const i = q.indexOf(idx);
            if(i > -1){q.splice(i, 1);}
            this.setState({selectedQue: q});
        } else if(que === 'waiting'){
            const q = this.state.waitingQue;
            const i = q.indexOf(idx);
            if(i > -1){q.splice(i, 1);}
            this.setState({waitingQue: q});
        } else if(que === 'uploading'){
            const q = this.state.uploadingQue;
            const i = q.indexOf(idx);
            if(i > -1){q.splice(i, 1);}
            this.setState({uploadingQue: q});
        } else if(que === 'finished'){
            const q = this.state.finishedQue;
            const i = q.indexOf(idx);
            if(i > -1){q.splice(i, 1);}
            this.setState({finishedQue: q});
        } else if(que === 'exist'){
            const q = this.state.existQue;
            const i = q.indexOf(idx);
            if(i > -1){q.splice(i, 1);}
            this.setState({existQue: q});
        }
    }

    // Add selected files to the files list that does not yet exists
    onSelect(files){
        loop1:
        for(var iter = 0; iter < files.length; iter++){
            const i = iter;
            for(var j = 0; j < this.state.files.length; j++){

                // The selected file already exists in files list
                if(files[i].name === this.state.files[j].name){
                    continue loop1;
                }
            }
            var temp = {}
            temp.name = files[i].name;
            temp.lastModified = files[i].lastModified;
            temp.size = files[i].size;
            temp.file = files[i];

            // Add to file list
            var newFile = this.state.files;
            const idx = newFile.push(temp) - 1;
            this.setState({files: newFile}, () => {

                // Add to initQue
                this.queAdd('init', idx);
            });
        }
    }

    onSuggestionChange(idx, suggestedIdx){
        console.log('in chanignig');

        var temp = this.state.files;
        temp[idx].suggestedIdx = suggestedIdx;
        temp[idx]['showSuggestions'] = false;
        this.setState({files: temp});

    }

    onUpload(idx){

        // Add to uploads
        if(this.state.uploadingQue.length < this.max_simultanous_uploads){
            this.queAdd('uploading', idx);
            var temp = this.state.files;
            temp[idx]['uploading'] = true;
            this.setState({files: temp}, this.upload(idx));

        } else{
            // Upload que full, add to waiting que
            this.queAdd('waiting', idx);
        }

        this.queRemove('selected', idx);
    }


    onDelete(idx){

        fetch('/library/delete/?file_id=' + this.state.files[idx].server.id, {method:'DELETE'})
        .then(res => {
            if(res.ok){
                // Move from exist to selected list
                var temp = this.state.files;

                if(('server' in temp[idx])){
                    delete temp[idx].server;
                }
                if('suggestions' in temp[idx]){
                    delete temp[idx].suggestions;
                }
                if('suggestedIdx' in temp[idx]){
                    delete temp[idx].suggestedIdx;
                }

                this.setState({files: temp}, () => {
                    this.queAdd('init', idx);
                    this.queRemove('exist', idx);
                });

            } else{
                throw new Error('Unable to delete');
            }
        })
        .then((err) => {
            console.log(err);
        })
    }


    renderInit(){
        return(
            <div>Initing {this.state.initQue.length} files</div>
        )
    }

    renderSuggestions(idx){

        if(!('showSuggestions' in this.state.files[idx])){
            return null;
        }

        if(!this.state.files[idx].showSuggestions){
            return null;
        }

        if(!('suggestions' in this.state.files[idx])){
            return null;
        }



        // if(this.state.files[idx].suggestions.length )

        console.log('suggest for ', idx);
        var s = [];

        for(var i = 0; i < this.state.files[idx].suggestions.length; i++){
            const k = i;
            if(i === this.state.files[idx].suggestedIdx){
                continue;
            }
            s.push(
                <div key={k} id={k} style={{cursor:'pointer'}} onClick={() => this.onSuggestionChange(idx, k)}>
                    <SuggestionCell
                        title={this.state.files[idx].suggestions[k].title}
                        year={this.state.files[idx].suggestions[k].year}
                        imgUrl={this.state.files[idx].suggestions[k].poster_url}
                    />
                </div>
            )

        }

        return (
            <div>
                <div>SearchBar</div>
                {s}
            </div>
        )
    }

    renderSelected(){
        var s = [];
        for(var i = 0; i < this.state.selectedQue.length; i++){
            const idx = this.state.selectedQue[i];

            var item = (
                <div
                    style={{border: '1px solid black', position: 'relative', overflow: 'auto'}}
                    >
                    <div style={{width: '100%'}}>{this.state.files[idx].name}</div>
                    <div style={{border: '1px solid black', cursor:'pointer'}}onClick = {() => {
                        var temp = this.state.files;
                        temp[idx]['showSuggestions'] = !temp[idx]['showSuggestions'];
                        this.setState({files: temp});
                    }}>
                        <img style={{float:'left'}} src={this.state.files[idx].suggestions[this.state.files[idx].suggestedIdx].poster_url}/>
                        <div style={{float: 'left'}}>
                            <div style={{}}>
                            {this.state.files[idx].suggestions[this.state.files[idx].suggestedIdx].title}
                            </div>
                            <div>
                            ({this.state.files[idx].suggestions[this.state.files[idx].suggestedIdx].year})
                            </div>

                        </div>
                    </div>
                    <div>
                        <button onClick = {() => {
                            this.onUpload(idx);
                        }}
                        >Upload
                        </button>
                    </div>


                    {this.renderSuggestions(idx)}
                </div>
            )


            s.push(<div key = {idx} id={idx}>{item}</div>);
        }
        return (
            <div>
                Selected {s.length} files
                {s}
            </div>
        )
    }

    renderWaiting(){

        var s = [];
        for(var i = 0; i < this.state.waitingQue.length; i++){

            const k = this.state.waitingQue[i];
            s.push(
                <div key = {k} id={k}>
                    {this.state.files[k].name}
                </div>
            );
        }
        return (
            <div>
                Waiting {s.length} files
                {s}
            </div>
        )
    }

    renderUploading(){

        console.log('uploadingQue ', this.state.uploadingQue);
        console.log('finishedQue ', this.state.finishedQue);
        var s = [];
        for(var i = 0; i < this.state.uploadingQue.length; i++){

            const k = this.state.uploadingQue[i];
            s.push(
                <div key = {k} id={k}>
                    {this.state.files[k].name}
                    {(this.state.files[k].server.size_uploaded/ this.state.files[k].server.size) * 100} %
                </div>
            );
        }
        return (
            <div>
                Uploading {s.length} files
                {s}
            </div>
        )
    }

    renderFinished(){
        return(
            <div>Finished {this.state.finishedQue.length} files</div>
        )
    }

    renderExists(){
        console.log('files, ',this.state.files);
        var files = [];
        for(var i = 0; i < this.state.existQue.length; i++){
            const k = i;
            files.push(
                <div key={k}>
                    {this.state.files[this.state.existQue[k]].name}
                    {this.state.existQue[k]}
                    <button onClick = {() => {
                        this.onDelete(this.state.existQue[k]);
                    }}
                    > Delete and re-upload
                    </button>
                </div>
            );
        }
        var msg = 'Exists 0 files';
        if(files.length > 0){
            msg = 'Following of the selected files found on in Library'
        }
        return(
            <div>
                {msg}
                {files}
            </div>
        )
    }

    render(){

        return (
            <div>

            <input
                type='file'
                accept='*/*'
                multiple
                style={{

                }}
                onChange={(event)=>{
                    this.onSelect(event.target.files);
                }}
            />
                <br/>

                {this.renderInit()}
                {this.renderSelected()}
                {this.renderWaiting()}
                {this.renderUploading()}
                {this.renderFinished()}
                {this.renderExists()}
            </div>
        )
    }
}
