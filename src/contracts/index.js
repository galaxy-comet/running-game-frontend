import { ethers } from "ethers";

import Contrats from "./contract.json";

const supportChainId = 56;

const RPCS = {
    56: "https://bsc-dataseed1.ninicoin.io",
}

const providers = {
    56: new ethers.providers.JsonRpcProvider(RPCS[56]),
    // 417: new ethers.providers.JsonRpcProvider(RPCS[417]),
    // 1337: new ethers.providers.JsonRpcProvider(RPCS[1337]),
    // 31337: new ethers.providers.JsonRpcProvider(RPCS[31337])
}

const metatokenContract = new ethers.Contract(Contrats.metatoken.address, Contrats.metatoken.abi, providers[supportChainId]);

export {
    supportChainId,
    metatokenContract,
    providers
}