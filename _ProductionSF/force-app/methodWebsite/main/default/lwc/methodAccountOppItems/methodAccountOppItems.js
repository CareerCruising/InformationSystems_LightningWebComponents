import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import uId from '@salesforce/user/Id';

export default class MethodAccountOppItems extends NavigationMixin(LightningElement) {
    userId = uId;   
    @track popover = {} //Handles all popover logic
    @track PageVar = {
        RecordId: '',
        IsLoaded:false,
        Debug:false,
        ReportDataFound:null,
        MethodDataFound:null,
        SortField: 'Account__r_Name',
        SortAsc: true,     
        ShowInfo: false,   
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
        OppSimpleStatus: ''
    };
    UserCookie = {
        OppSimpleStatus: 'Open',
        SomeVariable: ''
    };

    connectedCallback() {  
        var AnyString = window.location.href;
        var accEnd = AnyString.indexOf('account') + 8;
        this.PageVar.RecordId = AnyString.substring(accEnd, accEnd + 18);
        this.fetchData();

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

    fetchData() {
        this.PageVar.IsLoaded = false;

        var URL = 'https://is.xello.world/api/Integrations/GetMethodizeAccountOppItems?UserId=' + this.userId + '&CrmAccountId=' + this.PageVar.RecordId;
        //var URL = 'https://localhost/api/Integrations/GetMethodizeAccountOppItems?UserId=' + this.userId + '&CrmAccountId=' + this.PageVar.RecordId;

        fetch(URL).then((response) => response.json())
            .then((jsonResponse) => {
                this.PageVar.ReportData = jsonResponse.ReportData;
                this.PageVar.MethodData = jsonResponse.MethodData;
                
                if(this.PageVar.ReportData != null) {

                    this.PageVar.ReportData.forEach(function(entry) {
                        //Dates
                        if(entry.EndDate__c != null) {
                            var TempDateObject = new Date(entry.EndDate__c);
                            TempDateObject.setDate(new Date(TempDateObject).getDate() + 1)
                            entry.EndDatePlusOneFormatted = new Date(TempDateObject).toISOString().substring(0,10);
                            entry.EndDate__c = new Date(entry.EndDate__c);
                            entry.EndDateFormatted = new Date(entry.EndDate__c).toISOString().substring(0,10);
                        }
                        
                        if(entry.StartDate__c != null) entry.StartDate__c = new Date(entry.StartDate__c);
                        if(entry.StartDate__c != null) entry.StartDateFormatted = new Date(entry.StartDate__c).toISOString().substring(0,10);
                        if(entry.StartDate__c != null && entry.EndDate__c != null) {
                            entry.ContractDates = new Date(entry.StartDate__c).toLocaleDateString('en-US',{ year:"numeric", month:"short"}) + ' - ' + new Date(entry.EndDate__c).toLocaleDateString('en-US',{ year:"numeric", month:"short"});
                        }
                        if(entry.ModifiedDate != null) entry.ModifiedDate = new Date(entry.ModifiedDate).toISOString().substring(0,10);

                        //Compare OppSeatQtyParsed to Quantity
                        entry.QtyBestGuess = (entry.OppSeatQtyParsed == 0) ? entry.Quantity : entry.OppSeatQtyParsed; 

                        //Opportunity Line Type
                        entry.OppTypeIcon = 'utility:sync';
                        if(entry.Resub__c == 'New') entry.OppTypeIcon = 'utility:new';

                        //Opportunity SimpleStatus
                        entry.SimpleStatusClass = 'tdOppColor colorOpen';
                        if(entry.OppStageSimple == 'Closed Won') entry.SimpleStatusClass = 'tdOppColor colorClosedWon';
                        if(entry.OppStageSimple == 'Closed Lost') entry.SimpleStatusClass = 'tdOppColor colorClosedLost';

                        //LineItem Financial Status
                        entry.FinanceClass = ''
                        if(entry.Opportunity_InternalStatus__c == '06: Invoiced') {
                            entry.FinanceClass = 'LineInvoiced';
                            if(entry.Opportunity_Finance_Balance_Owing__c == 0) entry.FinanceClass = 'LinePaid';
                        }

                        //Contract
                        entry.ContractMonth = new Date(entry.StartDate__c).toLocaleDateString('en-us', { month:"short"}).toUpperCase();
                        entry.ContractYear = new Date(entry.StartDate__c).toLocaleDateString('en-us', { year:"numeric"});
                        entry.ContractDuration = parseFloat((12 * entry.Contract_Duration__c).toFixed(1));
                        entry.ContractDuration = (entry.ContractDuration == 12) ? '': JSON.stringify(entry.ContractDuration);
                        entry.ContractClass = (new Date(entry.StartDate__c) <= new Date().setHours(0,0,0,0) && new Date(entry.EndDate__c) >= new Date().setHours(0,0,0,0)) ? '' : 'ContractFaded';

                        entry.TotalPriceCalc = '$' + entry.UnitPrice + ' x qty ' + entry.Quantity;
                        entry.RowClass = (entry.OppStageSimple == 'Closed Lost') ? 'rowFadedClass' : '';
                        entry.IsClosedLost = (entry.OppStageSimple == 'Closed Lost') ? true : false;
                        
                    });        
                    

                    this.filterData();       
                    this.PageVar.ReportDataFound = this.PageVar.ReportData.length > 0; //only make this true after confirmed so alert message does not appear (or flash) on screen
                }
                else {
                    this.PageVar.ReportDataFound = false;
                }
                this.PageVar.IsLoaded = true;  

                if(this.PageVar.MethodData != null) {
                    //Determine color for bar buttons:
                    this.PageVar.MthTypeColor = (new Date(this.PageVar.MethodData.SubscriptionEndDate) > new Date()) ? 'Status-On' : '';
                    this.PageVar.MthStudentColor = (this.PageVar.MethodData.IsMethodizeVisibleForStudents) ? 'Status-On' : '';
                    this.PageVar.MthEducatorColor = (this.PageVar.MethodData.IsMethodizeVisibleForEducators) ? 'Status-On' : '';
                    this.PageVar.MethodData.SubscriptionEndDateFormatted = new Date(this.PageVar.MethodData.SubscriptionEndDate).toISOString().substring(0,10);
                    this.PageVar.MethodData.ModifiedDateFormatted = new Date(this.PageVar.MethodData.ModifiedDate).toISOString().substring(0,10);  
                    this.PageVar.MethodDataFound = true;                
                }
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