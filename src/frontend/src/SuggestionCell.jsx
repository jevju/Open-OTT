import React from 'react';


export default class SuggestionCell extends React.Component {
    constructor(props){
        super(props);
    }



    render(){


        return (
            <div>
                <img src={this.props.imgUrl}/>
                {this.props.title}
                {this.props.year}

            </div>
        )
    }
}
