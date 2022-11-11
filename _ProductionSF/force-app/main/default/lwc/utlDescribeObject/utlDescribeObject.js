import { LightningElement, api, track } from 'lwc';
import DescribeSalesforceObject from'@salesforce/apex/Describe.SalesforceObject';
import DescribeObjectList from'@salesforce/apex/Describe.ObjectList';

export default class UtlDescribeObject extends LightningElement {
    @track data = {
        IsLoaded: true,
        SortField: 'label',
        SortAsc: true,
        SfField: [],
        SfObjects: []
    };
    
    @track ac = { //stores all autocomplete variables
        CurrentOption: {label:'',value:''},
        Visible: false,
        AllOptions: []
    };   

    connectedCallback() {
        this.GetObjectList();
    }

    //List of object names
    GetObjectList() {
        this.data.IsLoaded = false;
        DescribeObjectList()
            .then(result => {
                console.log('result', result);
                for(var i=0; i < result.length; i++){
                    var TempField = result[i];
                    TempField.label = TempField.SobjectType;
                    TempField.value = TempField.SobjectType;
                    this.ac.AllOptions.push(TempField);
                }
                this.ac.FilteredOptions = this.data.SfObjects;
                this.data.IsLoaded = true;
            })
            .catch(error => {
                console.log('error',error);
                this.data.IsLoaded = true;
            });
    }

    SearchKeyUp(event) { 
        var SearchText = event.target.value;
        if(SearchText.length < 2) {
            this.ac.FilteredOptions = [];
            this.ac.Visible = false;
        } else {
            this.ac.FilteredOptions = this.ac.AllOptions.filter(obj => obj.label.toLowerCase().includes(SearchText.toLowerCase()));
            this.ac.Visible = true;
        }        
    }

    SetCurrentOption(event) { 
        this.ac.CurrentOption = this.ac.AllOptions.find(obj => obj.label == event.target.dataset.option);
        this.ac.Visible = false;
        this.DescribeObj(this.ac.CurrentOption.label)
    }   

    //Full details on a specific object
    DescribeObj(sfObjectName) {
        this.data.IsLoaded = false;
        this.data.SfField = [];
        DescribeSalesforceObject({SfObjectName: sfObjectName})
            .then(result => {
                //onsole.log('result', result);
                for(var i=0; i < result.length; i++){
                    var TempField = JSON.parse(result[i]);
                    TempField.keyIndex = i;
                    TempField.Pretty = JSON.stringify(TempField,undefined,2);
                    TempField.Hidden = true;
                    TempField.fieldArray = [];
                    TempField.FormulaHidden = true;
                    TempField.FormulaExists = false;
                    if(TempField.calculatedFormula != null) {
                        TempField.FormulaExists = true;
                    }

                    TempField.IsPicklist = false;
                    if(TempField.type == 'picklist') {
                        TempField.IsPicklist = true;
                        //onsole.log(TempField.picklistValues);
                    }

                    //onsole.log(TempField, TempField.length);
                    for (const [key, value] of Object.entries(TempField)) {
                        var NewObj = {};
                        NewObj.key = key;
                        NewObj.value = (key.length > 0) ? JSON.stringify(value,undefined,2) : value;
                        NewObj.Hidden = true;

                        TempField.fieldArray.push(NewObj);
                    }                    
                    // TempField[i].attrId = i;
                    // TempField[i].attrLength = TempField.length;
                    // TempField[i].Hidden = true;
                    this.data.SfField.push(TempField);
                }         
                this.data.IsLoaded = true;      
                //onsole.log('data', this.data);
            })
            .catch(error => {
                console.log('error',error);
                this.data.IsLoaded = true;
            });
    }    

    sort(event) {
        console.log(event.target.dataset.sortname);
        let FieldToSort = event.target.dataset.sortname;
        if(FieldToSort == null) return;

        this.data.SortAsc = (FieldToSort != this.data.SortField) ? true : !this.data.SortAsc;
        this.data.SortField = FieldToSort;

        let TempList = this.data.SfField;
        TempList.sort((a, b) => {

            let fa = JSON.stringify(a[FieldToSort]).toLowerCase(), fb = JSON.stringify(b[FieldToSort]).toLowerCase();

            if(this.data.SortAsc) {
                return fa == fb ? 0 : fa > fb ? 1 : -1;
            } else {
                return fa == fb ? 0 : fa > fb ? -1 : 1;
            }
            
        }); 
        this.data.SfField = TempList;

    }       
}