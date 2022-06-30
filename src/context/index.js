import React, {
    createContext,
    useContext,
    useReducer,
    useMemo,
    useEffect,
} from "react";
import { ethers } from "ethers";
import { useWallet } from "use-wallet";

import {
    metatokenContract
} from "../contracts";
import { toBigNum, fromBigNum } from "../utils/utils"
import { GetTokenPrice } from './gettokenprice';

import io from "socket.io-client";
const socket = io();

const BlockchainContext = createContext();

export function useBlockchainContext() {
    return useContext(BlockchainContext);
}

function reducer(state, { type, payload }) {
    return {
        ...state,
        [type]: payload
    }
}

const INIT_STATE = {
    Loading: true,
    signer: {},
    provider: {},
    balance: '0',
    user: "meta-man",
    usdamount: '',
    allowtokens: '0',
    requiretoken: 0,
    entranceFee: 0,
    rewardtoken: 0,
    userstate: false,
};

export default function Provider({ children }) {
    const wallet = useWallet();
    const [state, dispatch] = useReducer(reducer, INIT_STATE);

    useEffect(() => {

    }, [])
    useEffect(() => {
        const getSigner = async () => {
            if (wallet.status === "connected") {
                const provider = new ethers.providers.Web3Provider(wallet.ethereum);
                const signer = await provider.getSigner();
                getallowtokens(state.requiretoken);
                getBalance();
                dispatch({
                    type: "signer",
                    payload: signer
                });

                dispatch({
                    type: "provider",
                    payload: provider
                });

                dispatch({
                    type: "user",
                    payload: wallet.account
                });
            }
        }
        getSigner();

    }, [wallet.status]);

    const getBalance = async () => {
        try {
            if (wallet.status === "connected") {
                const balance = await metatokenContract.balanceOf(wallet.account);
                dispatch({
                    type: "balance",
                    payload: fromBigNum(balance, 9).toFixed(0)
                });
                return fromBigNum(balance, 9);
            } else {
                return "0";
            }
        } catch (err) {
            console.log("context : getBalance error", err);
            return 0;
        }
    }

    const checkbalance = () => {
        if (Number(state.balance) !== 0 && Number(state.balance) >= Number(state.allowtokens)) {
            return true;
        }
        else {
            return false;
        }
    }
    const updateTokenBalance = async () => {
        var balance = getBalance();
        dispatch({
            type: "balance",
            payload: balance,
        });
    }
    const getallowtokens = async (para) => {
        (async () => {
            let prices = await GetTokenPrice();
            // let bnbprice = prices.bnb;
            let usdprice = prices.usd;
            let amount = 1 * para / usdprice; // amount of token per n BNB
            let usdamount = 1 / usdprice;      // amount of token per 1USD
            dispatch({
                type: "allowtokens",
                payload: amount.toFixed(0)
            });
            dispatch({
                type: "usdamount",
                payload: usdamount
            });
            return amount;
        })()
    }
    const setUserState = () => {
        dispatch({
            type: "userstate",
            payload: true
        });
    }
    const getFeeAmount = () => {
        let feeamount = state.usdamount * state.entranceFee;
        return toBigNum(feeamount.toFixed(0), 9);
    }
    const getRequireAmount = () => {
        let requireamount = state.usdamount * state.requiretoken;
        return requireamount.toFixed(0);
    }
    const setRequiretoken = (para) => {
        dispatch({
            type: "requiretoken",
            payload: para
        });
    }
    const setRewardtoken = (para) => {
        dispatch({
            type: "rewardtoken",
            payload: para
        });
    }
    const setFeetoken = (para) => {
        dispatch({
            type: "entranceFee",
            payload: para
        });
    }
    return (
        <BlockchainContext.Provider
            value={useMemo(
                () => [
                    state,
                    socket,
                    {
                        getBalance,
                        checkbalance,
                        getallowtokens,
                        updateTokenBalance,
                        getFeeAmount,
                        getRequireAmount,
                        setUserState,
                        setRequiretoken,
                        setRewardtoken,
                        setFeetoken
                    }
                ],
                [state]
            )}
        >
            {children}
        </BlockchainContext.Provider>
    );
}