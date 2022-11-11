import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { basicTest, JSON_CSV_Download } from 'c/commonJS';

export default class AccountThinkific extends LightningElement {
    @api recordId;
    @track PageVar = {
        IsLoaded:false,
        Debug:false,
        ReportDataFound:false,
        SortField: 'LastName',
        SortAsc: true,     
        ShowInfo: false,
        DropMenu1Value: 'Educators with Courses'
    };
    @wire(getRecord, { recordId: '$recordId', fields: [
        'Account.Name'
        ,'Account.InstitutionId__c'
        ,'Account.OwnerId'
    ] }) accSF;   

    connectedCallback() {  
        this.fetchData();  
        //basicTest('This is a test');
    }

    fetchData() {
        this.PageVar.IsLoaded = false;

        var URL = 'https://is.xello.world/api/Integrations/AccountThinkificReport?CrmAccountId=' + this.recordId;

        fetch(URL).then((response) => response.json())
            .then((jsonResponse) => {
                this.PageVar.ReportData = jsonResponse.ReportData;

                if(this.PageVar.ReportData != null) {
                    this.PageVar.ReportData.forEach(function(entry) {
                        entry.Visible = true;
                        if(entry.PercentCompleted != '') {
                            entry.Percent = parseFloat(entry.PercentCompleted) * 100;
                            entry.Percent = entry.Percent.toFixed(0) + '%';
                        }
                        
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

    DownloadEducators(event) {
        let TempTable = JSON.parse(JSON.stringify(this.PageVar.ReportDataFiltered));
        let MyDate = new Date().toISOString().substring(0,10);
        TempTable.forEach(function(entry) {
            delete entry.Id;
            delete entry.Visible;
            delete entry.PercentCompleted;
        }); 
        JSON_CSV_Download(TempTable, 'XelloAcademy_' + this.accSF.data.fields.Name.value + '_' + MyDate);
    }   
}