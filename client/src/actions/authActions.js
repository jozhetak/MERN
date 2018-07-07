import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';

import { GET_ERRORS, SET_CURRENT_USER } from './types';

export const registerUser = (userData, history) => dispatch => {
    axios.post('/api/users/register', userData)
        .then(res => history.push('/login'))
        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
    );
}

export const loginUser = userData => dispatch => {
    axios.post('/api/users/login', userData)
        .then(res => {
            // save to localStorage
            const { token } = res.data;
            localStorage.setItem('jwtToken', token);
            // set token to auth headers
            setAuthToken(token);
            //decode token
            const decoded = jwt_decode(token);
            // set current user
            dispatch(setCurrentUser(decoded));
        })
        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
    );
};

// set logged in user
export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    };
};


export const logOutUser = () => dispatch => {
    localStorage.removeItem('jwtToken');

    setAuthToken(false);

    dispatch(setCurrentUser({}));

    window.location.href = '/login';
}