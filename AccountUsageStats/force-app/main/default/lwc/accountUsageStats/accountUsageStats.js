import { LightningElement, api } from 'lwc';

// The base URL (in this case https://www.googleapis.com/ must be added to the CSP Trusted Sites in Setup)
const QUERY_URL =
    'https://localhost/api/Integrations/GetUsage?AccId=';

export default class app extends LightningElement {

    accountId = '0014100001dLp2LAAS';
    //searchKey = '0014100001dLp2LAAS';
    NoStatsFound = null;
    loading = false;
    data = [];
    error;
    col = [
        {
            fieldName: 'Date', label: 'Date', type: 'date',
            typeAttributes: {
                month: 'short',
                year: 'numeric',
            },
        },
        {
            fieldName: 'AppDataSource', label: 'Source', type: 'text', cellAttributes:
                { iconName: { fieldName: 'trendIcon' }, iconPosition: 'right' }
        },
        { fieldName: 'SchoolLoginsTotal', label: 'App Logins', type: 'number' },
        { fieldName: 'StudentLoginsTotal', label: 'Student Logins', type: 'number' },
        { fieldName: 'StudentLoginsUnique', label: 'Unique Logins', type: 'number' },
        { fieldName: 'StudentCount', label: 'Students', type: 'number' },
        {
            fieldName: 'LoginRatio', label: 'Login Ratio', type: 'percent',
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
        this.accountId = event.target.value;
    }

    fetchUsageStats() {
        // Use standard Fetch API 
        this.loading = true;
        fetch(QUERY_URL + this.accountId + '&Mth=' + this.MonthOptionSelected)
            .then((response) => {
                // fetch isn't throwing an error if the request fails.
                // Therefore we have to check the ok property.
                if (!response.ok) {
                    this.error = response;
                }
                return response.json();
            })
            .then((jsonResponse) => {
                this.data = jsonResponse;
                if (typeof this.data.SiteDataAccount === 'undefined') {
                    this.error = JSON.stringify(this.data, undefined, 2);
                    this.data = undefined;
                } else {
                    this.NoStatsFound = this.data.SiteDataAccount.length == 0;
                    this.data.SiteDataAccount.forEach(function(entry) {
                        entry.LoginRatio = (entry.UniqueStudentLoginRatio/100).toFixed(4);
                    });
                }
                this.loading = false;
            })
            .catch((error) => {
                this.error = error;
                this.data = undefined;
            });
            this.loading = false;
    }
    //initialize

    connectedCallback() {
        this.fetchUsageStats();
    }
}