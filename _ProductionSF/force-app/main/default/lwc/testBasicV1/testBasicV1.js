//Decide here what to use api / wire / track
import { LightningElement, api, track } from 'lwc';

export default class TestBasicV1 extends LightningElement {    
    @api recordId;
    @api objectApiName;
    fields = [
        'Id'
        ,'Name'
        ,'Amount'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
    ];

    @track showPopver = false;
    show() {
        this.showPopver = true;
    }
    hide() {
        this.showPopver = false;
    }
    handleClose() {
        console.log('handleClose',this.showPopver)
        this.showPopver = false;
    }

    SimpleTable = [
        { label: 'Last 24 months', value: '24' },
        { label: 'Last 12 months', value: '12' },
        { label: 'Last 6 months', value: '6' },
        { label: 'Last 3 months', value: '3' },
    ];
    
    get MyData() {  //Forces call from HTML
        return SimpleTable;     
    }

    get PageInititated() {  //Forces call from HTML

        console.log(this.recordId);
        console.log(this.SimpleTable[0].label);
        return true;
            
    }

    RunSomeCode() {
        console.log(this.recordId);
    }   

    connectedCallback() {
        this.RunSomeCode(); //This can run before the record info is even loaded
    }
}