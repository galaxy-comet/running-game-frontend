import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import ScriptTag from 'react-script-tag';
import { Fireworks } from 'fireworks-js/dist/react'
import $ from 'jquery';

import { useBlockchainContext } from "../context";

import '../assets/css/style.css';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#f1ecd9',
        border: '2px solid #edd79a',
        borderRadius: '10px',
        padding: '30px',
        minWidth: '450px'
    },
};

export default function Main() {
    const [state, socket,
    ] = useBlockchainContext();
    const [coin, setCoin] = useState(0);
    const [level, setLevel] = useState(1);
    const [statemodal, setStateModal] = useState(false);
    const [reward, setReward] = useState(0);
    const [firework, setFirwork] = useState(false);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [finish, setFinish] = useState(false);
    const [waiting, setWaiting] = useState(false);

    function openModal() {
        setIsOpen(true);
    }

    useEffect(() => {
        console.log(socket);
        socket.emit('play', { account: state.user });
        socket.on('playResponse', async (data) => {
            if (data.resdata === 2) {
                window.location.href = '/';
                return;
            }
        })
    }, [])

    const options = {
        opacity: 0.2,
        speed: 1,
        acceleration: 1.03,
        lineWidth: 5,
        explosion: 10
    }

    const style = {
        top: 0,
        right: 0,
        width: '600px',
        height: '100%',
        position: 'fixed',
        background: 'transparent',
    }

    window.changefun = function (coins) {
        socket.emit('addcoin', {});
        setCoin(coins);
        return true;
    }
    window.finish = function () {
        let rewardamount = state.usdamount * state.rewardtoken * (level - 1);
        if (rewardamount === 0) {
            setStateModal(true);
        }
        setReward(rewardamount);
        openModal();
    }
    window.showfirework = function () {
        setFirwork(true);
        window.setTimeout(() => {
            setFirwork(false);
        }, 6000)
    }
    window.levelfun = function (value) {
        socket.emit('addlevel', {});
        if (value === 16) {
            setFinish(true);
            window.finish();
            setLevel(value - 1);
        }
        else {
            setLevel(value);
        }
        return true;
    }
    const rewards = () => {
        socket.emit('receiveReward', { price: state.usdamount });
        setWaiting(true);
        socket.on('receiveRewardResponse', (data) => {
            if (data)
                window.location.href = '/';
        })
    }
    return (
        <>
            <ScriptTag isHydrating={false} type="text/javascript" src="Mario/Scripts/jquery.js" />
            <ScriptTag isHydrating={false} type="text/javascript" src="Mario/Scripts/testlevels.js" />
            <ScriptTag isHydrating={false} type="text/javascript" src="Mario/Scripts/oop.js" />
            <ScriptTag isHydrating={false} type="text/javascript" src="Mario/Scripts/keys.js" />
            <ScriptTag isHydrating={false} type="text/javascript" src="Mario/Scripts/constants.js" />
            <ScriptTag isHydrating={false} type="text/javascript" src="Mario/Scripts/main.js" />

            <div id="gameField">
                <div id="game">
                    <div id="world"></div>
                    <div className='level-text'>Level - <span>{level}</span> </div>
                    <div id='coinNumbers' className="gauge" >{coin}</div>
                    <div id="coin" className="gaugeSprite"></div>
                    <div id="liveNumber" className="gauge" ></div >
                    <div id="live" className="gaugeSprite" ></div >
                </div>
            </div>
            {
                !firework ? <></> :
                    <Fireworks options={options} style={style} />
            }
            {
                <Modal
                    isOpen={modalIsOpen}
                    style={customStyles}
                    contentLabel="Example Modal"
                >
                    {
                        finish ?
                            <div className='m-header'>
                                CONGRATULATE !!!
                            </div> :
                            <div className='m-header'>
                                GAME OVER
                            </div>
                    }
                    {statemodal === true ? <div className='m-body'></div> :
                        <div className='m-body'>
                            <div className='m-comment-txt'>Please receive Game Rewards.</div>
                            <div className='m-values'>
                                <div className='m-rewards'><span>{reward}</span><span className='m-mmx'> MMX</span></div>
                            </div>
                        </div>
                    }
                    <div className='m-footer'>
                        {
                            statemodal === true ? <div className='go-btn pure-material-button-contained' onClick={() => { window.location.href = '/' }}>Try again</div>
                                :
                                waiting
                                    ?
                                    <div className='waiting-btn pure-material-button-contained'>Waiting...</div>
                                    :
                                    <button className='go-btn pure-material-button-contained' onClick={rewards}>Rewards</button>
                        }
                    </div>
                </Modal>
            }
        </>
    )
}