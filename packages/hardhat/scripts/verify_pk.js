const ethers = require("ethers");
const pk = "0x16f1fefb80f0ddfa8c1d4818ab783b6175b34cb47857c946a2c6d8b3ca0c50e1";
const wallet = new ethers.Wallet(pk);
console.log("Wallet address:", wallet.address);
