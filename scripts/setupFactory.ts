import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

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
        maxFeePerGas: feeData.maxFeePerGas && feeData.maxFeePerGas > minFee ? feeData.maxFeePerGas : minFee,
        maxPriorityFeePerGas:
            feeData.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas > minFee
                ? feeData.maxPriorityFeePerGas
                : minFee
    };

    // SessionKey.sol ABI — just the function we need
    const sessionKeyAbi = [
        "function setAuthorizedCaller(address caller, bool allowed) external",
        "function owner() view returns (address)"
    ];

    const sessionKey = new ethers.Contract(SESSION_KEY, sessionKeyAbi, deployer);

    const owner = await sessionKey.owner();
    console.log("SessionKey owner:", owner);
    console.log("Factory address:", FACTORY);

    // Authorize the factory to call setAuthorizedCaller
    console.log("Authorizing factory on SessionKey...");
    const tx = await sessionKey.setAuthorizedCaller(FACTORY, true, overrides);
    await tx.wait();
    console.log("Factory authorized");

    console.log("\nDone! Now the factory can create SmartAccounts.");
}

main().catch(console.error);