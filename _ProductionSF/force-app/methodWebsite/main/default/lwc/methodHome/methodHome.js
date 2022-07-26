import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class MethodHome extends NavigationMixin(LightningElement) {
    @track popover = {} //Handles all popover logic
    @track PageVar = {
        IsLoaded:false,
        Debug:false,
        ReportDataFound:null,
        SortField: 'Account__r_Name',
        SortAsc: true,     
        ShowInfo: false,   
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

    fetchData() {
        this.PageVar.IsLoaded = false;
        // Use standard Fetch API 
        fetch('https://is.xello.world/api/Integrations/GetMethodizePortalAllOpps?FromDate=2021-01-01&ToDate=2022-01-01').then((response) => response.json())
            .then((jsonResponse) => {
                this.PageVar.ReportData = jsonResponse.ReportData;
                if(this.PageVar.ReportData != null) {
                    this.PageVar.ReportData.forEach(function(entry) {
                        
                        if(entry.EndDate__c != null) entry.EndDate__c = new Date(entry.EndDate__c);
                        if(entry.EndDate__c != null) entry.EndDateFormatted = new Date(entry.EndDate__c).toLocaleDateString('en-US',{year: "numeric", month: "2-digit", day: "2-digit"});
                        if(entry.StartDate__c != null) entry.StartDate__c = new Date(entry.StartDate__c);
                        if(entry.StartDate__c != null) entry.StartDateFormatted = new Date(entry.StartDate__c).toLocaleDateString('en-US',{year: "numeric", month: "2-digit", day: "2-digit"});
                        if(entry.SubscriptionEndDate != null) entry.SubscriptionEndDate = new Date(entry.SubscriptionEndDate);
                        if(entry.SubscriptionEndDate != null) entry.SubscriptionEndDateFormatted = new Date(entry.SubscriptionEndDate).toLocaleDateString('en-US',{year: "numeric", month: "2-digit", day: "2-digit"});
                        
                        //Determine color for bar buttons:
                        entry.MthTypeColor = (entry.SubscriptionEndDate > new Date()) ? 'btn-on' : '';
                        entry.MthStudentColor = (entry.MethodStudentActive == 'Y') ? 'btn-on' : '';
                        entry.MthEducatorColor = (entry.MethodEducatorActive == 'Y') ? 'btn-on' : '';

                        //Compare for match BEFORE converting to date
                        entry.DateMatch = true;
                        if(entry.SubscriptionEndDateFormatted != entry.EndDateFormatted) entry.DateMatch = false;

                        entry.QtyMatch = true;
                        if(entry.SeatQtyParsed != entry.NumberOfAccounts) entry.QtyMatch = false; 
                        
                        //Links
                        entry.AccLink = '/Methodize/s/account?id=' + entry.Account__c

                        entry.TotalPriceCalc = entry.UnitPrice + ' x ' + entry.Quantity ;
                    });                    
                    this.PageVar.ReportDataFound = this.PageVar.ReportData.length > 0; //only make this true after confirmed so alert message does not appear (or flash) on screen
                }
                else {
                    this.PageVar.ReportDataFound = false;
                }
                this.PageVar.IsLoaded = true;  
            })       
            .catch((error) => {console.log(error);this.PageVar.IsLoaded = true;});
    }

    connectedCallback() {  
        this.fetchData();
    }

    navigateToSFRecordId(event) {  
        let NavRecordId = event.target.dataset.id;
        console.log('dd');
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: NavRecordId,
                actionName: 'view',
            },
        });
    }

    navigateToLink(event) {  
        let NavRecordId = event.target.dataset.id;
        console.log('dd');
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Account__c'
            },
        });
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

    PopoverShow(event) {
        this.popover[event.target.dataset.popovername] = true;
    }
    PopoverHide(event) {
        //onsole.log(event.target.dataset.popovername);
        this.popover[event.target.dataset.popovername] = false;
    }
}