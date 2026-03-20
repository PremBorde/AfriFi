import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();

    const SESSION_KEY = process.env.SESSION_KEY_CONTRACT;
    const FACTORY = process.env.SMART_ACCOUNT_FACTORY;

    if (!SESSION_KEY) {
        throw new Error("SESSION_KEY_CONTRACT is required in env");
    }
    if (!FACTORY) {
        throw new Error("SMART_ACCOUNT_FACTORY is required in env");
    }

    const feeData = await ethers.provider.getFeeData();
    const minFee = ethers.parseUnits("1", "gwei");
    const overrides = {
        maxFeePerGas:
            feeData.maxFeePerGas && feeData.maxFeePerGas > minFee
                ? feeData.maxFeePerGas
                : minFee,
        maxPriorityFeePerGas:
            feeData.maxPriorityFeePerGas &&
                feeData.maxPriorityFeePerGas > minFee
                ? feeData.maxPriorityFeePerGas
                : minFee,
    };

    const factoryAbi = [
        "function createAccount(address owner) external returns (address)",
        "function accountOf(address) view returns (address)"
    ];
    const sessionAbi = [
        "function owner() view returns (address)",
        "function transferOwnership(address newOwner) external",
        "function setAuthorizedCaller(address caller, bool allowed) external",
        "function authorizedCallers(address) view returns (bool)"
    ];

    const factory = new ethers.Contract(FACTORY, factoryAbi, deployer);
    const sessionKey = new ethers.Contract(SESSION_KEY, sessionAbi, deployer);

    const currentOwner = await sessionKey.owner();
    console.log("SessionKey owner:", currentOwner);
    console.log("Factory address:", FACTORY);

    if (currentOwner.toLowerCase() !== FACTORY.toLowerCase()) {
        console.log("Transferring SessionKey ownership to factory...");
        const txOwner = await sessionKey.transferOwnership(FACTORY, overrides);
        await txOwner.wait();
        console.log("SessionKey ownership transferred to factory");
    }

    // Step 1: Create SmartAccount for deployer wallet
    console.log("Creating SmartAccount for:", deployer.address);
    const tx1 = await factory.createAccount(deployer.address, overrides);
    const receipt = await tx1.wait();
    console.log("SmartAccount created in tx:", receipt.hash);

    // Step 2: Get the smart account address
    const smartAccountAddr = await factory.accountOf(deployer.address);
    console.log("SmartAccount address:", smartAccountAddr);

    // Step 3: Verify authorization was set by factory during createAccount
    const isAuthorized = await sessionKey.authorizedCallers(smartAccountAddr);
    console.log("SmartAccount authorized:", isAuthorized);

    console.log("\n=== Add to your .env ===");
    console.log(`SMART_ACCOUNT_ADDRESS=${smartAccountAddr}`);
}

main().catch(console.error);