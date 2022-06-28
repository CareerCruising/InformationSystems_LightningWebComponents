import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class AccountLocalTime extends NavigationMixin(LightningElement) {

    @api recordId;
    @track record;
    @wire(getRecord, { recordId: '$recordId', fields: [
        'Account.BillingStateCode'
        ,'Account.System__c'
        ,'Account.System__r.Name'
        ,'Account.System__r.System_Status__c'
        ,'Account.Parent.System__c'
        ,'Account.Parent.System__r.Name'
        ,'Account.Parent.System__r.System_Status__c'
    ] }) accSF; 
    @track Timer1 = {Interval:66000, Progress:0,MaxRunTime: null};

    @track PageVar = {
        getRecordLoaded:false,
        fetchDataLoaded:false,
        AccountLocalTime: {}    
    };

    @track System = {
        Id:null,
        Name:null,
        Status:null,
        Visible: false
    };

    get accSF_Loaded() {  //Repeatedly checks until true
        if(this.accSF.data !== undefined){
            if(!this.PageVar.getRecordLoaded) {
                this.PageVar.getRecordLoaded = true;
                this.acc = this.accSF.data.fields;

                if(getFieldValue(this.accSF.data, 'Account.System__c') != null) {
                    this.System.Id = getFieldValue(this.accSF.data, 'Account.System__c');
                    this.System.Name = getFieldValue(this.accSF.data, 'Account.System__r.Name');
                    this.System.Status = getFieldValue(this.accSF.data, 'Account.System__r.System_Status__c');
                    this.System.Visible = true;
                } else if(getFieldValue(this.accSF.data, 'Account.Parent.System__c') != null) {
                    this.System.Id = getFieldValue(this.accSF.data, 'Account.Parent.System__c');
                    this.System.Name = getFieldValue(this.accSF.data, 'Account.Parent.System__r.Name');
                    this.System.Status = getFieldValue(this.accSF.data, 'Account.Parent.System__r.System_Status__c');
                    this.System.Visible = true;
                }
                //console.log(this.acc);
                //console.log(this.acc.Parent.System__c);
                //console.log(getFieldValue(this.accSF.data, 'Account.Parent.System__r.System_Status__c'));
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
        fetch('https://is.xello.world/api/Integrations/AccountLocalTime?StateProv=' + this.acc.BillingStateCode.value).then((response) => response.json())
            .then((jsonResponse) => {
                if(jsonResponse.AccountLocalTime != null){
                    this.PageVar.AccountLocalTime = jsonResponse.AccountLocalTime;
                    this.PageVar.fetchDataLoaded = true;  
                }
            })       
            .catch((error) => {console.log(error);});
    }

    navigateToSystem() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.System.Id,
                actionName: 'view',
            },
        });
    } 

}