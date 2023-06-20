import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { NavigationMixin } from 'lightning/navigation';
import NeedsAnalysisFromAccountId from'@salesforce/apex/NeedsAnalysis.FindFirstFromAccountId';

export default class QuickLinksTimeZone extends NavigationMixin(LightningElement) {
    @api objectApiName;
    @api recordId;
    @track record;
    @track AccountFields = [];
    @track accSF = {Loaded: false};  
    @track ClientTime = {Display:'', TimeZoneHourDelta: 0} ;
    @track System = {
        Id:null,
        Name:null,
        Status:null,
        Visible: false
    };
    @track Needs = {Visible: false};    
    @track PageVar = {
        AccountInfoLoaded:false,
        NeedsAnalysisLoaded:false
    };

    connectedCallback() {
        this.currentRecordId = this.recordId;
        this.currentObjectName = this.objectApiName;

        //These are the fields we want from the Account object
        this.AccountFields = [
            'Account.Id'
            ,'Account.BillingStateCode'
            ,'Account.TimeZoneDifferenceGMT__c'
            ,'Account.System__c'
            ,'Account.System__r.Name'
            ,'Account.System__r.System_Status__c'
            ,'Account.Parent.System__c'
            ,'Account.Parent.System__r.Name'
            ,'Account.Parent.System__r.System_Status__c'
        ];

        //IF it's not the account Object, then replace the strings with the related object names
        if(this.objectApiName==='Case') {
            this.AccountFields = this.AccountFields.map(field => field.replace('Account.', 'Case.Account.'));
        }
        if(this.objectApiName==='Contact') {
            this.AccountFields = this.AccountFields.map(field => field.replace('Account.', 'Contact.Account.'));
        }
        if(this.objectApiName==='Opportunity') {
            this.AccountFields = this.AccountFields.map(field => field.replace('Account.', 'Opportunity.Account.'));
        }  
        if(this.objectApiName==='System__c') {
            this.AccountFields = this.AccountFields.map(field => field.replace('Account.', 'System__c.Account__r.'));
        }
        if(this.objectApiName==='Lead') {
            this.AccountFields = this.AccountFields.map(field => field.replace('Account.', 'Lead.AccountLink__r.'));
        }                        
        console.log('objectApiName:', this.objectApiName, ' AccountFields:', this.AccountFields);
        //onsole.log('currentObjectName', this.currentObjectName);
    }    

    //This gets called first
    @wire(getRecord, { recordId: '$recordId', fields: '$AccountFields' 
    }) accSF({data, error}){
        if (data) {
            this.accSF.data = data;
            this.accSF.AccountId = getFieldValue(this.accSF.data, this.AccountFields[0]); //TimeZoneDifferenceGMT__c
            console.log('this.accSF.data', this.accSF);

            //Determine browser UTC offset and then compare to client UTC offset (TimeZoneDifferenceGMT__c is a formula field in Salesforce)
            const UTC_ClientHours = getFieldValue(this.accSF.data, this.AccountFields[2]); //TimeZoneDifferenceGMT__c
            const UTC_BrowserHours = -(new Date().getTimezoneOffset() / 60);            
            this.ClientTime.TimeZoneHourDelta = UTC_ClientHours - UTC_BrowserHours;
            this.UpdateClientTime();
                
            //Set a timer to update every 66 seconds based on the TimeZoneHourDelta
            this.PageVar.TimerForClock = setInterval(() => {  
                this.UpdateClientTime();
            }, 66000);

            //SYSTEM
            if(getFieldValue(this.accSF.data, this.AccountFields[3]) != null) {
                this.System.Id = getFieldValue(this.accSF.data, this.AccountFields[3]);
                this.System.Name = getFieldValue(this.accSF.data, this.AccountFields[4]);
                this.System.Status = getFieldValue(this.accSF.data, this.AccountFields[5]);
                this.System.Visible = true;
            } else if(getFieldValue(this.accSF.data, this.AccountFields[6]) != null) {
                this.System.Id = getFieldValue(this.accSF.data, this.AccountFields[6]);
                this.System.Name = getFieldValue(this.accSF.data, this.AccountFields[7]);
                this.System.Status = getFieldValue(this.accSF.data, this.AccountFields[8]);
                this.System.Visible = true;
            }    
                            
            NeedsAnalysisFromAccountId({AccountId: this.accSF.AccountId})
            .then(result => {
                this.Needs.data = result;
                console.log('Needs.data', this.Needs.data);
                this.Needs.data.LastModifiedBy = this.Needs.data.LastModifiedFirstName + ' ' + this.Needs.data.LastModifiedLastName.charAt(0);
                this.Needs.data.LastModifiedDate = new Date(this.Needs.data.LastModifiedDate).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"});
                this.Needs.Visible = true;                
            })
            .catch(error => {
                console.log('error',error);
                this.Needs.Visible = false; 
            });

            this.accSF.Loaded = true;
        }
        if (error) {
            console.error('Error occurred retrieving account records...');
        }
    }

    //This gets called when the Account @wire has completed
    // @wire(getRelatedListRecords, {
    //     parentRecordId: '$accSF.AccountId',
    //     relatedListId: 'Success__r', //find this by viewing the related list in Salesforce and looking at the URL
    //     fields: ['Needs_Analysis__c.Id', 'Needs_Analysis__c.LastModifiedDate', 'Needs_Analysis__c.LastModifiedBy.FirstName', 'Needs_Analysis__c.LastModifiedBy.LastName'],
    //     where: { RecordTypeId: "012I90000004KO7IAM" }
    // }) childRecords({data, error}){
    //     if(this.accSF.Loaded == true) { //This forces the call to wait until we have the AccountId
    //         if (data) {
    //             if(data.records.length > 0) {
    //                 this.Needs.data = data.records[0];
    //                 this.Needs.Id = getFieldValue(this.Needs.data, 'Needs_Analysis__c.Id');
    //                 this.Needs.LastModifiedDate = new Date(getFieldValue(this.Needs.data, 'Needs_Analysis__c.LastModifiedDate')).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"});
    //                 this.Needs.LastModifiedByFirstName = getFieldValue(this.Needs.data, 'Needs_Analysis__c.LastModifiedBy.FirstName');
    //                 this.Needs.LastModifiedByLastName = getFieldValue(this.Needs.data, 'Needs_Analysis__c.LastModifiedBy.LastName');
    //                 this.Needs.LastModifiedBy = this.Needs.LastModifiedByFirstName + ' ' + this.Needs.LastModifiedByLastName.charAt(0);
    //                 //if(this.Needs.LastModifiedByFirstName == 'Integration') 
    //                 this.Needs.Visible = true;
    //             }
    //         }
    //         if (error) {
    //             console.error('Error occurred retrieving child records...');
    //         }            
    //     }
    // }
  
    UpdateClientTime() {
        let ClientTime = new Date();  
        ClientTime.setHours(ClientTime.getHours() + this.ClientTime.TimeZoneHourDelta);
        this.ClientTime.Display = ClientTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
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
    
    navigateToNeeds() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.Needs.data.NeedsId,
                actionName: 'view',
            },
        });
    }     
}