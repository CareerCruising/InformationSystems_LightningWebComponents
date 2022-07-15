import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

//https://salesforce.stackexchange.com/questions/282646/lwc-wire-dynamically-change-the-value-being-passed-to-the-getrecord-for-fields

export default class LocalTime extends LightningElement {
    @api objectApiName;
    @api recordId;
    @track record;
    @track BillingStateCodeField;

    connectedCallback() {
        this.currentRecordId = this.recordId;
        this.currentObjectName = this.objectApiName;
        this.BillingStateCodeField = 'Account.BillingStateCode';
        if(this.objectApiName==='Case') {
            this.BillingStateCodeField = 'Case.Account.BillingStateCode';
        }
        if(this.objectApiName==='Contact') {
            this.BillingStateCodeField = 'Contact.Account.BillingStateCode';
        }
        if(this.objectApiName==='Opportunity') {
            this.BillingStateCodeField = 'Opportunity.Account.BillingStateCode';
        }  
        if(this.objectApiName==='System__c') {
            this.BillingStateCodeField = 'System__c.Account__r.BillingStateCode';
        }                
        console.log('objectApiName', this.objectApiName);
        //onsole.log('currentObjectName', this.currentObjectName);
    }    

    @wire(getRecord, { recordId: '$recordId', fields: '$BillingStateCodeField' }) accSF; 
    @track Timer1 = {Interval:66000, Progress:0,MaxRunTime: null};

    @track PageVar = {
        getRecordLoaded:false,
        fetchDataLoaded:false,
        BillingStateCodeValue:'',
        AccountLocalTime: {}    
    };

    get accSF_Loaded() {  //Repeatedly checks until true
        if(this.accSF.data !== undefined){
            if(!this.PageVar.getRecordLoaded) {
                this.PageVar.getRecordLoaded = true;
                this.acc = this.accSF.data.fields;
                this.PageVar.BillingStateCodeValue = getFieldValue(this.accSF.data, this.BillingStateCodeField);
                console.log(this.PageVar.BillingStateCodeValue);

                this.fetchData();          
                
                //Below code alerts every x seconds until we hit x seconds total
                this.Timer1.IntObj = setInterval(() => {  
                    this.Timer1.Progress = this.Timer1.Progress + this.Timer1.Interval;  
                    this.fetchData();  
                    //Use this if we want to stop after a period of time
                    if ( this.Timer1.MaxRunTime != null && this.Timer1.Progress > this.Timer1.MaxRunTime ) {  
                        clearInterval(this.Timer1.IntObj);  
                    }  
                }, this.Timer1.Progress + this.Timer1.Interval);

            }
            return true;
        } else {
            return false;
        }
            
    }

    fetchData() {
        this.PageVar.fetchDataLoaded = false;
        // Use standard Fetch API 
        fetch('https://is.xello.world/api/Integrations/AccountLocalTime?StateProv=' + this.PageVar.BillingStateCodeValue).then((response) => response.json())
            .then((jsonResponse) => {
                if(jsonResponse.AccountLocalTime != null){
                    this.PageVar.AccountLocalTime = jsonResponse.AccountLocalTime;
                    this.PageVar.fetchDataLoaded = true;  
                }
            })       
            .catch((error) => {console.log(error);});
    }




}