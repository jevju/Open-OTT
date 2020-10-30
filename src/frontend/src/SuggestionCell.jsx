import React from 'react';


export default class SuggestionCell extends React.Component {
    constructor(props){
        super(props);
    }



    renderSuggestion(){

        return (
            <div style={{position: 'relative'}}>
                <img style={{float:'left'}} src={this.props.imgUrl}/>
                <div style={{}}>
                    <div>
                        {this.props.title}
                    </div>
                    <div>
                        {this.props.year}
                    </div>
                </div>
            </div>
        )
    }

    renderCover(){
        return(

            <div style={{position: 'relative'}}>
                <div style={{}}>
                    <img style={{}} src={this.props.imgUrl}/>
                    <div style={
                        {position: 'absolute', bottom: '0', left:'50%', transform: 'translate(-50%, -20%)'}
                    }>{this.props.title}</div>

                </div>
            </div>

        )
    }


    render(){

        if(this.props.type === 'suggestion'){
            return this.renderSuggestion();
        } else if(this.props.type === 'cover'){
            return this.renderCover();
        } else{
            return (<div>Empty</div>)
        }


    }
}
