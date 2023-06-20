import { LightningElement, track } from 'lwc';
import {} from 'c/childDatePicker';

export default class UtlDynamicTable extends LightningElement {
    @track Report = {
        IsLoaded:false,
        List: [
            { label: 'Renewal Emails Log (All)', value: '964504', Params: '', ShowDates: true },
            { label: 'Renewal Emails Log (Failed)', value: '965657', Params: '', ShowDates: true },
            { label: 'Renewal Emails Log (SummaryByDay)', value: '966810', Params: '', ShowDates: true }
        ],
        data:[],
        columns:[]
    };    
    @track sortBy;
    @track sortDirection;

    //Required for child datepicker ///////////////////////////////////////////////////////////////
    @track ChildDatePicker = {
        StartDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()).toISOString().substring(0,10), 
        EndDate: new Date().toISOString().substring(0,10)
    };
    handleDatePickerChange(event) {
        this.ChildDatePicker = event.detail;
        console.log('ChildDatePicker: ', this.ChildDatePicker.StartDate);
        this.Report.Current.Params = '&String2=' + this.ChildDatePicker.StartDate + '&String3=' + this.ChildDatePicker.EndDate;
        this.GetReport();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////

    handleStartDateChange(event) {
        // Convert the date string to a JavaScript Date object
        this.Report.StartDate = event.detail.value;
    }

    handleEndDateChange(event) {
        // Convert the date string to a JavaScript Date object
        this.Report.EndDate = event.detail.value;
    }

    connectedCallback() {
        // this.Report.StartDate = new Date().toISOString().substring(0,10);
        // this.Report.EndDate = new Date().toISOString().substring(0,10);
        this.Report.Current = this.Report.List[0];
        this.GetReport();
    }

    handleReportChange(event){
        this.Report.Current = this.Report.List.find(obj => obj.value == event.detail.value);
        this.GetReport();
    }

    GetReport() {
        this.Report.IsLoaded = false;
        fetch('https://is.xello.world/api/Integrations/QueryBySprocId?SprocId=' + this.Report.Current.value + this.Report.Current.Params).then((response) => response.json())
            .then((jsonResponse) => {
                this.Report.data = jsonResponse.QueryResults;
                if(this.Report.data != null && this.Report.data.length > 0) {
                    this.Report.columns = [];
                    for (const [key, value] of Object.entries(this.Report.data[0])) {
                        //onsole.log(key,value,typeof(value));
                        this.Report.columns.push({ label: key, fieldName: key, sortable: true });
                    }
                }
                else {
                    this.Report.NoReportsFound = true;
                }
                this.Report.IsLoaded = true;  
                
            })       
            .catch((error) => {
                this.Report.IsLoaded = true;  
                console.log(error);
            });
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.Report.data));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.Report.data = parseData;
    }  

}