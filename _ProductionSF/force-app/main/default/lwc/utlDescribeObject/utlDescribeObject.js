import { LightningElement, api, track } from 'lwc';
import DescribeSalesforceObject from'@salesforce/apex/Describe.SalesforceObject';
import DescribeObjectList from'@salesforce/apex/Describe.ObjectList';
import DescribeRecordList from'@salesforce/apex/Describe.RecordTypeList';

export default class UtlDescribeObject extends LightningElement {
    @track toggle = { //Handles all toggle logic;
        ModalOther: false
      }
    @track data = {
        IsLoaded: true,
        SortField: 'label',
        SortAsc: true,
        SfField: [],
        SfFieldOriginal: [],
        SfObjects: [],
        CurrentField: {},
        CurrentObject: ''
    };
    @track ac = { //stores all autocomplete variables
        CurrentOption: {},
        Visible: false,
        AllOptions: []
    };   
    @track Pill = {
        SearchText: '', 
        List: []
      };
    @track FilteredObject = [];

    connectedCallback() {
        this.GetObjectList();
        setTimeout(() => { this.template.querySelector('lightning-input[data-id="ObjectInput"]').focus(); });
    }

    //List of object names
    GetObjectList() {
        this.data.IsLoaded = false;
        DescribeObjectList()
            .then(result => {
                // for(var i=0; i < result.length; i++){
                //     var TempField = result[i];
                //     TempField.label = TempField.Label;
                //     TempField.value = TempField.QualifiedApiName;
                //     this.ac.AllOptions.push(TempField);
                // }
                this.ac.AllOptions = result;
                this.ac.FilteredOptions = this.ac.AllOptions;
                this.data.IsLoaded = true;
                console.log('ac.AllOptions', this.ac.AllOptions);
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
            this.ac.FilteredOptions = this.ac.AllOptions.filter(obj => obj.Label.toLowerCase().includes(SearchText.toLowerCase()));
            this.ac.Visible = true;
            var DropMenuSize = (this.ac.FilteredOptions.length < 10) ? this.ac.FilteredOptions.length : 10;
            if(event.target.nextSibling != null) event.target.nextSibling.size = DropMenuSize;
        }       

        if(event.keyCode == 40) {
            event.target.nextSibling.focus();
            event.target.nextSibling.selectedIndex = 0;
        };        
        
    }

    SetCurrentOptionKeyCheck(event) { 
        if(event.keyCode == 13) {
            this.SetCurrentOption(event);
        };
    }  

    SetCurrentOption(event) { 
        this.ac.CurrentOption = this.ac.AllOptions.find(obj => obj.Label == event.target.value);
        this.ac.Visible = false;
        this.DescribeObj(this.ac.CurrentOption.QualifiedApiName);
    }   

    ChangetoReference(event) { 
        console.log('Look for QualifiedApiName: ' + event.target.dataset.id, this.ac.AllOptions)
        this.ac.CurrentOption = this.ac.AllOptions.find(obj => obj.QualifiedApiName == event.target.dataset.id);
        console.log('ac.CurrentOption',this.ac.CurrentOption);
        if(this.ac.CurrentOption != null) this.DescribeObj(this.ac.CurrentOption.QualifiedApiName)
    }  

    //Full details on a specific object
    DescribeObj(sfObjectName) {
        this.data.IsLoaded = false;
        this.data.SfField = [];
        DescribeSalesforceObject({SfObjectName: sfObjectName})
            .then(result => {
                this.data.CurrentObject = sfObjectName;
                //onsole.log('result', result);
                for(var i=0; i < result.length; i++){
                    var TempField = JSON.parse(result[i]);
                    // var SimpleArray = {};
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

                    TempField.RelatedObject = null;
                    if(TempField.referenceTo.length == 1) {
                        TempField.RelatedObject = TempField.referenceTo[0];
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
                    // SimpleArray.name = TempField.name;
                    // SimpleArray.inlineHelpText = TempField.inlineHelpText;
                    // this.data.SfObjectTest.push(SimpleArray);
                }         
                this.data.SfFieldOriginal = this.data.SfField;
                this.data.IsLoaded = true;      
                console.log('SfField:' + sfObjectName, this.data.SfField);
                setTimeout(() => { this.template.querySelector('lightning-input[data-id="SearchInput"]').focus(); });
            })
            .catch(error => {
                console.log('error',error);
                this.data.IsLoaded = true;
            });

        this.data.RecordTypes = null;
        DescribeRecordList({SfObjectName: sfObjectName})
            .then(result => {
                if(result.length > 0) this.data.RecordTypes = result;
                //onsole.log('DescribeRecordList', result);
            })
            .catch(error => {
                console.log('error',error);
            });            
    }    

    sort(event) {
        console.log('sorting by ',event.target.dataset.sortname);
        let FieldToSort = event.target.dataset.sortname;
        if(FieldToSort == null) return;
        
        //Clear all header sort classes (arrow up/down)
        var elSortHeaders = this.template.querySelectorAll("[data-sortname]");
        elSortHeaders.forEach((el) => {
            el.classList.remove("sort-desc");
            el.classList.remove("sort-asc");
        });

        this.data.SortAsc = (FieldToSort != this.data.SortField) ? true : !this.data.SortAsc;
        this.data.SortField = FieldToSort;
        event.target.classList.add((this.data.SortAsc) ? "sort-asc" : "sort-desc");

        this.data.SfField.sort((a, b) => {
            let fa = JSON.stringify(a[FieldToSort]).toLowerCase(), fb = JSON.stringify(b[FieldToSort]).toLowerCase();
            if(this.data.SortAsc) {
                return fa == fb ? 0 : fa > fb ? 1 : -1;
            } else {
                return fa == fb ? 0 : fa > fb ? -1 : 1;
            }
        });
    }  

    sortPickList(event) {
        console.log(event.target.dataset.sortname);
        let FieldToSort = event.target.dataset.sortname;
        if(FieldToSort == null) return;

        this.data.CurrentField.SortAsc = (FieldToSort != this.data.CurrentField.SortField) ? true : !this.data.CurrentField.SortAsc;
        this.data.CurrentField.SortField = FieldToSort;

        let TempList = this.data.CurrentField.picklistValues;
        TempList.sort((a, b) => {

            let fa = JSON.stringify(a[FieldToSort]).toLowerCase(), fb = JSON.stringify(b[FieldToSort]).toLowerCase();

            if(this.data.CurrentField.SortAsc) {
                return fa == fb ? 0 : fa > fb ? 1 : -1;
            } else {
                return fa == fb ? 0 : fa > fb ? -1 : 1;
            }
            console.log('SortComplete');
        }); 
        this.data.CurrentField.picklistValues = TempList;
        //onsole.log(this.data.CurrentField);
    }      
    SetCurrentField(name) {
        this.data.CurrentField = this.data.SfField.find(obj => obj.name == name)
    }  
    ShowFieldDetails(event) {
        this.SetCurrentField([event.target.dataset.id]);
        this.toggle.ModalOther = true;
        
        //Set the current tab (this took almost a day of coding to figure out - weird rendering when using a hidden modal)
        this.TempTabVar = event.target.dataset.tab;
        setTimeout(() => {
            var el = this.template.querySelector('lightning-tabset[data-id="tabFieldDetails"]'); //returns NULL unless in a setTimeout???
            el.activeTabValue = this.TempTabVar;
        });
        
    }  
    ElementDetails(event) {
        console.log(event.target.style)
    }  

    ToggleObj(event) {
        console.log(event.target.dataset.id);
        this.data.SfField[event.target.dataset.id].Hidden = !this.data.SfField[event.target.dataset.id].Hidden;
        //this.event.Hidden = !this.event.Hidden;
    }    
    ToggleAnything(event){
        this.toggle[event.target.dataset.togglename] = !this.toggle[event.target.dataset.togglename];
    }          

    handleSearchPress(event) {
        if(event.target.value.length == 0) {
            this.FilterPill();
        } else if(event.keyCode === 13){
          this.Pill.List.push({label:event.target.value});
          event.target.value = '';
          this.FilterPill();
        } else if(event.keyCode !== 13 && event.target.value.length > 1) {
            //Filter original data on name and label properties of the SfField object
            this.data.SfField = this.data.SfFieldOriginal.filter(obj => obj.name.toLowerCase().includes(event.target.value) || obj.label.toLowerCase().includes(event.target.value));
        } 
    }
    
    handleRemovePill(event) {
        //removes a specific pill 
        this.Pill.List = this.Pill.List.filter(e => e.label !== event.target.dataset.label);
        this.FilterPill();
    }
    
    //Shows the results of the current pills filtered using the OR concept
    FilterPill() {
        this.data.SfField = [];
        let arr1 = [];
        let arr2 = [];
        let arrFinal = [];
        if(this.Pill.List.length <= 0) {
            this.data.SfField = this.data.SfFieldOriginal;
        } else {
            this.Pill.List.forEach((el) => {
                arr1 = arrFinal; //arr1 becomes the final
                arr2 = this.data.SfFieldOriginal.filter(obj => obj.name.toLowerCase().includes(el.label));
                arrFinal = [...new Set([...arr1,...arr2])]; //merges both without duplicates
            });
            this.data.SfField = arrFinal;
        }
    }     

    
}