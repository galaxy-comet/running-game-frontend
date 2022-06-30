import React, { useState } from 'react';
import axios from 'axios';
import { NotificationManager } from 'react-notifications';

import '../assets/css/admin.css'

export default function Login() {
    const [mail, setMail] = useState('');
    const [pass, setPass] = useState('');

    const mailchange = (e) => {
        setMail(e.target.value);
    }
    const passchange = (e) => {
        setPass(e.target.value);
    }
    const login = () => {
        if (mail === '' || pass === '') {
            NotificationManager.warning('Not fill fields');
            return;
        }
        let data = {
            name: mail,
            pass: pass
        }
        axios.post('/adminlogin', data)
            .then((result) => {
                if (result.data.type === 'success') {
                    NotificationManager.success(result.data.msg);
                    sessionStorage.setItem('token', JSON.stringify(result.data.token));
                    window.location.href = "/admin";
                } else {
                    NotificationManager.error(result.data.msg);
                }
            })
    }
    return (
        <div style={{ backgroundColor: '#12202c' }}>
            <div className='admin-back'>
                <div className='admin-modal'>
                    <h1 className='admin-title'>METAMAN</h1>
                    <div>
                        <input className='admin-input' type='text' placeholder='USERNAME' value={mail} onChange={e => mailchange(e)} />
                    </div>
                    <div>
                        <input className='admin-input' type='password' placeholder='PASSWORD' value={pass} onChange={e => passchange(e)} />
                    </div>
                    <div>
                        <button className='admin-btn' onClick={login}>Sign In</button>
                    </div>
                </div>
            </div>
        </div>
    )
}