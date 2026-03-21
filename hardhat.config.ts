import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.28",
                settings: {
                    optimizer: { enabled: true, runs: 200 }
                }
            }
        ]
    },
    networks: {
        inEvmTestnet: {
            type: "http",
            url: process.env.INEVM_RPC_URL || "https://testnet.rpc.injective.network",
            chainId: Number(process.env.INEVM_CHAIN_ID || 1439),
            accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};

export default config;
