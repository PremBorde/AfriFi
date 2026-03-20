export const ENTRYPOINT = process.env.NEXT_PUBLIC_ENTRYPOINT || "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT || "";
export const SESSION_KEY_CONTRACT = process.env.NEXT_PUBLIC_SESSION_KEY_CONTRACT || "";
export const SMART_ACCOUNT_FACTORY = process.env.NEXT_PUBLIC_SMART_ACCOUNT_FACTORY || "";
export const PAYMASTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMASTER_CONTRACT || "";

export const vaultAbi = [
    "function deposit(address token, uint256 amount)",
    "function getBalance(address user, address token) view returns (uint256)",
    "function executeTrade(address user, bytes32 pair, uint256 qty, uint8 side)",
    "function withdraw(address token, uint256 amount)",
    "function settleTradeRecord(address user, bytes32 pair, uint256 qty, uint8 side, string txHash)",
    "event TradeRequested(address user, bytes32 pair, uint256 qty, uint8 side, uint256 timestamp)",
    "event TradeSettled(address user, bytes32 pair, uint256 qty, uint8 side, string txHash)"
];

export const sessionKeyAbi = [
    "function createSessionKey(address key, uint256 durationSeconds, uint256 maxTradeSize, bytes32[] allowedPairs)",
    "function revokeSessionKey(address key)",
    "function sessionKeys(address key) view returns (uint256 expiry, uint256 maxTradeSize, bytes32[] allowedPairs, bool active)",
    "function isValidSessionKey(address key, bytes32 pair, uint256 amount) view returns (bool)"
];

export const factoryAbi = [
    "function createAccount(address owner) returns (address account)",
    "function accountOf(address owner) view returns (address)"
];

export const smartAccountAbi = [
    "function createSessionKey(address key, uint256 durationSeconds, uint256 maxTradeSize, bytes32[] allowedPairs)",
    "function revokeSessionKey(address key)",
    "function execute(address to, uint256 value, bytes data)",
    "function nonce() view returns (uint256)"
];

export const erc20Abi = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
];

export const paymasterAbi = [
    "function addStake(uint32 unstakeDelaySec) payable",
    "function depositToEntryPoint() payable",
    "function getDeposit() view returns (uint256)"
];
