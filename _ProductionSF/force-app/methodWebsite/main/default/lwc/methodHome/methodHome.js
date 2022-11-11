import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import uId from '@salesforce/user/Id';
import { getTermOptions, Multiply2Numbers, createCookie, getCookie } from 'c/commonJS';

export default class MethodHome extends NavigationMixin(LightningElement) {
    userId = uId;
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
            StartDate: '',
            EndDate: ''
        },
        UserData: {
            FromDate: '',
            ToDate: ''
        },        
        OppSimpleStatusOptions: [
            { label: 'All', value: '' },
            { label: 'Open', value: 'Open' },
            { label: 'Closed Won', value: 'Closed Won' },
            { label: 'Closed Lost', value: 'Closed Lost' }
        ],
        OppSimpleStatus: 'Open'
    };
    UserCookie = {
        OppSimpleStatus: 'Open',
        SomeVariable: ''
    };

    connectedCallback() {  
        console.log('UserMethodPortal', (getCookie('UserMethodPortal') != null));
        console.log(JSON.parse(getCookie('UserMethodPortal')));
        if(getCookie('UserMethodPortal') != null) this.UserCookie = JSON.parse(getCookie('UserMethodPortal'));
        this.PageVar.OppSimpleStatus = this.UserCookie.OppSimpleStatus;
        this.fetchData()

        document.addEventListener('scroll', debounce(() => {
            if(document.documentElement.scrollHeight === window.pageYOffset + window.innerHeight) {
                var TempList = this.PageVar.ReportDataFiltered;
                var LastVisibleIndex = TempList.findIndex(obj => obj.Visible == false)
                for(let i = LastVisibleIndex;i < TempList.length;i++){
                    TempList[i].Visible = (i < LastVisibleIndex + 20) ? true : false;
                }    
            }
        }, 100))
        function debounce(e,t=300){let u;return(...i)=>{clearTimeout(u),u=setTimeout(()=>{e.apply(this,i)},t)}}    
    }
    InitializeDatePicker() {  
        this.PageVar.DatetePicker.StartDate = JSON.parse(JSON.stringify(this.PageVar.UserData.FromDate)); //Deep copy required to keep original values
        this.PageVar.DatetePicker.EndDate = JSON.parse(JSON.stringify(this.PageVar.UserData.ToDate));
        
        //cumbersome but need to set a cosmetic date for the UI
        var tempDate = new Date(this.PageVar.DatetePicker.StartDate).setDate(new Date(this.PageVar.DatetePicker.StartDate).getDate() + 1);  //need to add 1 day for this to work
        this.PageVar.DatetePicker.DateRangeText = new Date(tempDate).toLocaleDateString('en-us', { year:"numeric", day: 'numeric', month:"short"})
        tempDate = new Date(this.PageVar.DatetePicker.EndDate).setDate(new Date(this.PageVar.DatetePicker.EndDate).getDate() + 1);  //need to add 1 day for this to work
        this.PageVar.DatetePicker.DateRangeText = this.PageVar.DatetePicker.DateRangeText + ' - ' + new Date(this.PageVar.DatetePicker.EndDate).toLocaleDateString('en-us', { year:"numeric", day: 'numeric', month:"short"});

    }
    fetchData() {
        this.PageVar.IsLoaded = false;

        var FromDate = '';
        var ToDate = '';
        if(this.PageVar.DatetePicker.StartDate != this.PageVar.UserData.FromDate || this.PageVar.DatetePicker.EndDate != this.PageVar.UserData.ToDate) {
            FromDate = this.PageVar.DatetePicker.StartDate
            ToDate = this.PageVar.DatetePicker.EndDate
        };

        var URL = 'https://is.xello.world/api/Integrations/GetMethodizePortalAllOpps?UserId=' + this.userId + '&FromDate=' + FromDate + '&ToDate=' + ToDate;
        //var URL = 'https://localhost/api/Integrations/GetMethodizePortalAllOpps?UserId=' + this.userId + '&FromDate=' + FromDate + '&ToDate=' + ToDate;

        fetch(URL).then((response) => response.json())
            .then((jsonResponse) => {
                this.PageVar.ReportData = jsonResponse.ReportData;
                this.PageVar.UserData = jsonResponse.UserData;
                this.InitializeDatePicker();  
                
                //onsole.log(this.PageVar.UserData.FromDate);
                if(this.PageVar.ReportData != null) {
                    this.PageVar.ReportData.forEach(function(entry) {
                        
                        if(entry.EndDate__c != null) {
                            var TempDateObject = new Date(entry.EndDate__c);
                            TempDateObject.setDate(new Date(TempDateObject).getDate() + 1)
                            entry.EndDatePlusOneFormatted = new Date(TempDateObject).toISOString().substring(0,10);
                            entry.EndDate__c = new Date(entry.EndDate__c);
                            entry.EndDateFormatted = new Date(entry.EndDate__c).toISOString().substring(0,10);
                        }
                        
                        if(entry.StartDate__c != null) entry.StartDate__c = new Date(entry.StartDate__c);
                        if(entry.StartDate__c != null) entry.StartDateFormatted = new Date(entry.StartDate__c).toISOString().substring(0,10);
                        if(entry.SubscriptionEndDate != null) entry.SubscriptionEndDate = new Date(entry.SubscriptionEndDate);
                        if(entry.SubscriptionEndDate != null) entry.SubscriptionEndDateFormatted = new Date(entry.SubscriptionEndDate).toISOString().substring(0,10);
                        if(entry.StartDate__c != null && entry.EndDate__c != null) {
                            entry.ContractDates = new Date(entry.StartDate__c).toLocaleDateString('en-US',{ year:"numeric", month:"short"}) + ' - ' + new Date(entry.EndDate__c).toLocaleDateString('en-US',{ year:"numeric", month:"short"});
                        }
                        if(entry.ModifiedDate != null) entry.ModifiedDate = new Date(entry.ModifiedDate).toISOString().substring(0,10);

                        //Determine color for bar buttons:
                        entry.MthTypeColor = (entry.SubscriptionEndDate > new Date()) ? 'Status-On' : '';
                        entry.MthTypeTitle = (entry.SubscriptionEndDate > new Date()) ? 'Valid site exists in Methodize' : 'Valid site does NOT exist in MEthodize';
                        entry.MthStudentColor = (entry.MethodStudentActive == 'Y') ? 'Status-On' : '';
                        entry.MthStudentTitle = (entry.MethodStudentActive == 'Y') ? 'Visible to students' : 'NOT visible to students';
                        entry.MthEducatorColor = (entry.MethodEducatorActive == 'Y') ? 'Status-On' : '';
                        entry.MthEducatorTitle = (entry.MethodEducatorActive == 'Y') ? 'Visible to educators' : 'NOT visible to educators';

                        //Compare to Date / Quantity to Method
                        entry.QtyMatchClass = (entry.OppSeatQtyParsed == entry.NumberOfAccounts) ? '' : 'slds-text-color_error'; 
                        entry.NumberOfAccounts = (entry.NumberOfAccounts == null) ? '--' : new Intl.NumberFormat().format((entry.NumberOfAccounts).toFixed(0));

                        entry.DateMatchClass = (entry.EndDatePlusOneFormatted == entry.SubscriptionEndDateFormatted) ? '' : 'slds-text-color_error';
                        entry.SubscriptionEndDateFormatted = (entry.SubscriptionEndDateFormatted == null) ? '--': entry.SubscriptionEndDateFormatted;

                        //Opportunity Line Type
                        entry.OppTypeIcon = 'utility:sync';
                        if(entry.Resub__c == 'New') entry.OppTypeIcon = 'utility:new';

                        //Opportunity SimpleStatus
                        entry.SimpleStatusClass = 'tdOppColor colorOpen';
                        if(entry.OppStageSimple == 'Closed Won') entry.SimpleStatusClass = 'tdOppColor colorClosedWon';
                        if(entry.OppStageSimple == 'Closed Lost') entry.SimpleStatusClass = 'tdOppColor colorClosedLost';

                        //Links
                        entry.AccLink = '/Methodize/s/account?id=' + entry.Account__c

                        //LineItem Financial Status
                        entry.FinanceClass = ''
                        if(entry.Opportunity_InternalStatus__c == '06: Invoiced') {
                            entry.FinanceClass = 'LineInvoiced';
                            if(entry.Opportunity_Finance_Balance_Owing__c == 0) entry.FinanceClass = 'LinePaid';
                        }

                        entry.TotalPriceCalc = '$' + entry.UnitPrice + ' x qty ' + entry.Quantity;
                        entry.RowClass = (entry.OppStageSimple == 'Closed Lost') ? 'rowFadedClass' : '';
                        entry.IsClosedLost = (entry.OppStageSimple == 'Closed Lost') ? true : false;
                        
                    });
                    

                    //Rebuild Opp stage drop menu labels to show quantity
                    var OriginalArray = this.PageVar.ReportData;
                    var TempArray
                    this.PageVar.OppSimpleStatusOptions.forEach(function(entry) {
                        if(entry.value == '') {
                            entry.label = 'All (' + OriginalArray.length + ')';
                        } else {
                            TempArray = OriginalArray.filter(obj => obj.OppStageSimple == entry.value);
                            entry.label = entry.value + ' (' + TempArray.length + ')';
                        }
                    });

                    this.filterData();       
                    this.PageVar.ReportDataFound = this.PageVar.ReportData.length > 0; //only make this true after confirmed so alert message does not appear (or flash) on screen
                }
                else {
                    this.PageVar.ReportDataFound = false;
                }
                this.PageVar.IsLoaded = true;  
            })       
            .catch((error) => {console.log(error);this.PageVar.IsLoaded = true;});
    }
    navigateToSFRecordId(event) {  
        let NavRecordId = event.target.dataset.id;
        console.log(NavRecordId);
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
    ToggleInfo() {  
        this.PageVar.ShowInfo = !this.PageVar.ShowInfo;
    }  
    PopoverToggle(event) {
        this.popover[event.target.dataset.popovername] = (this.popover[event.target.dataset.popovername]) ? false : true;
    }
    PopoverShow(event) {
        this.popover[event.target.dataset.popovername] = true;
    }
    PopoverHide(event) {
        //onsole.log(event.target.dataset.popovername);
        this.popover[event.target.dataset.popovername] = false;
    }

    ////////////////////////////////////////////////////////////////////////////////////
    //Filtering
    ////////////////////////////////////////////////////////////////////////////////////
    handleFilterByType(event) {
        this.PageVar.OppSimpleStatus = event.detail.value;
        this.filterData();  
    }       
    //Date Changes
    handleDateRangeChange(event) {
        this.popover.DatePopover1 = false;
        this.fetchData();
    }       
    StartDateChange(event) {
        this.PageVar.DatetePicker.StartDate = event.detail.value;
    }       
    EndDateChange(event) {
        this.PageVar.DatetePicker.EndDate = event.detail.value;
    }           

    filterData() {  
        let TempList = [];
        if(this.PageVar.OppSimpleStatus == '') {
            TempList = this.PageVar.ReportData; //JSON.parse(JSON.stringify(this.PageVar.ReportData));
        } else {
            TempList = this.PageVar.ReportData.filter(obj => obj.OppStageSimple == this.PageVar.OppSimpleStatus);
        }
        //let TempList = this.PageVar.ReportData.filter(obj => obj.OppStageSimple == this.PageVar.OppSimpleStatus);
        for(let i = 0;i < TempList.length;i++){
            TempList[i].Visible = (i<20) ? true : false;
         }        
        this.PageVar.ReportDataFiltered = TempList;
        this.PageVar.FilterCount = this.PageVar.ReportDataFiltered.length;
        this.UserCookie.OppSimpleStatus = this.PageVar.OppSimpleStatus
        createCookie('UserMethodPortal',JSON.stringify(this.UserCookie));
    }
    sort(event) {
        //onsole.log(event.target.dataset.sortname);
        let FieldToSort = event.target.dataset.sortname;
        if(FieldToSort == null) return;

        this.PageVar.SortAsc = (FieldToSort != this.PageVar.SortField) ? true : !this.PageVar.SortAsc;
        this.PageVar.SortField = FieldToSort;

        let TempList = this.PageVar.ReportDataFiltered;
        TempList.sort((a, b) => {

            let fa = JSON.stringify(a[FieldToSort]).toLowerCase(), fb = JSON.stringify(b[FieldToSort]).toLowerCase();

            if(this.PageVar.SortAsc) {
                return fa == fb ? 0 : fa > fb ? 1 : -1;
            } else {
                return fa == fb ? 0 : fa > fb ? -1 : 1;
            }
            
        });
        for(let i = 0;i < TempList.length;i++){
            TempList[i].Visible = (i<20) ? true : false;
         }        
        this.PageVar.ReportDataFiltered = TempList;
        this.PageVar.FilterCount = this.PageVar.ReportDataFiltered.length;
    }       
    
    

}