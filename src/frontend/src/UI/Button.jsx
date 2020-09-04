import React from 'react';


export default class Button extends React.Component{
    constructor(props){
        super();
    }



    renderButton(){
        return(

            <div style={{
                position: 'relative',
                textAlign: 'center',
                width: '100%'
            }}>
                <div
                    style={{
                        borderRadius: '8px',
                        textAlign: 'center',

                        // height: '20px',
                        display: 'inline-block',
                        position: 'relative'
                    }}>
                    <div  className={'btn'}
                    style={{
                        border: '2px solid gray',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        width: '100%',
                        height: '100%'
                    }}
                    onClick={this.props.onClick}
                    >
                    {this.props.text}

                    </div>


                </div>
            </div>
        )
    }

    renderInput(){

        return(

            <div style={{
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                width: '100%',
                height: '100%'

            }}>
                <div
                className={'btn'}
                style={{
                    borderRadius: '8px',
                    textAlign: 'center',
                    display: 'inline-block',
                    position: 'relative',
                    width: '100%'
                 }}>
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
                    }}>
                    {this.props.text}
                    </button>
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
                        this.props.onClick(event);
                    }}
                    />
                </div>
            </div>
        )
    }

    render(){

        if(this.props.type==='input'){
            return (
                <div>
                    {this.renderInput()}
                </div>
            )
        } else if (this.props.type === 'button') {
            return (
                <div>
                    {this.renderButton()}
                </div>
            )
        } else{
            return null;
        }

    }
}
