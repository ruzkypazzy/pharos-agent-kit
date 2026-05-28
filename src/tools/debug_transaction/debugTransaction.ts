import { createPublicClient, http } from "viem";

const PHAROS_MAINNET = {
  id: 1672,
  name: "Pharos Pacific Ocean Mainnet",
  nativeCurrency: { name: "PROS", symbol: "PROS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.pharos.xyz"] },
  },
};

const client = createPublicClient({
  chain: PHAROS_MAINNET,
  transport: http(),
});

export interface DebugResult {
  txHash: string;
  status: "SUCCESS" | "FAILED" | "NOT_FOUND";
  blockNumber: string;
  gasUsed: string;
  gasLimit: string;
  contractAddress: string;
  cause: string;
  fix: string;
  explorerUrl: string;
  network: string;
}

export async function debugTransaction(txHash: string): Promise<DebugResult> {
  try {
    const receipt = await client.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt) {
      return {
        txHash,
        status: "NOT_FOUND",
        blockNumber: "N/A",
        gasUsed: "N/A",
        gasLimit: "N/A",
        contractAddress: "N/A",
        cause: "Transaction not found on Pharos mainnet",
        fix: "Check the hash or confirm it was sent to Chain ID 1672",
        explorerUrl: `https://pharosscan.xyz/tx/${txHash}`,
        network: "Pharos Pacific Ocean Mainnet (Chain ID: 1672)",
      };
    }

    const tx = await client.getTransaction({
      hash: txHash as `0x${string}`,
    });

    const gasUsed = Number(receipt.gasUsed);
    const gasLimit = Number(tx.gas);
    const success = receipt.status === "success";

    let cause = "";
    let fix = "";

    if (success) {
      cause = "Transaction executed successfully";
      fix = "No action needed";
    } else if (gasUsed >= gasLimit * 0.99) {
      cause = "OUT OF GAS - transaction consumed all provided gas";
      fix = `Increase gas limit by at least 20%. Try setting gas limit to ${Math.ceil(gasLimit * 1.3)}`;
    } else {
      cause = "TRANSACTION REVERTED - contract rejected the call";
      fix = "Common causes: insufficient balance/allowance, access control error, slippage exceeded, contract paused, or wrong arguments";
    }

    return {
      txHash,
      status: success ? "SUCCESS" : "FAILED",
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: gasUsed.toString(),
      gasLimit: gasLimit.toString(),
      contractAddress: receipt.to || "contract creation",
      cause,
      fix,
      explorerUrl: `https://pharosscan.xyz/tx/${txHash}`,
      network: "Pharos Pacific Ocean Mainnet (Chain ID: 1672)",
    };
  } catch (error: any) {
    throw new Error(`Failed to debug transaction: ${error.message}`);
  }
}
