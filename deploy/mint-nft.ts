require("dotenv").config()

import * as fs from "fs";
import * as zk from "zksync-web3";

import { HardhatRuntimeEnvironment, HttpNetworkConfig } from "hardhat/types";

import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet } from "zksync-web3";
import { assert } from "chai";
// load env file
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
// const NFT_COLLECTION_ADDRESS = "0x63f9283B1CD122ff451Aa632B6C2A29d6f98b977"

//-> mainnet that worked for everyone
// const NFT_COLLECTION_ADDRESS = "0xE482ACc8Dc5e177C5dFc94b4b1be29881fd3bf03"  // soulBTV2
const NFT_COLLECTION_ADDRESS = "0x6cb6E37919D1cE7DAD46345e684e1cd9b0aa3F3e"

// const NFT_COLLECTION_ADDRESS = "0xb882E331c756Fa73ba28ba818AaBA0791E72B832"

// testnet contract, verified
// const NFT_COLLECTION_ADDRESS = "0x11967F593C1c89be0026d15f63741CDB6AcC5b47"


// const NFT_COLLECTION_ADDRESS = "0x02C4a589c6fa1E147eE88C1cbEaa2b484946EF79"



export default async function (hre: HardhatRuntimeEnvironment) {
    console.log(`Running deploy script for the soul BT contract`);
  
    let url = ((hre.network.config) as HttpNetworkConfig).url
    console.log(`Running deploy script for the surfer Soul Bound contract - ${url}...`);
    const provider = new zk.Provider(url);

    const image = "https://ipfs.io/ipfs/QmXJyiiJSvVgfzMTXHFkyGoeS31ipjkqJzx5dR5vowCKD1";

    // Initialize the wallet.
    const wallet = new Wallet(PRIVATE_KEY);

    // Create deployer object and load the artifact of the contract you want to deploy.
    const deployer = new Deployer(hre, wallet);

    const surferNFTContractArtifact = await deployer.loadArtifact("albicodesSBT");

    const nftContract = new zk.Contract(NFT_COLLECTION_ADDRESS, surferNFTContractArtifact.abi, wallet.connect(provider));
    
    if (!nftContract)
      throw "⛔️ contractAddress not detected! Add it to the contractAddress variable!";

    console.log(`Checking balance of the ${wallet.address} on ${NFT_COLLECTION_ADDRESS}`);
    let balance = await nftContract.balanceOf(wallet.address);
    console.log(`NFT Balance is ${balance}`);

    // assert(balance == 2);

    // Reading the recipients addresses to mint NFTs to
    const recipientData = fs.readFileSync(path.join(__dirname, 'recipients.json'), 'utf-8');
    const { addresses } = JSON.parse(recipientData);

    if(!Array.isArray(addresses) || addresses.length === 0) {
        console.log('Invalid recipient addresses or empty list.');
        return;
    }

    // Get each address from the recipient
    for(const RECIPIENT_ADDRESS of addresses) {
        try {
            const tx = await nftContract.mintTo(RECIPIENT_ADDRESS, image);
            await tx.wait();
            
            console.log(`The zkSync Era has been given to ${RECIPIENT_ADDRESS}`);
            // console.log(`The tokenURI call ${await nftContract.tokenURI(image)}`);
        } catch (error) {
            console.log(`Failed to send transaction to ${RECIPIENT_ADDRESS}. Error: `, error);
        }
    }
}