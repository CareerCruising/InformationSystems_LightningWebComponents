import { LightningElement, track } from 'lwc';
import searchAccounts from '@salesforce/apex/SearchAccountController.searchAccount';

const columnList = [
    {label: 'Id', fieldName: 'Id'},
    {label: 'Name', fieldName: 'Name'},
    {label: 'State', fieldName: 'BillingState'},
    {label: 'Phone', fieldName: 'Phone'}
];

export default class LightningDataTable extends LightningElement {
    @track accountList;
    @track columnList = columnList;
    @track noRecordsFound = true;

    findAccountResult(event) {
        const accName = event.target.value;

        if(accName) {
            searchAccounts ( {accName}) 
            .then(result => {
                this.accountList = result;
                this.noRecordsFound = false;
                
            })
        } else {
            this.accountList = undefined;
            this.noRecordsFound = true;
        }

        console.log('accountList ===> '+JSON.stringify(this.accountList));
    }

}