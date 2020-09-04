import React from 'react';


export default class ProgressBar extends React.Component{
    constructor(props){
        super(props);

    }




    render(){


        var style = {
            backgroundColor: 'gray',
            width: this.props.progress + '%',
            height: '100%'
        }
        return(
            <div style={
                {
                    height: '20px',
                    width: '100%',
                    border: '1px solid black'
                }
            }>

                <div style={style}></div>

            </div>
        )

    }
}
