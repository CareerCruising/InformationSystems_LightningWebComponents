import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { basicTest, JSON_CSV_Download } from 'c/commonJS';
import getAccountIdFromRecordId from'@salesforce/apex/Describe.getAccountIdFromRecordId';
import DescribeObjectList from'@salesforce/apex/Describe.ObjectList';

export default class AccountProductExpansion extends NavigationMixin(LightningElement) {
    @api recordId;
    @track popover = {} //Handles all popover logic
    @track PageVar = {
        IsLoaded:false,
        Fetching: false,
        Debug:false,
        ReportDataFound:false,
        SortField: 'LastName',
        SortAsc: true,     
        ShowInfo: false,
        ShowTestIssue: false,
        ExpansionDetails: { Visible: false }
    };

    connectedCallback() {  
        //We need to first get the AccountId depending on the object
         getAccountIdFromRecordId({strRecordId: this.recordId})
            .then(result => {
                this.PageVar.AccountId = result;
                this.fetchData(); 
            })
            .catch(error => {
                console.log('error',error);
            });

        //this.fetchData();  
        //basicTest('This is a test');
        this.PageVar.ShowTestIssue = (location.href.indexOf('https://xello--c.vf.force.com/') >= 0);
    }
    renderedCallback() {
        let firstClass = this.template.querySelectorAll('.slds-progress-bar__value');
        for (var i = 0, len = firstClass.length; i < len; i++) {
            var elWidth = firstClass[i].dataset.value;
            elWidth = (elWidth > 1000) ? 100 : elWidth / 10;
            firstClass[i].setAttribute('style','width:' + elWidth + '%;');
        }; 
    }
    fetchData() {
        this.PageVar.IsLoaded = false;

        var URL = 'https://is.xello.world/api/Integrations/AccountProductExpansion?CrmAccountId=' + this.PageVar.AccountId;
        //var URL = 'https://localhost/api/Integrations/AccountProductExpansion?CrmAccountId=' + this.recordId;

        fetch(URL).then((response) => response.json())
            .then((jsonResponse) => {
                this.PageVar.ReportData = jsonResponse.ReportData;
                this.PageVar.recordId = this.recordId;

                if(this.PageVar.ReportData != null) {
                    for (var i = 0, len = this.PageVar.ReportData.length; i < len; i++) {
                        var row = this.PageVar.ReportData[i];
                        row.Visible = true; 
                        row.HierarchyClass = 'Pad' + row.Level; //indent based on level

                        //Determine if it's a parent (Dark row of child totals) or a child (light row)
                        if(row.ChildCount > 0) {
                            row.RowClass = 'DarkRow';
                            row.IconName = 'utility:chevrondown';
                        } else {
                            row.RowClass = 'LightRow';
                            row.IconName = 'utility:info_alt';
                        }

                        if(row.Level > 1) {
                            row.IconName = (row.ChildCount > 0) ? 'utility:chevronright' : 'utility:info_alt';
                        }
                        if(row.Level > 2 && this.PageVar.recordId != row.CrmAccountId) {
                            row.IconName = (row.ChildCount > 0) ? 'utility:chevronright' : 'utility:info_alt';
                            row.Visible = false; 
                        }

                        //Total each column set
                        row.Total_CS = row.XelloES_CS + row.XelloMS_CS + row.XelloHS_CS + row.DiServices_CS + row.MethodASAT_CS + row.MethodFL_CS + row.StuTracker_CS + row.Intel_CS
                        row.Total_PI = row.XelloES_PI + row.XelloMS_PI + row.XelloHS_PI + row.DiServices_PI + row.MethodASAT_PI + row.MethodFL_PI + row.StuTracker_PI + row.Intel_PI
                        row.Total_NS = row.XelloES_NS + row.XelloMS_NS + row.XelloHS_NS + row.DiServices_NS + row.MethodASAT_NS + row.MethodFL_NS + row.StuTracker_NS + row.Intel_NS

                    }  
                    this.PageVar.ReportDataFound = this.PageVar.ReportData.length > 0; //only make this true after confirmed so alert message does not appear (or flash) on screen
                }
                else {
                    this.PageVar.ReportDataFound = false;
                }
                this.PageVar.IsLoaded = true;  
                console.log(this.PageVar.ReportData[0]);
                this.filterData();
            })       
            .catch((error) => {console.log(error);this.PageVar.IsLoaded = true;});
    }    
    fetchExpansionDetails(event) {
        this.PageVar.Fetching = true;
        var Id = event.target.dataset.accountid;
        var URL = 'https://is.xello.world/api/Integrations/AccountProductExpansionDetails?CrmAccountId=' + Id;
        this.PageVar.ExpansionDetails.Account = this.PageVar.ReportDataFiltered.find(obj => obj.CrmAccountId == Id)

        fetch(URL).then((response) => response.json())
            .then((jsonResponse) => {
                this.PageVar.ExpansionDetails.Data = jsonResponse.ReportData;
                this.PageVar.recordId = this.recordId;

                if(this.PageVar.ExpansionDetails.Data != null) {
                    for (var i = 0, len = this.PageVar.ExpansionDetails.Data.length; i < len; i++) {
                        var row = this.PageVar.ExpansionDetails.Data[i];
                        row.Visible = true; 
                        row.HierarchyClass = 'Pad' + row.Level; //indent based on level
                        if(row.ExpansionType == 'Cross Sell') row.ExpansionClass = 'text-purple'
                        if(row.ExpansionType == 'Price Increase') row.ExpansionClass = 'slds-text-color_success'
                        if(row.ExpansionType == 'New Sales') row.ExpansionClass = 'text-brown'
                    }  
                    //this.PageVar.ReportDataFound = this.PageVar.ReportData.length > 0; //only make this true after confirmed so alert message does not appear (or flash) on screen
                }
                this.PageVar.Fetching = false;
                this.PageVar.ExpansionDetails.Visible = true;
                //onsole.log(this.PageVar.ExpansionDetails); 
            })       
            .catch((error) => {console.log(error);this.PageVar.Fetching = false;});
    }      
    navigateToSFRecordId(event) {  
        let NavRecordId = event.target.dataset.id;
        console.log('nav',event.target.dataset);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: NavRecordId,
                actionName: 'view',
            },
        });
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
    JumpToURL(event) {
        location.href = event.target.dataset.url;
    }    
    filterData() {       
        this.PageVar.ReportDataFiltered = this.PageVar.ReportData;
        this.PageVar.FilterCount = this.PageVar.ReportDataFiltered.length;
    }
    DownloadJson(event) {
        let TempTable = JSON.parse(JSON.stringify(this.PageVar.ReportDataFiltered));
        let MyDate = new Date().toISOString().substring(0,10);
        for (var i = 0, len = TempTable.length; i < len; i++) {
            delete TempTable[i].Id;
            delete TempTable[i].AccountId;
            delete TempTable[i].RowClass;
            delete TempTable[i].Level;
            delete TempTable[i].TopLevel;
            delete TempTable[i].TopLevelName;
            delete TempTable[i].TopLevelType;
            delete TempTable[i].Visible;
            delete TempTable[i].HierarchyClass;
            delete TempTable[i].IconName;
            delete TempTable[i].Expanded;
        }; 
        JSON_CSV_Download(TempTable, 'Expansion_' + this.ReportData[0].AccountName + '_' + MyDate);
    }   
    ToggleHierarchy(event) {  

        //Determine row object so we have access to all properties 
        var Id = event.target.dataset.accountid;
        var StartingRow = this.PageVar.ReportDataFiltered[this.PageVar.ReportDataFiltered.findIndex(obj => obj.CrmAccountId == Id)];

        //this is like a boolean to determine the icon / expansion status
        if(StartingRow.IconName == 'utility:chevrondown') {
            StartingRow.IconName = 'utility:chevronright';
            StartingRow.Expanded = false;
        } else {
            StartingRow.IconName = 'utility:chevrondown';
            StartingRow.Expanded = true;
        }

        //This is tricky but essentially any match to the parent priority is a child
        let ChildList = this.PageVar.ReportDataFiltered.filter(obj => obj.Priority.substring(0, StartingRow.Priority.length) == StartingRow.Priority && obj.Priority != StartingRow.Priority);
        
        //Loop through the children and set visibility based on Parent status
        var Parent = {};
        for (var i = 0, len = ChildList.length; i < len; i++) {
            Parent = this.PageVar.ReportDataFiltered.find(obj => obj.CrmAccountId == ChildList[i].CrmParentId)
            if(Parent.Visible && Parent.IconName == 'utility:chevrondown') {
                ChildList[i].Visible = true;
            } else {
                ChildList[i].Visible = false;
            }
            //console.log(ChildList[i].Priority + ' : ' + ChildList[i].Name + ' ChildCount:' + ChildList[i].ChildCount + ' LastParent: ' + Parent.Name + ' LastParentExpanded: ' + Parent.IconName);
        };   

    }
    GetProgress(event) {
        console.log(this.popover[event.target.dataset.value]);
        return 20;
    }
    PopoverShow(event) {
        this.popover[event.target.dataset.popovername] = true;
    }
    PopoverHide(event) {
        this.popover[event.target.dataset.popovername] = false;
    }
    ToggleExpansionDetails(event){
        this.PageVar.ExpansionDetails.Visible = !this.PageVar.ExpansionDetails.Visible;
    }
    AlterDOM() {

    }
}

function FieldNamesBasedOnURL() {
    var UrlPath = window.location.pathname.toLowerCase();
    if(UrlPath.indexOf('account') >= 0) return ['Account.Name','Account.Id'];
    if(UrlPath.indexOf('opportunity') >= 0) return ['Opportunity.AccountId','Opportunity.Account.Name'];
    return ['Account.Name','Account.Id'];
}