import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NotificationManager } from 'react-notifications';

import logo from '../assets/img/logo.png';

export default function Admin() {
    const [reqamount, setReqamount] = useState('');
    const [feeamount, setFeeamount] = useState('');
    const [rewardamount, setRewardamount] = useState('');
    const [editstate, setEditstate] = useState(false);
    const [amounts, setAmounts] = useState({});

    useEffect(() => {
        axios.post('/getsetting', {})
            .then((result) => {
                setAmounts(result.data);
                setReqamount(result.data.req_amount);
                setFeeamount(result.data.fee_amount);
                setRewardamount(result.data.reward_amount);
            })
    }, [])

    const changestate = () => {
        setEditstate(true);
    }

    const save = () => {
        if (reqamount === '' || feeamount === '' || rewardamount === '') {
            NotificationManager.warning('Invalid Values');
            return;
        }
        let data = {
            req_amount: reqamount,
            fee_amount: feeamount,
            reward_amount: rewardamount
        }
        axios.post('/setsetting', { data: data })
            .then((result) => {
                if (result.data === 'success') {
                    NotificationManager.success("Success Saved");
                    setAmounts(data);
                    setEditstate(false);
                }
                else {
                    NotificationManager.error("Fail Saved");
                }
            })
    }

    const logoff = () => {
        sessionStorage.removeItem('token');
        window.location.href = '/login';
    }

    return (
        <div style={{ backgroundColor: '#12202c' }}>
            <div className='admin-page'>
                <div className='admin-sidebar'>
                    <div className='admin-logo'>
                        <img className='admin-logoimg' src={logo} alt='metemix' />
                        <span className='admin-logotxt'>METAMIX</span>
                    </div>
                    <div className='admin-sidebar-li'>
                        <div className='admin-li'>METAMAN</div>
                    </div>
                </div>
                <div className='admin-panel'>
                    <div id='metaman-panel'>
                        <div className='admin-hd'>
                            <h1>METAMAN</h1>
                        </div>
                        <hr />
                        <div className='admin-pg'>
                            <div className='admin-pg-1'>
                                <div className='admin-pg-1-1'>
                                    <h3>Option Values</h3>
                                    <h4>Requied Amoumt &nbsp;&nbsp; :&nbsp;&nbsp; <span>{amounts.req_amount}</span> $ </h4>
                                    <h4>Fee Amoumt &nbsp;&nbsp; :&nbsp;&nbsp; <span>{amounts.fee_amount}</span> $ </h4>
                                    <h4>Reward Amoumt &nbsp;&nbsp; :&nbsp;&nbsp; <span>{amounts.reward_amount}</span> $ </h4>
                                    {
                                        !editstate && <button className="change-btn" onClick={changestate}>Change</button>
                                    }

                                </div>
                                {
                                    editstate && <div className='admin-pg-1-1'>
                                        <h3>Setting</h3>
                                        <h4>Requied Amoumt &nbsp;&nbsp; :&nbsp;&nbsp; <span><input className='setting-input' type='text' value={reqamount} onChange={e => setReqamount(e.target.value)} /></span> $ </h4>
                                        <h4>Fee Amoumt &nbsp;&nbsp; :&nbsp;&nbsp; <span><input className='setting-input' type='text' value={feeamount} onChange={e => setFeeamount(e.target.value)} /></span> $ </h4>
                                        <h4>Reward Amoumt &nbsp;&nbsp; :&nbsp;&nbsp; <span><input className='setting-input' type='text' value={rewardamount} onChange={e => setRewardamount(e.target.value)} /></span> $ </h4>
                                        <button className="change-btn" onClick={save}>Save</button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='logoff-btn' onClick={logoff}>Log Off</div>
                </div>
            </div >
        </div>
    )
}