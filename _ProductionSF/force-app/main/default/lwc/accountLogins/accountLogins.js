import { LightningElement, api, track } from 'lwc';


// The base URL (in this case https://is.xello.world/) must be added to the CSP Trusted Sites in Setup
const QUERY_URL =
    'https://is.xello.world/api/Integrations/GetUsage?AccId=';

export default class app extends LightningElement {

    @api recordId;
    @track LoginData = [
        {Loaded:false},  //data from API call
    ];

    NoStatsFound = null;
    loading = false;
    data = [];
    error;
    col = [
        {
            fieldName: 'Date', label: 'Date', type: 'date', hideDefaultActions: 'true', initialWidth: 120,
            typeAttributes: {
                month: 'short',
                year: 'numeric',
            },
        },
        {fieldName: 'AppDataSource', label: 'Source', type: 'text', hideDefaultActions: 'true' },
        //{ fieldName: 'SchoolLoginsTotal', label: 'App Logins', type: 'number', hideDefaultActions: 'true', initialWidth: 120 },
        { fieldName: 'StudentCount', label: 'Students', type: 'number', hideDefaultActions: 'true', initialWidth: 120 },
        { fieldName: 'StudentLoginsTotal', label: 'Student Logins', type: 'number', hideDefaultActions: 'true', initialWidth: 120 },
        { fieldName: 'StudentLoginsUnique', label: 'Unique Logins', type: 'number', hideDefaultActions: 'true', initialWidth: 120 },
        {
            fieldName: 'LoginRatio', label: 'Login Ratio', type: 'percent', hideDefaultActions: 'true', initialWidth: 120,
            typeAttributes: {
                maximumFractionDigits: '1',
            },
        },
    ];

    
    MonthOptions = [
            { label: 'Last 24 months', value: '24' },
            { label: 'Last 12 months', value: '12' },
            { label: 'Last 6 months', value: '6' },
            { label: 'Last 3 months', value: '3' },
        ];
    MonthOptionSelected = '12';


    handleMonthOptionChange(event) {
        
        console.log('event.detail',event.detail);
        this.MonthOptionSelected = event.detail.value;
        this.fetchUsageStats();
    }
    handleSearchKeyChange(event) {
        this.recordId = event.target.value;
    }

    fetchUsageStats() {
        // Use standard Fetch API 
        fetch('https://is.xello.world/api/Integrations/GetUsage?AccId=' + this.recordId + '&Mth=' + this.MonthOptionSelected).then((response) => response.json())
        .then((jsonResponse) => {
            this.LoginData.SiteDataAccount = jsonResponse.SiteDataAccount;
            this.LoginData.NoStatsFound = this.LoginData.SiteDataAccount.length == 0;

            var NewId = 0;
            this.LoginData.SiteDataAccount.forEach(function(entry) {
                entry.LoginRatio = (entry.UniqueStudentLoginRatio/100).toFixed(4);
                entry.AvgLogins = (entry.StudentLoginsTotal/entry.StudentLoginsUnique).toFixed(4);
                if(entry.Date != null) entry.Date = new Date(entry.Date);
                entry.LoginRatioProgress = 'width:' + entry.LoginRatio + '%'
                
                NewId = NewId + 1;
                entry.Id = NewId;
            });
            this.LoginData.Loaded = true;
        })       
        .catch((error) => {console.log(error);});

    }

    connectedCallback() {
        this.fetchUsageStats();
    }
}