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
        MonthOptions: [
            { label: 'Jan', value: '0' },
            { label: 'Feb', value: '1' },
            { label: 'Mar', value: '2' },
            { label: 'Apr', value: '3' },
            { label: 'May', value: '4' },
            { label: 'Jun', value: '5' },
            { label: 'Jul', value: '6' },
            { label: 'Aug', value: '7' },
            { label: 'Sep', value: '8' },
            { label: 'Oct', value: '19' },
            { label: 'Nov', value: '10' },
            { label: 'Dec', value: '11' }
        ],
        DatetePicker: {
            DateRangeText: '',
            StartDate: new Date(new Date().getFullYear(),new Date().getMonth(),1),
            EndDate: new Date(new Date().getFullYear(),new Date().getMonth(),1),
            MonthStart: 0,
            MonthEnd: 0,
            YearStart: 0,
            YearEnd: 0
        },
        OppSimpleStatusOptions: [
            { label: 'Open', value: 'Open' },
            { label: 'Closed Won', value: 'Closed Won' },
            { label: 'Closed Lost', value: 'Closed Lost' }
        ],
        OppSimpleStatus: 'Open'
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
                        entry.MthTypeColor = (entry.SubscriptionEndDate > new Date()) ? 'Status-On' : '';
                        entry.MthStudentColor = (entry.MethodStudentActive == 'Y') ? 'Status-On' : '';
                        entry.MthEducatorColor = (entry.MethodEducatorActive == 'Y') ? 'Status-On' : '';

                        //Compare to Date / Quantity to Method
                        entry.QtyMatchClass = (entry.OppSeatQtyParsed == entry.NumberOfAccounts) ? '' : 'slds-text-color_error'; 
                        entry.NumberOfAccounts = (entry.NumberOfAccounts == null) ? '--' : new Intl.NumberFormat().format((entry.NumberOfAccounts).toFixed(0));

                        entry.DateMatchClass = (entry.SubscriptionEndDateFormatted == entry.EndDateFormatted) ? '' : 'slds-text-color_error';
                        entry.SubscriptionEndDateFormatted = (entry.SubscriptionEndDateFormatted == null) ? '--': entry.SubscriptionEndDateFormatted;

                        // entry.DateMatch = true;
                        // if(entry.SubscriptionEndDateFormatted != entry.EndDateFormatted) {
                        //     entry.DateMatch = false;
                        // }
                        
                        // entry.DateMatch = (entry.SubscriptionEndDateFormatted == entry.EndDateFormatted) ? true : false; 

                        // entry.OppSeatQtyParsed = (entry.OppSeatQtyParsed == null) ? '--' : entry.OppSeatQtyParsed;

                        //Links
                        entry.AccLink = '/Methodize/s/account?id=' + entry.Account__c

                        
                        
                        entry.TotalPriceCalc = entry.UnitPrice + ' x ' + entry.Quantity;
                        entry.RowClass = (entry.OppStageSimple == 'Closed Lost') ? 'rowFadedClass' : '';
                        entry.IsClosedLost = (entry.OppStageSimple == 'Closed Lost') ? true : false;
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
        this.InitializeDatePicker();
        this.fetchData();
    }

    InitializeDatePicker() {  
        this.PageVar.DatetePicker.StartDate.setMonth(this.PageVar.DatetePicker.StartDate.getMonth() - 2);
        this.PageVar.DatetePicker.EndDate.setMonth(this.PageVar.DatetePicker.EndDate.getMonth() + 3);
        this.PageVar.DatetePicker.EndDate.setDate(this.PageVar.DatetePicker.EndDate.getDate() - 1);
        this.PageVar.DatetePicker.MonthStart = this.PageVar.DatetePicker.StartDate.getMonth();
        this.PageVar.DatetePicker.MonthEnd = this.PageVar.DatetePicker.EndDate.getMonth();
        this.PageVar.DatetePicker.YearStart = this.PageVar.DatetePicker.StartDate.getFullYear();
        this.PageVar.DatetePicker.YearEnd = this.PageVar.DatetePicker.EndDate.getFullYear();
        this.PageVar.DatetePicker.DateRangeText = this.PageVar.DatetePicker.StartDate.toLocaleDateString('en-us', { year:"numeric", month:"short"}) 
            + ' - ' + this.PageVar.DatetePicker.EndDate.toLocaleDateString('en-us', { year:"numeric", month:"short"});
        
        console.log(this.PageVar.DatetePicker);
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
    handleFilterByType(event) {
        this.PageVar.OppSimpleStatus = event.detail.value;
    }       
}