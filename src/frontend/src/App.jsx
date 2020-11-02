import React from 'react';

import UploadFiles from './UploadFiles';
import UploadApplication from './UploadApplication';
import BrowserApplication from './BrowserApplication';
import Collections from './Collections';

export default class App extends React.Component{
    constructor(){
        super();


        this.state={
            library: null,
            collections: null,
            metadata: null
        }
    }

    // Fetch content
    componentDidMount(){


        // Get collections
        fetch('/library/collection')
        .then(res => {
            if(res.ok){
                return res.json();
            } else{
                throw new Error('No collections');
            }
        })
        .then(data => {
            this.setState({collections: data});
        })
        .catch((err) =>{
            this.setState({collections: []});
        });

        // Fetch titles
        fetch('/library/title/')
        .then(res => {
            if(res.ok){
                return res.json();
            } else{
                throw new Error('Unable to fetch titles');
            }
        })
        .then(data => {
            console.log(data.titles);
            this.setState({library: data.titles}, this.retrieveContentMetadata);
            // if(data.titles.length > 0){
            //     // var temp = this.state.content;
            //     var temp = {}
            //
            //     for(var i = 0; i < data.titles.length; i++){
            //         if(!(data.titles[i] in temp)){
            //             temp[data.titles[i]] = null;
            //         }
            //     }
            //
            //     this.setState({library: temp}, this.retrieveContentMetadata());
            //     console.log(temp);
            // }
        })
        .catch((err) => {
            console.log(err);
            this.setState({library: []});
            this.setState({metadata: []});
        });


    }


    retrieveContentMetadata(){
        console.log('retriein metadata');
        var toRetrieve = "";
        var titles = this.state.library;
        // Object.keys(this.state.library).forEach(function(k){
        //     if(!(titles[k])){
        //         toRetrieve += k + ',';
        //     }
        // });
        console.log(this.state.library)
        for(var i = 0; i < this.state.library.length; i++){
            console.log( this.state.library[i])
            toRetrieve += this.state.library[i] + ',';
        }
        console.log(toRetrieve)
        if(toRetrieve === ""){
            return;
        }


        console.log('to retr ', toRetrieve);
        fetch('/metadata/movie/?id=' + toRetrieve)
        .then(res => {
            if(res.ok){
                return res.json();
            } else{
                throw new Error('Unable to fetch metadata');
            }
        })
        .then(data => {
            console.log(data);

            // var temp = this.state.library;
            // for(var i = 0; i < data.length; i++){
            //     if(data[i].id in temp){
            //         temp[data[i].id] = data[i];
            //     }
            // }
            // this.setState({titles: temp});
            this.setState({metadata: data});

        })
        .catch((err) => {
            console.log(err);
        })
    }


    renderContent(){
        if(!this.state.library || !this.state.collections){

            return null;
        }

        return(

            <div>
                <BrowserApplication/>
                <Collections/>
            </div>

        )
    }

    render(){

        return(
            <div>

                <div style={{
                    width: '80%',
                    margin: '0 auto',
                    marginTop: '40px'
                }}>
                  <UploadApplication/>
                  {this.renderContent()}
                </div>

          </div>
        )
    }
}
