import { LightningElement, wire, api} from 'lwc';
import GetJson from '@salesforce/apex/HttpGetController.GetJson';

export default class usage extends LightningElement {

@api recordId;

col = [
    { fieldName: 'Date', label: 'Date', type: 'date' },
    { fieldName: 'AppDataSource', label: 'Source', type: 'text' },
    { fieldName: 'SchoolLoginsTotal', label: 'School Logins',  type: 'number' },
    { fieldName: 'StudentCount', label: 'Students', type: 'number' },
    { fieldName: 'StudentLoginsTotal', label: 'Student Logins', type: 'number' },                   
    { fieldName: 'StudentLoginsUnique', label: 'Student Logins Unique', type: 'number' },
    { fieldName: 'UniqueStudentLoginRatio', label: 'Unique Student Login Ratio', type: 'number' },
];                

resultjson;
//endpointURL;

get endpointURL() {
    return 'https://is.xello.world//api/Integrations/GetUsage?AccId=' + this.recordId;
} 

@wire(GetJson, {strEndPointURL:'$endpointURL'})
    retval ({error,data}){
        if (data) {
            this.resultjson = data.SiteDataAccount;
            console.log('GetJson resultjson ==> : ', this.resultjson); 
            console.log('GetJson endpointURL ==> : ', this.endpointURL); 
            console.log('GetJson recordId ==> : ', this.recordId) ; 
    }
}

}