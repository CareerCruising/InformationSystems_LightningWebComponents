import { LightningElement, api } from 'lwc';

// The base URL (in this case https://www.googleapis.com/ must be added to the CSP Trusted Sites in Setup)
const QUERY_URL =
    'https://localhost/api/Integrations/GetUsage?AccId=';

export default class MiscRestCall extends LightningElement {

    searchKey = '0014100001dLp2LAAS';
    data;
    error;
    col = [
        { fieldName: 'Date', label: 'Date', type: 'date',
        typeAttributes: {
            month: 'short',
            year: 'numeric',
          },
        },
        { fieldName: 'AppDataSource', label: 'Source', type: 'text' },
        { fieldName: 'SchoolLoginsTotal', label: 'App Logins',  type: 'number' },
        { fieldName: 'StudentLoginsTotal', label: 'Student Logins', type: 'number' },                   
        { fieldName: 'StudentLoginsUnique', label: 'Unique Logins', type: 'number' },
        { fieldName: 'StudentCount', label: 'Students', type: 'number' },
        { fieldName: 'UniqueStudentLoginRatio', label: 'Login Ratio', type: 'percent',
        typeAttributes: {
            maximumFractionDigits: '1',
          }, },
    ];  

    handleSearchKeyChange(event) {
        this.searchKey = event.target.value;
    }

    handleSearchClick() {
        // The Fetch API is currently not polyfilled for usage in IE11.
        // Use XMLHttpRequest instead in that case.
        fetch(QUERY_URL + this.searchKey)
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
            })
            .catch((error) => {
                this.error = error;
                this.data = undefined;
            });
    }
}