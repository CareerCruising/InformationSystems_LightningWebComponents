import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class AccountLocalTime extends NavigationMixin(LightningElement) {

    @api objectApiName;
    @api recordId;
    @track record;
    @wire(getRecord, { recordId: '$recordId', fields: [
        'Account.BillingStateCode'
        ,'Account.TimeZoneDifferenceGMT__c'
        ,'Account.System__c'
        ,'Account.System__r.Name'
        ,'Account.System__r.System_Status__c'
        ,'Account.Parent.System__c'
        ,'Account.Parent.System__r.Name'
        ,'Account.Parent.System__r.System_Status__c'
    ] }) accSF; 
    @track Timer1 = {Interval:61000, Progress:0,MaxRunTime: null};
    @track JavaTime = {};
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
                    
                    const ClientTime = new Date();  
                    ClientTime.setHours(ClientTime.getHours() + this.JavaTime.LocalDelta);
                    this.JavaTime.ClientTime = ClientTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

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

                    //We only want to execute a call to the server once, then compare ClientTime with BrowserTime and update in javascript every minute
                    const date1 = new Date();                    
                    const date2 = new Date(jsonResponse.AccountLocalTime.LocalDateTime); // ClientTime
                    const diffInMilliseconds = date2.getTime() - date1.getTime();
                    const diffInHours = Math.round(diffInMilliseconds / (1000 * 60 * 60));
                    this.JavaTime.LocalDelta = diffInHours;
                    
                    const ClientTime = new Date();  
                    ClientTime.setHours(ClientTime.getHours() + this.JavaTime.LocalDelta);
                    this.JavaTime.ClientTime = ClientTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

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