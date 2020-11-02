
import React from 'react';

export default class Collections extends React.Component{
    constructor(){
        super();



    }

    // Fetch collections on mount
    componentDidMount(){

        //
        // fetch('/library/collection')
        // .then(res => {
        //     if(res.ok){
        //         return res.json();
        //     } else{
        //         throw new Error('No collections');
        //     }
        // })
        // .then(data => {
        //     console.log(data);
        // })
        // .catch((err) =>{
        //
        //     // No collections, do nothing
        //
        //     console.log(err);
        // })
    }


    renderForm(){



        return(
            <div>

                <div style={{
                    cursor: 'pointer',
                    border: '1px solid black',
                    height: '20px',
                    width: '150px'
                }}

                >
                    New collection
                </div>

            </div>
        );
    }

    render(){
        return(
            <div style={{
                    border: '2px solid gray',
                    borderRadius: '10px',
                    padding: '10px',
            }}>

                {this.renderForm()}

            </div>
        );
    }
}
