require('dotenv').config()
let { ethers } = require('ethers');
const { metatokenContract, providers } = require('../contracts');

const adminAddress = process.env.ADMIN_ADDRESS
const adminKey = process.env.ADMIN_KEY
const rewards = async (user, amount, price) => {
    const adminaccount = {
        publicKey: adminAddress,
        privateKey: adminKey
    }
    let rewardamount = amount * (user.level - 1) * price;
    const adminWallet = new ethers.Wallet(adminaccount.privateKey, providers[56]);
    const SignedCoinContract = metatokenContract.connect(adminWallet);
    console.log('SignedCoinContract -----------', user.address, ethers.utils.parseUnits(rewardamount.toString(), 9).toString());
    var tx = await SignedCoinContract.transfer(user.address, ethers.utils.parseUnits(rewardamount.toString(), 9));
    console.log('tx ----', tx);
    if (tx != null) {
        await tx.wait()
            .catch((err) => {
                if (err) {
                    return false
                }
            })
        return true;
    }
}
module.exports = rewards;