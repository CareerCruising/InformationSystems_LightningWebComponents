import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { basicTest, JSON_CSV_Download } from 'c/commonJS';

export default class AccountProductChange extends NavigationMixin(LightningElement) {
    @api recordId;
    @track popover = {} //Handles all popover logic
    @track PageVar = {
        IsLoaded:false,
        Debug:false,
        ReportDataFound:false,
        SortField: 'LastName',
        SortAsc: true,     
        ShowInfo: false,
        ShowTestIssue: false,
        TestIssueOptions: [
            { label: 'Select an Option', value: '' },
            { label: 'Duplication; 2022 ARR change looks weird', value: '0011K00002PPsCnQAL' }
        ],
        TestIssueValue: ''
    };
    @wire(getRecord, { recordId: '$recordId', fields: [
        'Account.Name'
        ,'Account.InstitutionId__c'
        ,'Account.OwnerId'
    ] }) accSF;   

    connectedCallback() {  
        this.fetchData();  
        //basicTest('This is a test');
        this.PageVar.ShowTestIssue = (location.href.indexOf('https://xello--c.vf.force.com/') >= 0);
    }

    fetchData() {
        this.PageVar.IsLoaded = false;

        var URL = 'https://is.xello.world/api/Integrations/AccountProductChange?CrmAccountId=' + this.recordId;
        //var URL = 'https://localhost/api/Integrations/AccountProductChange?CrmAccountId=' + this.recordId;

        fetch(URL).then((response) => response.json())
            .then((jsonResponse) => {
                this.PageVar.ReportData = jsonResponse.ReportData;

                if(this.PageVar.ReportData != null) {
                    var RowClass = 'DarkRow';
                    var StartYear = this.PageVar.ReportData[0].StartYear;
                    this.PageVar.ReportData.forEach(function(entry) {
                        if(StartYear != entry.StartYear) {
                            StartYear = entry.StartYear;
                            RowClass = (RowClass == 'DarkRow') ? 'LightRow':'DarkRow';
                        }
                        entry.RowClass = RowClass;
                        entry.Visible = true;     
                        entry.ChangeType = (entry.ChangeType == null) ? '--' : entry.ChangeType;
                        entry.Note = (entry.Note == null) ? '--' : entry.Note;                                           
                    });             
                    this.PageVar.ReportDataFound = this.PageVar.ReportData.length > 0; //only make this true after confirmed so alert message does not appear (or flash) on screen
                }
                else {
                    this.PageVar.ReportDataFound = false;
                }
                this.PageVar.IsLoaded = true;  
                this.filterData();
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

    DropMenu1Change(event) {
        this.PageVar.DropMenu1Value = event.target.dataset.label;
        this.filterData();
    }    

    filterData() {  
        let TempList = [];
        if(this.PageVar.DropMenu1Value == 'All Educators') {
            TempList = this.PageVar.ReportData; //JSON.parse(JSON.stringify(this.PageVar.ReportData));
        } else {
            TempList = this.PageVar.ReportData.filter(obj => obj.CourseName != '');
        }
        //let TempList = this.PageVar.ReportData.filter(obj => obj.OppStageSimple == this.PageVar.OppSimpleStatus);
        for(let i = 0;i < TempList.length;i++){
            TempList[i].Visible = (i<20) ? true : false;
            }        
        this.PageVar.ReportDataFiltered = TempList;
        this.PageVar.FilterCount = this.PageVar.ReportDataFiltered.length;
    }

    handleTestIssueChange(event) {
        this.PageVar.TestIssueValue = event.detail.value;
        location.href = 'https://xello--c.vf.force.com/apex/a_ComponentTester?Id=' + this.PageVar.TestIssueValue + '&comp=AccountProductChange'
    } 

    DownloadEducators(event) {
        let TempTable = JSON.parse(JSON.stringify(this.PageVar.ReportDataFiltered));
        let MyDate = new Date().toISOString().substring(0,10);
        TempTable.forEach(function(entry) {
            delete entry.Id;
            delete entry.RowClass;
        }); 
        JSON_CSV_Download(TempTable, 'XelloAcademy_' + this.accSF.data.fields.Name.value + '_' + MyDate);
    }   

    PopoverShow(event) {
        this.popover[event.target.dataset.popovername] = true;
    }
    PopoverHide(event) {
        this.popover[event.target.dataset.popovername] = false;
    }    
}