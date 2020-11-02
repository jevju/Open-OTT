import React from 'react';

import SuggestionCell from './SuggestionCell';


export default class BrowserApplication extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            titles: {},
            show: null,
        }

        this.onShowTitle = this.onShowTitle.bind(this);
    }

    componentDidMount(){
        console.log('Fetching titles');
        //
        // fetch('/library/title/')
        // .then(res => {
        //     if(res.ok){
        //         return res.json();
        //     } else{
        //         throw new Error('Unable to fetch titles');
        //     }
        // })
        // .then(data => {
        //         if(data.titles.length > 0){
        //             var temp = this.state.titles;
        //
        //             for(var i = 0; i < data.titles.length; i++){
        //                 if(!(data.titles[i] in temp)){
        //                     temp[data.titles[i]] = null;
        //                 }
        //             }
        //
        //             this.setState({titles: temp});
        //             console.log(temp);
        //         }
        // })
        // .catch((err) => {
        //     console.log(err);
        // });

    }

    componentDidUpdate(){
        // 
        // var toRetrieve = "";
        // var titles = this.state.titles;
        // Object.keys(this.state.titles).forEach(function(k){
        //     if(!(titles[k])){
        //         toRetrieve += k + ',';
        //     }
        // });
        //
        // if(toRetrieve === ""){
        //     return;
        // }
        //
        //
        // console.log('to retr ', toRetrieve);
        // fetch('/metadata/movie/?id=' + toRetrieve)
        // .then(res => {
        //     if(res.ok){
        //         return res.json();
        //     } else{
        //         throw new Error('Unable to fetch metadata');
        //     }
        // })
        // .then(data => {
        //     console.log(data);
        //
        //     var temp = this.state.titles;
        //     for(var i = 0; i < data.length; i++){
        //         if(data[i].id in temp){
        //             temp[data[i].id] = data[i];
        //         }
        //     }
        //     this.setState({titles: temp});
        //
        //
        // })
        // .catch((err) => {
        //     console.log(err);
        // })

        //
        // for(var i = 0; i < titles.length; i++){
        //     if(('id' in titles[i]) && !('metadata' in titles[i])){
        //         fetch('/metadata/movie/?id=' + titles[i].id)
        //         .then(res => {
        //             if(res.ok){
        //                 return res.json();
        //             } else{
        //                 throw new Error('Unable to fetch metadata for ' + titles[i].id);
        //             }
        //         })
        //         .then(data => {
        //             console.log(data);
        //
        //
        //         })
        //         .catch((err) => {
        //             console.log(err);
        //         })
        //     }
        // }
    }

    onShowTitle(id){
        console.log('showing ', id);
        this.setState({show: id});
    }



    renderShowTitle(){
        if(!(this.state.show)){
            return null;
        }

        const title = this.state.titles[this.state.show];
        console.log(title);

        var stars = [];
        for(var i = 0; i < title.stars.length; i++){
            const k = i;
            stars.push(
                <div key={k}>
                    <div>{title.stars[k].name}</div>
                    <div></div>
                </div>
            );
        }

        return(
            <div>

                <div style={{display: 'flex'}}>
                    <img style={{}} src={'/library/poster/?content_id=' + title.id + '&w=300'}/>
                    <div style={{}}>

                        <div style={{fontWeight: '550', fontSize: '1.5em'}}>
                            {title.title} ({title.year})
                        </div>
                        <div style={
                            {fontFamily: '"Apple Chancery","Bradley Hand", "Comic Sans MS"',
                            fontSize: '1.3em'
                        }}>
                            "{title.tagline}"
                        </div>
                        <div style={{borderTop: '1px solid black', display: 'flex'}}>

                            <div style={{width:'70%'}}>
                                <div>
                                    {title.directors[0].name}
                                </div>
                                <div>
                                    {title.plot_short}
                                </div>
                            </div>
                            <div style={{width: '30%'}}>
                                <div>
                                    {stars}
                                </div>
                                <div>
                                    {title.year}
                                </div>
                                <div>
                                    {title.year}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <video width="100%"  controls>
                    <source src={"/library/video/?content_id=" + title.id} type="video/mp4"/>
                </video>
            </div>
        )
    }

    render(){

        var divs = [];
        const titles = this.state.titles;
        Object.keys(this.state.titles).forEach((k) => {
            if(titles[k]){
                divs.push(
                    <div key={k} style={{width: '186px'}}
                        onClick={() => {
                            console.log(k);
                            this.onShowTitle(k);
                        }}
                    >
                        <SuggestionCell
                            type={'cover'}
                            imgUrl={'/library/poster/?content_id=' + titles[k].id + '&w=186' }
                            title={titles[k].title}
                        />

                    </div>
                );
            }
        })


        //
        // console.log(this.state.titles);
        // console.log(typeof(this.state.titles))
        // if(this.state.titles.length > 0){
        //     console.log('lengt>>>>')
        //     var titles = this.state.titles;
        //     for(var i = 0; i < titles.length; i++){
        //         console.log('pushing')
        //         const k = i;
        //         divs.push(<div key={k}>{titles[k].id}</div>);
        //     }
        // }
        // console.log(divs)


        return (
            <div style={{
                    border: '2px solid gray',
                    borderRadius: '10px',
                    padding: '10px',
            }} className={'browser-application'}>
                {this.renderShowTitle()}
                <div style={
                    {display: 'flex',
                    flexDirection:'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-evenly',
                    padding:'10px'
                }
                }>
                    {divs}
                </div>
            </div>
        )
    }
}
