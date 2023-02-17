import { LightningElement, track } from 'lwc';

export default class UtlSearchCode extends LightningElement {

    @track data = {
        IsLoaded: true,
        SortField: 'label',
        SortAsc: true,
        SearchResults: null
    };    

    @track MyTest = true;

    fetchCodeSearchResults(SearchText) {
        this.data.IsLoaded = false;
        console.log('SearchText', SearchText);
        // Use standard Fetch API 
        fetch('https://is.xello.world/api/Integrations/SearchSQLForText?SearchText=' + SearchText).then((response) => response.json())
            .then((jsonResponse) => {
                let arr = jsonResponse.ReportData;
                if(arr != null) {
                    for(var i=0; i < arr.length; i++){
                        var row = arr[i];
                        //remove if sfi log table
                        if(row.schema == 'sfi' && row.ObjectName.substring(0, 2) =='z_') {
                            arr.splice(i,1); 
                            i--;// decrement index if item is removed
                        } 
                    }
                    this.data.SearchResults = arr;
                }
                this.data.IsLoaded = true;  
            })       
            .catch((error) => {console.log(error);});
    }

    handleSearchPress(event) {
        if(event.keyCode === 13){
          this.fetchCodeSearchResults(event.target.value);
        }
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

        this.data.SearchResults.sort((a, b) => {
            let fa = JSON.stringify(a[FieldToSort]).toLowerCase(), fb = JSON.stringify(b[FieldToSort]).toLowerCase();
            if(this.data.SortAsc) {
                return fa == fb ? 0 : fa > fb ? 1 : -1;
            } else {
                return fa == fb ? 0 : fa > fb ? -1 : 1;
            }
        });
    }  
}