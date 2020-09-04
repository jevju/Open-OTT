import React from 'react';

export default class DetectClickOutside extends React.Component{
    constructor(props){
        super(props);

        this.wrapperRef = React.createRef();
        // this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);

    }

    componentDidMount(){
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount(){
        document.removeEventListener('mousedown', this.handleClickOutside);

    }

    handleClickOutside(event){
        if(this.wrapperRef && !this.wrapperRef.current.contains(event.target)){
            this.props.onClickOutside();
        }
    }

    render(){
        return (
            <div ref={this.wrapperRef}>
                {this.props.content}
            </div>
        );
    }
}
