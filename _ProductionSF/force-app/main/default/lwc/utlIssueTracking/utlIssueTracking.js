import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class UtlIssueTracking extends LightningElement {
    @track PageVar = {
        IsLoaded:false,
        SortField: 'ErrorDate',
        SortAsc: false,          
        Current:'962198',
        List: [
            { label: 'All Issues', value: '961045', filter: '' },
            { label: 'Custom Extracts', value: '961045', filter: 'Custom Extracts' },
            { label: 'Custom Extracts', value: '961045', filter: 'Custom Extracts' }
        ],
        data:[],
        columns:[]
    };    
    @track toggle = { //Handles all toggle logic;
        ModalOther: false
      }

    connectedCallback() {
        this.GetReport();
    }

    handleReportChange(event){
        this.Report.Current = event.detail.value;
        console.log(event.detail.filter)
        this.GetReport();
    }

    GetReport() {
        fetch('https://is.xello.world/api/Integrations/QueryBySprocId?SprocId=961045&String1=All').then((response) => response.json())
            .then((jsonResponse) => {
                this.PageVar.ReportData = jsonResponse.QueryResults;
                if(this.PageVar.ReportData != null) {
                    this.PageVar.ReportData.forEach(function(entry) {
                        if(entry.ErrorDate != null) entry.ErrorDateDay = new Date(entry.ErrorDate).toLocaleDateString('en-us',{year:"numeric", month:"short", day:"numeric"});                       
                        if(entry.ErrorDate != null) entry.ErrorDateTime = new Date(entry.ErrorDate).toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric'});

                        //badge for severity / occurances
                        entry.SeverityClass = 'slds-badge';
                        if(entry.Severity == 1) entry.SeverityClass = 'slds-badge slds-theme_error';
                        if(entry.Severity == 2) entry.SeverityClass = 'slds-badge slds-theme_warning';

                        //Icon for type
                        entry.IconForType = 'utility:page';
                        if(entry.Type == 'Custom Extract') entry.IconForType = 'utility:table';
                        if(entry.Type == 'SQL Job') entry.IconForType = 'utility:date_time';
                        if(entry.Type == 'SF LoadLogs') entry.IconForType = 'utility:salesforce1';

                        //Opacity for age
                        entry.OpacityStyle = 'opacity: 1;';
                        const diffTime = Math.abs(new Date(entry.ErrorDateDay) - new Date());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));                      
                        if(diffDays > 1) entry.OpacityStyle = 'opacity: .7';
                        if(diffDays > 2) entry.OpacityStyle = 'opacity: .5';
                        if(diffDays > 3) entry.OpacityStyle = 'opacity: .3';
                    });                    
                    this.PageVar.ReportDataFound = this.PageVar.ReportData.length > 0; //only make this true after confirmed so alert message does not appear (or flash) on screen
                }
                else {
                    this.PageVar.ReportDataFound = false;
                }
                this.PageVar.IsLoaded = true;  
                console.log(this.PageVar.ReportData);
            })       
            .catch((error) => {console.log(error);});
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

    SetCurrentRow(strToFind) {
        this.PageVar.CurrentRow = this.PageVar.ReportData.find(obj => obj.Id == strToFind)
        //this.PageVar.CurrentRow.ResultClean = this.PageVar.CurrentRow.Result.replace('[SQLSTATE','<br>[SQLSTATE');
    }  

    ShowRowDetails(event) {
        this.SetCurrentRow([event.target.dataset.id]);
        this.toggle.ModalOther = true;
    }  

    ToggleAnything(event){
        this.toggle[event.target.dataset.togglename] = !this.toggle[event.target.dataset.togglename];
    }        
}