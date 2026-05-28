import { Tool } from "@langchain/core/tools";
import { PharosAgentKit } from "../../agent";

export class DebugTransactionTool extends Tool {
  name = "debug_transaction";
  description = `Debug a failed transaction on Pharos Pacific Ocean Mainnet.
  
  Inputs (JSON string):
    - txHash: string, the transaction hash to debug (required)
    
  Use this when a user asks why a transaction failed, wants to decode a revert reason,
  or needs help understanding a failed smart contract call on Pharos.`;

  constructor(private pharosAgent: PharosAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { txHash } = JSON.parse(input);
      if (!txHash) throw new Error("txHash is required");
      const result = await this.pharosAgent.debugTransaction(txHash);
      return JSON.stringify({ status: "success", data: result });
    } catch (error: any) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  }
}
