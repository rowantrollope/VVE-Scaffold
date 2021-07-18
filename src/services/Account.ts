// ACCOUNTS 
export default class Account {
    address: string = "";
    balance: string = "";
    tokenBalance: number = 0;
    constructor(_address: string) {
        this.address = _address;
    }    
}
