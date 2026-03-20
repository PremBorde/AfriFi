import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import {
    PAYMASTER_ADDRESS,
    SMART_ACCOUNT_FACTORY,
    VAULT_ADDRESS,
    factoryAbi,
    paymasterAbi,
    smartAccountAbi,
    vaultAbi
} from "@/lib/contracts";
import { useSessionKey } from "../hooks/useSessionKey";
import InteractiveHoverButton from "@/components/ui/interactive-hover-button";

type DurationOption = 3600 | 86400;
type MaxOption = 100 | 500;

const PAIRS = ["INJ/USDT", "ETH/USDT"];
const REQUIRED_CHAIN_ID = 1439;

export default function Setup() {
    const nav = useNavigate();
    const { saveSession, remainingText, session } = useSessionKey();

    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [step, setStep] = useState(1);
    const [duration, setDuration] = useState<DurationOption>(86400);
    const [maxTrade, setMaxTrade] = useState<MaxOption>(500);
    const [pairs, setPairs] = useState<string[]>(["INJ/USDT"]);
    const [depositAmount, setDepositAmount] = useState("0.1");
    const [sessionAddress, setSessionAddress] = useState("");
    const [stakeInj, setStakeInj] = useState("0.02");
    const [sponsorInj, setSponsorInj] = useState("0.10");
    const [fundingBusy, setFundingBusy] = useState(false);
    const [depositBusy, setDepositBusy] = useState(false);

    const networkText = useMemo(() => (provider ? "inEVM Testnet" : "not connected"), [provider]);

    async function connectWallet() {
        const eth = (window as any).ethereum;
        if (!eth) {
            alert("MetaMask is required");
            return;
        }

        try {
            const next = new ethers.BrowserProvider(eth);
            await next.send("eth_requestAccounts", []);

            // ✅ Check correct network
            const network = await next.getNetwork();
            if (Number(network.chainId) !== REQUIRED_CHAIN_ID) {
                // Try to switch automatically
                try {
                    await eth.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x59F" }], // 1439 in hex
                    });
                } catch (switchErr: any) {
                    // Chain not added yet — add it
                    if (switchErr.code === 4902) {
                        await eth.request({
                            method: "wallet_addEthereumChain",
                            params: [{
                                chainId: "0x59F",
                                chainName: "Injective EVM Testnet",
                                nativeCurrency: {
                                    name: "INJ",
                                    symbol: "INJ",
                                    decimals: 18
                                },
                                rpcUrls: ["https://k8s.testnet.json-rpc.injective.network"],
                                blockExplorerUrls: ["https://testnet.blockscout.injective.network"]
                            }]
                        });
                    }
                }
            }

            const signer = await next.getSigner();
            const address = await signer.getAddress();
            setProvider(next);
            setWalletAddress(address);
            setStep(2);

        } catch (err: any) {
            console.error("Connect failed:", err);
            alert(`Connection failed: ${err.message}`);
        }
    }

    // ✅ FIXED: Use native INJ deposit instead of USDT ERC-20
    async function depositUSDT() {
        if (!provider) {
            alert("Connect MetaMask first");
            return;
        }

        setDepositBusy(true);
        try {
            const signer = await provider.getSigner();

            // Verify correct network
            const network = await provider.getNetwork();
            if (Number(network.chainId) !== REQUIRED_CHAIN_ID) {
                alert(`Wrong network!\n\nPlease switch MetaMask to:\nNetwork: Injective EVM Testnet\nChain ID: 1439\nRPC: https://k8s.testnet.json-rpc.injective.network`);
                return;
            }

            if (!VAULT_ADDRESS) {
                alert("VITE_VAULT_CONTRACT not set in frontend/.env");
                return;
            }

            const amount = depositAmount || "0.1";
            console.log(`Depositing ${amount} INJ to vault: ${VAULT_ADDRESS}`);

            // Send native INJ directly to vault
            const tx = await signer.sendTransaction({
                to: VAULT_ADDRESS,
                value: ethers.parseEther(amount),
                gasLimit: 100000,
            });

            console.log("Deposit tx sent:", tx.hash);
            await tx.wait();
            console.log("Deposit confirmed:", tx.hash);
            setStep(3);

        } catch (err: any) {
            console.error("Deposit failed:", err);
            alert(`Deposit failed: ${err.message}`);
        } finally {
            setDepositBusy(false);
        }
    }

    async function configureSessionKey() {
        if (!provider) return;
        try {
            const signer = await provider.getSigner();
            const owner = await signer.getAddress();
            console.log("Owner wallet:", owner);

            const factory = new ethers.Contract(
                SMART_ACCOUNT_FACTORY,
                factoryAbi,
                signer
            );

            // Check existing account
            let account: string = await factory.accountOf(owner);
            console.log("Existing SmartAccount:", account);

            if (account === ethers.ZeroAddress) {
                console.log("No SmartAccount yet — creating one...");
                const tx = await factory.createAccount(owner);
                const receipt = await tx.wait();
                console.log("createAccount tx:", receipt.hash);

                // ✅ Fetch account address again after creation
                account = await factory.accountOf(owner);
                console.log("New SmartAccount:", account);
            }

            if (account === ethers.ZeroAddress) {
                throw new Error("SmartAccount creation failed — address still zero");
            }

            // Generate ephemeral session key
            const ephemeral = ethers.Wallet.createRandom();
            console.log("Session key address:", ephemeral.address);

            const allowedPairHashes = pairs.map((p) =>
                ethers.keccak256(ethers.toUtf8Bytes(p))
            );

            // ✅ Use inline ABI to avoid any mismatch
            const smartAccount = new ethers.Contract(
                account,
                [
                    "function owner() view returns (address)",
                    "function createSessionKey(address key, uint256 durationSeconds, uint256 maxTradeSize, bytes32[] calldata allowedPairs) external",
                    "function setSessionKeyStore(address) external"
                ],
                signer
            );

            // Verify owner before calling
            const storedOwner = await smartAccount.owner();
            console.log("SmartAccount owner:", storedOwner);
            console.log("My wallet:         ", owner);

            if (storedOwner.toLowerCase() !== owner.toLowerCase()) {
                throw new Error(
                    `Owner mismatch!\nSmartAccount owner: ${storedOwner}\nYour wallet: ${owner}\nRedeploy contracts with your wallet as deployer.`
                );
            }

            // ✅ Create session key on-chain
            const tx = await smartAccount.createSessionKey(
                ephemeral.address,
                duration,
                ethers.parseUnits(String(maxTrade), 6),
                allowedPairHashes
            );
            await tx.wait();
            console.log("Session key registered on-chain ✅");

            // Save locally
            const expiry = Date.now() + duration * 1000;
            saveSession({
                privateKey: ephemeral.privateKey,
                address: ephemeral.address,
                expiry,
                maxTradeSize: maxTrade,
                allowedPairs: pairs
            });

            setSessionAddress(ephemeral.address);
            setStep(4);
            console.log("Setup complete! Session expires:", new Date(expiry).toLocaleString());

        } catch (err: any) {
            console.error("Session key failed:", err);
            alert(`Session key setup failed: ${err.message}`);
        }
    }

    async function addPaymasterStake() {
        if (!provider || !PAYMASTER_ADDRESS) {
            alert("Set VITE_PAYMASTER_CONTRACT in frontend env.");
            return;
        }
        setFundingBusy(true);
        try {
            const signer = await provider.getSigner();
            const paymaster = new ethers.Contract(PAYMASTER_ADDRESS, paymasterAbi, signer);
            const tx = await paymaster.addStake(86400, {
                value: ethers.parseEther(stakeInj || "0")
            });
            await tx.wait();
            alert("Stake added to paymaster.");
        } catch (err: any) {
            alert(`Stake failed: ${err.message}`);
        } finally {
            setFundingBusy(false);
        }
    }

    async function depositPaymasterGas() {
        if (!provider || !PAYMASTER_ADDRESS) {
            alert("Set VITE_PAYMASTER_CONTRACT in frontend env.");
            return;
        }
        setFundingBusy(true);
        try {
            const signer = await provider.getSigner();
            const paymaster = new ethers.Contract(PAYMASTER_ADDRESS, paymasterAbi, signer);
            const tx = await paymaster.depositToEntryPoint({
                value: ethers.parseEther(sponsorInj || "0")
            });
            await tx.wait();
            alert("Paymaster deposit funded.");
        } catch (err: any) {
            alert(`Deposit failed: ${err.message}`);
        } finally {
            setFundingBusy(false);
        }
    }

    function togglePair(pair: string) {
        setPairs((prev) =>
            prev.includes(pair) ? prev.filter((x) => x !== pair) : [...prev, pair]
        );
    }

    return (
        <div className="space-y-4">
            <section className="panel p-6 animate-rise">
                <h2 className="text-2xl font-bold">Session Setup</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                    One-time deposit and key setup. Then trade without MetaMask popups.
                </p>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                {/* STEP 1 */}
                <div className="panel p-5">
                    <div className="mb-4 text-sm uppercase tracking-widest text-[var(--text-dimmed)]">Step 1</div>
                    <InteractiveHoverButton
                      text="Connect Wallet"
                      loadingText="Connecting..."
                      successText="Connected"
                      onClick={() => connectWallet()}
                      classes="h-11"
                    />
                    <p className="mt-3 text-sm">
                        Wallet: <span className="font-mono">{walletAddress || "-"}</span>
                    </p>
                    <p className="text-sm">
                        Network: <span className="font-mono">{networkText}</span>
                    </p>
                    {/* ✅ Show warning if wrong network */}
                    {provider && (
                        <p className="mt-2 text-xs text-amber-400">
                            Make sure MetaMask shows "Injective EVM Testnet" (Chain 1439)
                        </p>
                    )}
                </div>

                {/* STEP 2 */}
                <div className="panel p-5">
                    <div className="mb-4 text-sm uppercase tracking-widest text-[var(--text-dimmed)]">Step 2</div>
                    {/* ✅ Changed label from USDT to INJ */}
                    <label className="block text-sm text-[var(--text-muted)]">
                        Deposit INJ (native token)
                    </label>
                    <input
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg-card)] px-3 py-2 font-mono"
                        placeholder="0.1"
                    />
                    <p className="mt-1 text-xs text-[var(--text-dimmed)]">
                        You have ~10.99 INJ testnet tokens available
                    </p>
                    <InteractiveHoverButton
                        text="Deposit (only popup step)"
                        loadingText="Depositing..."
                        successText="Deposited"
                        onClick={() => depositUSDT()}
                        disabled={depositBusy || step < 2}
                        classes="mt-3 h-11 border-accent/40 bg-accent/20 text-accent disabled:opacity-40"
                    />
                </div>
            </section>

            {/* OWNER ACTION - Fund Paymaster */}
            <section className="panel p-5">
                <div className="mb-4 text-sm uppercase tracking-widest text-[var(--text-dimmed)]">Owner Action</div>
                <h3 className="text-lg font-semibold">Fund Paymaster</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    This requires the paymaster owner wallet. It uses MetaMask popups.
                </p>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                        <label className="block text-sm text-[var(--text-muted)]">Stake Amount (INJ)</label>
                        <input
                            value={stakeInj}
                            onChange={(e) => setStakeInj(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg-card)] px-3 py-2 font-mono"
                        />
                        <InteractiveHoverButton
                            text="Add Stake (1 day)"
                            loadingText="Staking..."
                            successText="Staked"
                            onClick={() => addPaymasterStake()}
                            disabled={fundingBusy}
                            classes="mt-3 h-11 border-amber-400/40 bg-amber-400/20 text-amber-400 disabled:opacity-40"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[var(--text-muted)]">Gas Deposit (INJ)</label>
                        <input
                            value={sponsorInj}
                            onChange={(e) => setSponsorInj(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg-card)] px-3 py-2 font-mono"
                        />
                        <InteractiveHoverButton
                            text="Deposit Sponsor Gas"
                            loadingText="Depositing..."
                            successText="Deposited"
                            onClick={() => depositPaymasterGas()}
                            disabled={fundingBusy}
                            classes="mt-3 h-11 border-accent/40 bg-accent/20 text-accent disabled:opacity-40"
                        />
                    </div>
                </div>
            </section>

            {/* STEP 3 - Session Key Config */}
            <section className="panel p-5">
                <div className="mb-4 text-sm uppercase tracking-widest text-[var(--text-dimmed)]">Step 3</div>
                <div className="grid gap-4 lg:grid-cols-3">
                    <div>
                        <p className="mb-2 text-sm">Duration</p>
                        <div className="flex gap-2">
                            {[3600, 86400].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d as DurationOption)}
                                    className={`rounded-lg px-3 py-1.5 ${duration === d ? "bg-accent/20 text-accent" : "bg-[var(--bg-card)] border border-[var(--card-border)]"}`}
                                >
                                    {d === 3600 ? "1h" : "24h"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 text-sm">Max Trade Size</p>
                        <div className="flex gap-2">
                            {[100, 500].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMaxTrade(m as MaxOption)}
                                    className={`rounded-lg px-3 py-1.5 ${maxTrade === m ? "bg-accent/20 text-accent" : "bg-[var(--bg-card)] border border-[var(--card-border)]"}`}
                                >
                                    {m} INJ
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 text-sm">Allowed Pairs</p>
                        <div className="flex flex-wrap gap-2">
                            {PAIRS.map((pair) => (
                                <label
                                    key={pair}
                                    className="flex items-center gap-2 rounded-lg bg-[var(--bg-card)] px-3 py-1.5 border border-[var(--card-border)]"
                                >
                                    <input
                                        type="checkbox"
                                        checked={pairs.includes(pair)}
                                        onChange={() => togglePair(pair)}
                                    />
                                    <span>{pair}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <InteractiveHoverButton
                    text="Generate Session Key"
                    loadingText="Generating..."
                    successText="Key Generated"
                    onClick={() => configureSessionKey()}
                    disabled={step < 3}
                    classes="mt-4 h-11 bg-accent text-accent-foreground disabled:opacity-40"
                />
                {step < 3 && (
                    <p className="mt-2 text-xs text-[var(--text-dimmed)]">Complete deposit first to unlock this step</p>
                )}
            </section>

            {/* STEP 4 - Done */}
            <section className="panel p-5">
                <div className="mb-4 text-sm uppercase tracking-widest text-[var(--text-dimmed)]">Step 4</div>
                <p className="text-lg font-semibold text-accent">Setup complete</p>
                <p className="mt-1 text-sm">
                    Session key: <span className="font-mono text-xs">{sessionAddress || session?.address || "-"}</span>
                </p>
                <p className="mt-1 text-sm">
                    Countdown: <span className="font-mono">{remainingText}</span>
                </p>
                <InteractiveHoverButton
                    text="Open trading terminal →"
                    loadingText="Opening..."
                    successText="Opened"
                    onClick={() => nav("/terminal")}
                    disabled={step < 4}
                    classes="mt-4 h-11 border-[var(--card-border)] bg-[var(--bg-card)] disabled:opacity-40"
                />
            </section>

            <p className="text-xs text-[var(--text-dimmed)]">Current step: {step}/4</p>
        </div>
    );
}