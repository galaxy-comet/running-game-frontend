
import Web3 from 'web3';

import Contrats from "../contracts/contract.json";

let pancakeSwapAbi = Contrats.metatoken.pancakeswapabi;
let tokenAbi = Contrats.metatoken.abi;
let pancakeSwapContract = "0x10ED43C718714eb63d5aA57B78B54704E256024E".toLowerCase();

async function calcSell(tokensToSell, tokenAddres) {
    const web3 = new Web3("https://bsc-dataseed1.binance.org");
    const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" //BNB

    let tokenRouter = await new web3.eth.Contract(tokenAbi, tokenAddres);
    let tokenDecimals = await tokenRouter.methods.decimals().call();

    tokensToSell = setDecimals(tokensToSell, tokenDecimals);
    let amountOut;
    try {
        let router = await new web3.eth.Contract(pancakeSwapAbi, pancakeSwapContract);
        amountOut = await router.methods.getAmountsOut(tokensToSell, [tokenAddres, BNBTokenAddress]).call();
        amountOut = web3.utils.fromWei(amountOut[1]);
    } catch (error) { }

    if (!amountOut) return 0;
    return amountOut;
}
async function calcBNBPrice() {
    const web3 = new Web3("https://bsc-dataseed1.binance.org");
    const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" //BNB
    const USDTokenAddress = "0x55d398326f99059fF775485246999027B3197955" //USDT
    let bnbToSell = web3.utils.toWei("1", "ether");
    let amountOut;
    try {
        let router = await new web3.eth.Contract(pancakeSwapAbi, pancakeSwapContract);
        amountOut = await router.methods.getAmountsOut(bnbToSell, [BNBTokenAddress, USDTokenAddress]).call();
        amountOut = web3.utils.fromWei(amountOut[1]);
    } catch (error) { }
    if (!amountOut) return 0;
    return amountOut;
}
function setDecimals(number, decimals) {
    number = number.toString();
    let numberAbs = number.split('.')[0]
    let numberDecimals = number.split('.')[1] ? number.split('.')[1] : '';
    while (numberDecimals.length < decimals) {
        numberDecimals += "0";
    }
    return numberAbs + numberDecimals;
}
/*
How it works?
This script simply comunicates with the smart contract deployed by pancakeswap and calls the main
function that was build to retrive the token prices
*/
export async function GetTokenPrice() {
    const tokenAddres = Contrats.metatoken.address; // change this with the token addres that you want to know the 
    let bnbPrice = await calcBNBPrice() // query pancakeswap to get the price of BNB in USDT
    // console.log(`CURRENT BNB PRICE: ${bnbPrice}`);
    // Them amount of tokens to sell. adjust this value based on you need, you can encounter errors with high supply tokens when this value is 1.
    let tokens_to_sell = 1;
    let priceInBnb = await calcSell(tokens_to_sell, tokenAddres) / tokens_to_sell; // calculate TOKEN price in BNB
    // console.log('SHIT_TOKEN VALUE IN BNB : ' + priceInBnb + ' | Just convert it to USD ');
    // console.log(`SHIT_TOKEN VALUE IN USD: ${priceInBnb * bnbPrice}`); // convert the token price from BNB to USD based on the retrived BNB value
    let priceInUsd = priceInBnb * bnbPrice;
    return { bnb: priceInBnb, usd: priceInUsd };
};
