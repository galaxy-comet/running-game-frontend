let { ethers } = require('ethers');

let { Contrats } = require("./contract.js");

const supportChainId = 56;

const RPCS = {
    1: "http://13.59.118.124/eth",
    4002: "https://rpc.testnet.fantom.network",
    26: "http://18.117.255.252/chain",
    56: "https://bsc-dataseed1.ninicoin.io",
    417: "https://testnet-rpc.icicbchain.org",
    1337: "http://localhost:7545",
    31337: "http://localhost:8545/"
}

const providers = {
    1: new ethers.providers.JsonRpcProvider(RPCS[1]),
    4002: new ethers.providers.JsonRpcProvider(RPCS[4002]),
    26: new ethers.providers.JsonRpcProvider(RPCS[26]),
    56: new ethers.providers.JsonRpcProvider(RPCS[56]),
    417: new ethers.providers.JsonRpcProvider(RPCS[417]),
    // 1337: new ethers.providers.JsonRpcProvider(RPCS[1337]),
    // 31337: new ethers.providers.JsonRpcProvider(RPCS[31337])
}

const metatokenContract = new ethers.Contract(Contrats.metatoken.address, Contrats.metatoken.abi, providers[supportChainId]);

module.exports = { metatokenContract, providers }