import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Wallet } from "zksync-web3";
import { assert } from "chai";
// load env file
import dotenv from "dotenv";

dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY) 
    throw "⛔️ Private key not detected! Add it to the .env file!";


export default async function (hre: HardhatRuntimeEnvironment) {
    console.log("Running deploy script for the albicodesSBT contract...");
    // It is assumed that this wallet already has sufficient funds on zkSync
    const wallet = new Wallet(PRIVATE_KEY);
    const deployer = new Deployer(hre, wallet);

    const baseNFT = "https://ipfs.io/ipfs/QmXJyiiJSvVgfzMTXHFkyGoeS31ipjkqJzx5dR5vowCKD1";

    // Deploying the ERC721 contract
    const nftContractArtifact = await deployer.loadArtifact("albicodesSBT");
    // const nftContract = await deployer.deploy(nftContractArtifact);
    const nftProxy = await hre.zkUpgrades.deployProxy(deployer.zkWallet, nftContractArtifact);
    // The deployProxy method deploys your implementation contract on zkSync Era, deploys the proxy admin contract, and finally, deploys the transparent proxy.
    
    console.log(`NFT Contract address: ${nftProxy.address}`);
    const recipientAddress = wallet.address;

    // Mint NFTs to the recipient address
    const tx = await nftProxy.mintTo(recipientAddress, baseNFT);
    await tx.wait();
    console.log(`The NFT has been given to ${recipientAddress}`);

    // Get and log the balance of the recipient
    const balance = await nftProxy.balanceOf(recipientAddress);
    console.log(`Balance of the recipient: ${balance}`);
    console.log(`Done!`);

    await nftProxy.deployed();
    console.log("albicodesSBT deployed to: ", nftProxy.address)
}