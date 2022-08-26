//Decide here what to use api / wire / track
import { LightningElement, api, track } from 'lwc';
//import DescribeSalesforceObject from'@salesforce/apex/Describe.SalesforceObject';

export default class TestBasicV1 extends LightningElement {    
    @api recordId;
    @api objectApiName;
    @track popover = {} //Handles all popover logic
    @track data = {
        IsLoaded: false,
        SortField: 'label',
        SortAsc: true,
        SfField: []
    };
    fields = [
        'Id'
        ,'Name'
        ,'Amount'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
        ,'ArrRollup__c'
    ];

    @track Popover1Visible = false;

    // DescribeObj() {
    //     DescribeSalesforceObject({SfObjectName: 'Opportunity'})
    //         .then(result => {
    //             //onsole.log('result', result);
    //             for(var i=0; i < result.length; i++){
    //                 var TempField = JSON.parse(result[i]);
    //                 TempField.keyIndex = i;
    //                 TempField.Pretty = JSON.stringify(TempField,undefined,2);
    //                 TempField.Hidden = true;
    //                 TempField.fieldArray = [];
    //                 TempField.FormulaHidden = true;
    //                 TempField.FormulaExists = false;
    //                 if(TempField.calculatedFormula != null) {
    //                     TempField.FormulaExists = true;
    //                 }

    //                 TempField.IsPicklist = false;
    //                 if(TempField.type == 'picklist') {
    //                     TempField.IsPicklist = true;
    //                     console.log(TempField.picklistValues);
    //                 }

    //                 //onsole.log(TempField, TempField.length);
    //                 for (const [key, value] of Object.entries(TempField)) {
    //                     var NewObj = {};
    //                     NewObj.key = key;
    //                     NewObj.value = (key.length > 0) ? JSON.stringify(value,undefined,2) : value;
    //                     NewObj.Hidden = true;

    //                     TempField.fieldArray.push(NewObj);
    //                 }                    
    //                 // TempField[i].attrId = i;
    //                 // TempField[i].attrLength = TempField.length;
    //                 // TempField[i].Hidden = true;
    //                 this.data.SfField.push(TempField);
    //             }         
    //             this.data.IsLoaded = true;      
    //             console.log('data', this.data);
    //         })
    //         .catch(error => {
    //             console.log('error',error);
    //         });
    // }

    sort(event) {
        //onsole.log(event.target.dataset.sortname);
        let FieldToSort = event.target.dataset.sortname;
        if(FieldToSort == null) return;

        this.data.SortAsc = (FieldToSort != this.data.SortField) ? true : !this.data.SortAsc;
        this.data.SortField = FieldToSort;

        this.data.SfField.sort((a, b) => {

            let fa = JSON.stringify(a[FieldToSort]).toLowerCase(), fb = JSON.stringify(b[FieldToSort]).toLowerCase();

            if(this.data.SortAsc) {
                return fa == fb ? 0 : fa > fb ? 1 : -1;
            } else {
                return fa == fb ? 0 : fa > fb ? -1 : 1;
            }
            
        });

    } 


    stringify(value) {
        switch (typeof value) {
          case 'string': case 'object': return JSON.stringify(value);
          default: return String(value);
        }
      };

    ToggleObj(event) {
        console.log(event.target.dataset.id);
        this.data.SfField[event.target.dataset.id].Hidden = !this.data.SfField[event.target.dataset.id].Hidden;
        //this.event.Hidden = !this.event.Hidden;
    }

    PopoverToggle(event) {
        this.popover[event.target.dataset.popovername] = (this.popover[event.target.dataset.popovername]) ? false : true;
    }
    PopoverShow(event) {
        this.popover[event.target.dataset.popovername] = true;
    }
    PopoverHide(event) {
        //onsole.log(event.target.dataset.popovername);
        this.popover[event.target.dataset.popovername] = false;
    }

    SimpleTable = [
        { label: 'Last 24 months', value: '24' },
        { label: 'Last 12 months', value: '12' },
        { label: 'Last 6 months', value: '6' },
        { label: 'Last 3 months', value: '3' },
    ];
    
    get MyData() {  //Forces call from HTML
        return SimpleTable;     
    }

    get PageInititated() {  //Forces call from HTML

        console.log(this.recordId);
        console.log(this.SimpleTable[0].label);
        return true;
            
    }

    RunSomeCode() {
        console.log(this.recordId);
    }   

    connectedCallback() {
        this.RunSomeCode(); //This can run before the record info is even loaded
    }
}