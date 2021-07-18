<template>
    
<div class="page-header">Tokens SmartContract</div>
<div v-if="loaded">
    
    <!-- Token Transfer Amount and action buttons -->
    <div class="text-left text-sm lg:text-base mx-5 space-y-1 p-2">
        <div class="flex space-x-2 items-center">
            <span class="whitespace-nowrap">Send:</span><input class="input-field" type="number" v-model="amountToSend" name="amountToSend" id="amountToSend" autocomplete="amountToSend" min="1"/>
            <span>Tokens</span>
            <button :class="amountToSend === 0 ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-400'" 
                class="flex-grow btn" type="button" @click="onSend()">
                Send
            </button>
            <button class="flex-grow bg-blue-500 hover:bg-blue-400 btn" type="button" @click="onTest()">Test</button>
        </div>
    </div>

    <!-- From and TO Accounts -->
    <div class="sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 space-y-2 text-left md:text-base text-xs mx-7 mt-5">
        <div class="card text-green-600 border-green-600 ">
            <div class="card-header bg-gray-300 border-green-600 ">FROM</div>
            <div class="text-sm lg:text-base truncate px-2 space-y-2 mt-3 pb-2">
                {{ source.address }}
            </div>  
        </div>

        <div class="card text-blue-500 border-blue-500">
            <div class="card-header bg-gray-300 border-blue-500">TO</div>
            <div class="px-2 space-y-2 mt-2 pb-2">
                <div class="text-sm lg:text-base items-center space-x-2">
                    <!-- <span>Account:</span>
                    <input type="text" v-model.lazy="dest.address" name="dest_account" id="dest_account" autocomplete="dest_account" 
                    class="w-full input-field" />-->
                    <span class=""> 
                        <Account_ListBox :accounts="accounts" v-model="dest" @update:modelValue="onUpdateDest"/>
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Account list -->
    <div class="px-7 mt-5">

        <div class="flex flex-col">
            <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="col-header">
                                Account Number
                            </th>
                            <th scope="col" class="col-header">
                                Ether Balance
                            </th>
                            <th scope="col" class="col-header">
                                Token Balance
                            </th>
                            <th scope="col" class="relative px-6 py-3">
                                <span class="sr-only">Edit</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(account, accountIdx) in accounts" :key="account.address" 
                            class=" hover:bg-blue-100"
                            :class="[accountIdx % 2 ? '' : '', 
                                     accountSelected(account) === SelectedAccount.From ? 'row-from' : '',
                                     accountSelected(account) === SelectedAccount.To ? 'row-to' : '']"
                            @click="onSelectItem(account)">
    
                            <td class="row-text font-medium text-gray-900">
                                {{ account.address }}
                            </td>
                            <td class="row-text text-gray-500">
                                {{ ethers.utils.commify(account.balance) }}
                            </td>
                            <td class="row-text text-gray-500">
                                {{ ethers.utils.commify(account.tokenBalance) }}
                            </td>
                            <td class="row-text text-right">
                            <div v-if="accountSelected(account) !== SelectedAccount.None" href="#" 
                                class="hover:text-indigo-900 rounded-full text-center text-white w-16 shadow-md p-1"
                                :class="accountSelected(account) === SelectedAccount.From ? 'bg-green-500' : 'bg-blue-500'">
                                {{ accountSelected(account) }}
                            </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { onBeforeMount, watch, reactive, ref } from 'vue';
import { ethers } from 'ethers';

import Account_ListBox from './Acccount_ListBox.vue'

import Account from '../services/Account'
import BlockchainConnect from '../services/BlockchainConnect';
import MyContract from './MyContract';

const hardhatAccounts = [
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
    "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
]

let dest: Account = reactive ( new Account(hardhatAccounts[1]) );
let source: Account = reactive ( new Account("") ); 
let accounts: Array<Account> = [];
const amountToSend = ref(0);

const maxAmount = watch(() => amountToSend.value, (amount, prevAmount) => {
    if(amount > source.tokenBalance)
        amountToSend.value = source.tokenBalance;
});


// BLOCKCHAIN connection and prep
let bc: BlockchainConnect;
let token: MyContract;

const loaded = ref(false);

enum SelectedAccount {
    None="",
    From="From",
    To="To",
};

const accountSelected = (account: Account): SelectedAccount => {
    if(account.address.toLowerCase() === dest.address.toLowerCase())
        return SelectedAccount.To;
    else if(account.address.toLowerCase() === source.address.toLowerCase())
        return SelectedAccount.From;
    else
        return SelectedAccount.None;
}

const mounted = onBeforeMount(() => connect());

const connect = async () => {
    
    bc = new BlockchainConnect();

    await bc.connect();

    if(bc.signer)
        token = new MyContract(bc.signer);
    else
        console.error("BC::connect() - Unable to connect to blockchain");
    
    source.address = bc.account;
    
    bc.setOnChange((account: string) => { 
        console.log("Accounts Changed from: to: ", source.address, account.address);
        source.address = account;
        updateBalance(source);
    });

    // ADD the default hardhat accounts
    for (const address of hardhatAccounts) 
        accounts.push(reactive(new Account(address))); 

    loaded.value = true;
    updateBalances();
}

const destChanged = watch(() => dest.address, () => {
    console.log("BC::destChanged() - New Destination Address: ", dest.address)
    updateBalances();
});

const updateBalances = async () => {

    for (const account of accounts) updateBalance(account);
    updateBalance(source);
    updateBalance(dest);
}

const updateBalance = async (account: Account) => {
    account.balance = await bc.getBalanceEther(account.address, 3);
    account.tokenBalance = await token.balanceOf(account.address);
}

const onSelectItem = (account: Account) => {
    console.log("OnSelectItem() - Account: ", account.address);
    if(source.address.toLowerCase() != account.address.toLowerCase()) 
        Object.assign(dest, account);
}

const onUpdateDest = (account: Account) => {
    console.log("onUpdateDest() - Account: ", account.address);
    if(source.address.toLowerCase() != account.address.toLowerCase()) 
        Object.assign(dest, account);
}

const onSend = async () => {
    if(amountToSend.value === 0)
        return;

    if(amountToSend.value > source.tokenBalance) {
        console.error("BC:onSend Error: sending too many tokens, balance is", source.tokenBalance);
        window.alert(`Too many tokens! Account ${source.address} has ${source.tokenBalance} tokens`);
        return
    }

    await token.transfer(dest.address, amountToSend.value.toString());

    console.log(`BC::onSend() - ${amountToSend.value} Coins successfully sent to ${dest.address}`);
         
    await updateBalances();
    
    // reset 
    if(amountToSend.value > source.tokenBalance)
        amountToSend.value = source.tokenBalance; 
}

const onTest = async () => {
}

</script>

<style scoped>
    .btn {
        @apply 
        rounded-md 
        text-white 
        p-2 
        text-sm
        lg:text-lg
        shadow-sm
    }
    .input-field {
       @apply 
       p-1 
       border  
       min-w-0 
       rounded-md 
       border-gray-300
       focus:ring-indigo-500 
       focus:border-indigo-500; 
    }
    .page-header {
        @apply text-2xl uppercase tracking-wider font-extralight p-2 mb-2 bg-gray-900 text-white text-center;
    }
    .card {
        @apply text-sm lg:text-lg border-b border-l border-r rounded-md;
    }
    .card-header {
        @apply text-black p-2 border-t rounded-t-md;
    }
    .row {
        @apply bg-gray-100;
    }
    .row-text {
        @apply px-6 py-4 whitespace-nowrap md:text-sm text-xs;
    }
    .row-from {
        @apply  bg-green-100; 
    }
    .row-to {
        @apply  bg-blue-100; 
    }
    .col-header {
        @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
    }
</style>
