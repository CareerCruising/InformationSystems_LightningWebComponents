import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import uId from '@salesforce/user/Id';
import USER_PROFILE_NAME_FIELD from '@salesforce/schema/User.Profile.Name';

export default class MethodizeCompareOpp extends NavigationMixin(LightningElement) {
    
    //Setup page variables
    @track PageVar = {
        IsLoaded:false,
        Debug:false,
        ReportDataFound:null,
        SortField: 'Account__r_Name',
        SortAsc: true,     
        ShowInfo: false,
        AllowItemRemovals: false, 
        ShowRemoveWarning: false,  
        RemoveId: null,
        SourceServerOption: [
            { label: 'AzureUS', value: 'AzureUS' },
            { label: 'AzureCA', value: 'AzureCA' },
            { label: 'AzureUK', value: 'AzureUK' },
            { label: 'CC', value: 'CC' }
        ],
        FrequencyOption: [
            { label: 'Nightly', value: 'D' },
            { label: 'Weekly', value: 'W' },
            { label: 'Monthly', value: 'M' }
        ]        
    };

    //Get the user ProfileName
    userProfileName;
    @wire(getRecord, { recordId: uId, fields: [USER_PROFILE_NAME_FIELD] })
    wiredUser({ error, data }) {
        if (data) {
            this.userProfileName = getFieldValue(data, USER_PROFILE_NAME_FIELD);
            this.PageVar.AllowItemRemovals = "Onboarding - Power User | System Administrator".includes(this.userProfileName);
            console.log(this.userProfileName, this.PageVar.AllowItemRemovals);
        } else if (error) {
            console.error(error);
        }
    }

    fetchData() {
        this.PageVar.IsLoaded = false;
        // Use standard Fetch API 
        fetch('https://is.xello.world/api/Integrations/GetMethodizeCompareOpp').then((response) => response.json())
            .then((jsonResponse) => {
                this.PageVar.ReportData = jsonResponse.ReportData;
                this.CleanResults();
                this.PageVar.IsLoaded = true;  
            })       
            .catch((error) => {console.log(error);this.PageVar.IsLoaded = true;});
    }

    CleanResults() {  
        if(this.PageVar.ReportData != null) {
            this.PageVar.ReportData.forEach(function(entry) {
                


                if(entry.EndDate__c != null) entry.EndDate__c = new Date(entry.EndDate__c);
                if(entry.EndDate__c != null) entry.EndDateFormatted = new Date(entry.EndDate__c).toLocaleDateString('en-US',{year: "numeric", month: "2-digit", day: "2-digit"});
                if(entry.SubscriptionEndDate != null) entry.SubscriptionEndDate = new Date(entry.SubscriptionEndDate);
                if(entry.SubscriptionEndDate != null) entry.SubscriptionEndDateFormatted = new Date(entry.SubscriptionEndDate).toLocaleDateString('en-US',{year: "numeric", month: "2-digit", day: "2-digit"});
                
                //Compare for match BEFORE converting to date
                entry.DateMatch = true;
                if(entry.SubscriptionEndDateFormatted != entry.EndDateFormatted) entry.DateMatch = false;

                entry.QtyMatch = true;
                if(entry.SeatQtyParsed != entry.NumberOfAccounts) entry.QtyMatch = false;                        
            });                    
            this.PageVar.ReportDataFound = this.PageVar.ReportData.length > 0; //only make this true after confirmed so alert message does not appear (or flash) on screen
        }
        else {
            this.PageVar.ReportDataFound = false;
        }
    }

    connectedCallback() {  
        this.fetchData();
    }

    navigateToSFRecordId(event) {  
        let NavRecordId = event.target.dataset.id;
        //onsole.log(NavRecordId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: NavRecordId,
                actionName: 'view',
            },
        });
    }

    navigateToDSAdmin(event) {  
        let NavRecordId = event.target.dataset.id;
        window.open('http://dsadmin.xello.us/Methodize?schoolId=' + NavRecordId, 'dsadmin-window');
    }

    sort(event) {
        //onsole.log(event.target.dataset.sortname);
        let FieldToSort = event.target.dataset.sortname;
        if(FieldToSort == null) return;

        this.PageVar.SortAsc = (FieldToSort != this.PageVar.SortField) ? true : !this.PageVar.SortAsc;
        this.PageVar.SortField = FieldToSort;

        this.PageVar.ReportData.sort((a, b) => {

            let fa = JSON.stringify(a[FieldToSort]).toLowerCase(), fb = JSON.stringify(b[FieldToSort]).toLowerCase();

            if(this.PageVar.SortAsc) {
                return fa == fb ? 0 : fa > fb ? 1 : -1;
            } else {
                return fa == fb ? 0 : fa > fb ? -1 : 1;
            }
            
        });

    }     

    ToggleInfo() {  
        this.PageVar.ShowInfo = !this.PageVar.ShowInfo;
    }    

    SetIdAndShowRemoveWarning(event) {  
        this.PageVar.RemoveId = event.target.dataset.removeid;
        this.PageVar.ShowRemoveWarning = true;
    }  

    HideRemoveWarning() {  
        this.PageVar.RemoveId = null;
        this.PageVar.ShowRemoveWarning = false;
    }  

    RemoveItem() {  
        console.log(this.PageVar.RemoveId);
        this.PageVar.ShowRemoveWarning = false;
        this.PageVar.IsLoaded = false;
        // Use standard Fetch API 
        fetch('https://is.xello.world/api/Integrations/MethodizeOppXelloReportRemoveOli?OliId=' + this.PageVar.RemoveId).then((response) => response.json())
            .then((jsonResponse) => {
                this.PageVar.ReportData = jsonResponse.ReportData;
                this.CleanResults();
                this.PageVar.IsLoaded = true;  
                this.PageVar.RemoveId = null;
            })       
            .catch((error) => {console.log(error);this.PageVar.IsLoaded = true;});
    }   
 
}