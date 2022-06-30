import React from 'react';
import ReactLoading from "react-loading";

import '../assets/css/loading.css'
export function Loading(props) {
    return (
        <div className='loading_back'>
            <ReactLoading className='loading' type={props.type} color={props.color}></ReactLoading>
        </div>
    )
}