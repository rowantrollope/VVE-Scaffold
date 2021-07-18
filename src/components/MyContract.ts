import { Signer } from 'ethers';
import { BigNumber} from "@ethersproject/bignumber";

import ContractWrapper from "../services/ContractWrapper"

import TokenContract from '../../artifacts/contracts/Token.json';

export default class MyContract extends ContractWrapper {

    constructor(signer: Signer) {
        super(signer, TokenContract.address, TokenContract.abi);
    }

    /**
     * Transfer Tokens
     * 
     * @param dest the destination account
     * @param amount the number of token to send
     */
    async transfer (dest: string, amount: string) {
        if(this.contract !== null){
            const transaction = await this.contract.transfer(dest, amount);
            await transaction.wait();
            console.log(`MyContract::transfer() - ${amount} Coins successfully sent to ${dest}`);
        } else
            console.error("MyContract::transfer() - Not Loaded...");
    } 
    /**
     * Get the number of Tokens owned by a given account
     * 
     * @param address the account address 
     * @returns a promise to the number of tokens
     */
    async balanceOf(address: string) : Promise<number> {
        if(this.contract !== null){
            const balance: BigNumber = await this.contract.balanceOf(address);
            return balance.toNumber();

        } else {
            console.error("MyContract::balanceOf() -  Not Loaded...");
            return 0;
        }
    }

}


