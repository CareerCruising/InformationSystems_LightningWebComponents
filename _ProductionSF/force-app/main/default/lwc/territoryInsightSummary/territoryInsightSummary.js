import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class TerritoryInsightSummary extends NavigationMixin(LightningElement) {
    @api recordId;
    @track popover = {}; //Handles all popover logic
    @track FilterData = { //Handles all filtering
        List: [
            { label: 'Districts (All)', value: 'Districts (All)' },
            { label: 'Districts ($50k+)', value: 'Districts ($50k+)' },
            { label: 'Districts ($10k-50k)', value: 'Districts ($10k-50k)' },
            { label: 'Districts ($0-10k)', value: 'Districts ($0-10k)' },
            // { label: 'Single Sites', value: 'Single Sites' },
            // { label: 'College Parents', value: 'College Parents' },
            // { label: 'Colleges', value: 'Colleges' }
        ],
        Current: 'Districts (All)'
    };
    @track Report = {
        IsLoaded:false,
        ShowDistricts:true,
        data:{}
    };  
    @wire(getRecord, { recordId: '$recordId', fields: [
        'Territories__c.Name'
        ,'Territories__c.StateProv__c'
        ,'Territories__c.Country__c'
    ] })sfTerritory({ error, data }) {
        if (data) {
            this.Report.Territory = data.fields;
            var Terr = this.Report.Territory.Name.value.toLowerCase();
            //Make sure the district info is only for K12 territories
            if (!Terr.includes('non-k12') && !Terr.includes('college')) {
                this.Report.ShowDistricts = true;
                this.GetReport();
            }
        } else if (error) {
            console.log(error);
        }
    };   

    connectedCallback() {
        console.log('connectedCallback');
    }

    GetReport() {
        this.Report.IsLoaded = false;
        fetch('https://is.xello.world/api/Integrations/QueryBySprocId?SprocId=967963&String1=' + this.recordId).then((response) => response.json())
            .then((jsonResponse) => {
                
                if(jsonResponse.QueryResults != null && jsonResponse.QueryResults.length > 0) {
                    this.Report.data = jsonResponse.QueryResults;
                    console.log(this.Report.data);
                    this.ChangeFilterType();
                    
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

    ChangeFilterType(event) {
        if(event != null) this.FilterData.Current = event.detail.value;
        console.log('Current',this.FilterData.Current);
        //Filter original data by new FilterType
        var filteredData = this.Report.data.filter((item) => {
            return item.FilterType === this.FilterData.Current;
        });

        //Assign each AccountType as object to the this.filter.Type object
        this.FilterData.Type = filteredData.reduce(function(acc, curr) {
            if (!acc[curr.AccountType]) {
                acc[curr.AccountType] = {};
            }
            acc[curr.AccountType] = curr;
            return acc;
        }, {});

        if(this.FilterData.Type.District == null) this.FilterData.Type.District = {};
        if(this.FilterData.Type.HS == null) this.FilterData.Type.HS = {};
        if(this.FilterData.Type.MS == null) this.FilterData.Type.MS = {};
        if(this.FilterData.Type.ES == null) this.FilterData.Type.ES = {};
        if(this.FilterData.Type.Other == null) this.FilterData.Type.Other = {};
        if(this.FilterData.Type.College == null) this.FilterData.Type.College = {};

        // var acc = this.FilterData.Type;
        // for (var i = 0, l = acc.length; i < l; i++) {
        //     console.log(acc[i]);
        //     // ...
        // }
        // this.FilterData.Type = acc;

        console.log('count:', this.FilterData.Type.District);
    }

    GetReportOLD() {
        this.Report.IsLoaded = false;
        fetch('https://is.xello.world/api/Integrations/QueryBySprocId?SprocId=967963&String1=' + this.recordId).then((response) => response.json())
            .then((jsonResponse) => {
                
                if(jsonResponse.QueryResults != null && jsonResponse.QueryResults.length > 0) {
                    this.Report.data = jsonResponse.QueryResults[0];
                    this.Report.data.DistrictCountPercent = (this.Report.data.Districts == 0) ? 0 : (this.Report.data.DistrictWithXello / this.Report.data.Districts * 100).toFixed(0);
                    this.Report.data.DistrictCountWidthStyle = 'width:' + this.Report.data.DistrictCountPercent + '%;'
                    this.Report.data.DistrictArrPercent = (this.Report.data.DistrictArrMax == 0) ? 0 : (this.Report.data.DistrictArrCurrent / this.Report.data.DistrictArrMax * 100).toFixed(0);
                    this.Report.data.DistrictArrWidthStyle = 'width:' + this.Report.data.DistrictArrPercent + '%;'

                    this.Report.data.HSCountPercent = (this.Report.data.SchHS == 0) ? "0%" : (this.Report.data.SchHSWithXello / this.Report.data.SchHS * 100).toFixed(0).toString() + '%';
                    this.Report.data.HSCountDegrees = (this.Report.data.SchHS == 0) ? "--progress: 0deg" : '--progress: ' + (this.Report.data.SchHSWithXello / this.Report.data.SchHS * 360).toFixed(0).toString() + 'deg;';
                    this.Report.data.MSCountPercent = (this.Report.data.SchMS == 0) ? "0%" : (this.Report.data.SchMSWithXello / this.Report.data.SchMS * 100).toFixed(0).toString() + '%';
                    this.Report.data.MSCountDegrees = (this.Report.data.SchMS == 0) ? "--progress: 0deg" : '--progress: ' + (this.Report.data.SchMSWithXello / this.Report.data.SchMS * 360).toFixed(0).toString() + 'deg;';
                    this.Report.data.ESCountPercent = (this.Report.data.SchES == 0) ? "0%" : (this.Report.data.SchESWithXello / this.Report.data.SchES * 100).toFixed(0).toString() + '%';
                    this.Report.data.ESCountDegrees = (this.Report.data.SchES == 0) ? "--progress: 0deg" : '--progress: ' + (this.Report.data.SchESWithXello / this.Report.data.SchES* 360).toFixed(0).toString() + 'deg;';
                    this.Report.data.OtherCountPercent = (this.Report.data.SchOther == 0) ? "0%" : (this.Report.data.SchOtherWithXello / this.Report.data.SchOther * 100).toFixed(0).toString() + '%';
                    this.Report.data.OtherCountDegrees = (this.Report.data.SchOther == 0) ? "--progress: 0deg" : '--progress: ' + (this.Report.data.SchOtherWithXello / this.Report.data.SchOther * 360).toFixed(0).toString() + 'deg;';

                    this.Report.data.HSArrPercent = (this.Report.data.SchHSArrMax == 0) ? "0%" : (this.Report.data.SchHSArrCurrent / this.Report.data.SchHSArrMax * 100).toFixed(0).toString() + '%';
                    this.Report.data.HSArrDegrees = (this.Report.data.SchHSArrMax == 0) ? "--progress: 0deg" : '--progress: ' + (this.Report.data.SchHSArrCurrent / this.Report.data.SchHSArrMax * 360).toFixed(0).toString() + 'deg;';
                    this.Report.data.MSArrPercent = (this.Report.data.SchMSArrMax == 0) ? "0%" : (this.Report.data.SchMSArrCurrent / this.Report.data.SchMSArrMax * 100).toFixed(0).toString() + '%';
                    this.Report.data.MSArrDegrees = (this.Report.data.SchMSArrMax == 0) ? "--progress: 0deg" : '--progress: ' + (this.Report.data.SchMSArrCurrent / this.Report.data.SchMSArrMax * 360).toFixed(0).toString() + 'deg;';
                    this.Report.data.ESArrPercent = (this.Report.data.SchESArrMax == 0) ? "0%" : (this.Report.data.SchESArrCurrent / this.Report.data.SchESArrMax * 100).toFixed(0).toString() + '%';
                    this.Report.data.ESArrDegrees = (this.Report.data.SchESArrMax == 0) ? "--progress: 0deg" : '--progress: ' + (this.Report.data.SchESArrCurrent / this.Report.data.SchESArrMax * 360).toFixed(0).toString() + 'deg;';
                    this.Report.data.OtherArrPercent = (this.Report.data.SchOtherArrMax == 0) ? "0%" : (this.Report.data.SchOtherArrCurrent / this.Report.data.SchOtherArrMax * 100).toFixed(0).toString() + '%';
                    this.Report.data.OtherArrDegrees = (this.Report.data.SchOtherArrMax == 0) ? "--progress: 0deg" : '--progress: ' + (this.Report.data.SchOtherArrCurrent / this.Report.data.SchOtherArrMax * 360).toFixed(0).toString() + 'deg;';                       

                    var TotalRisk = this.Report.data.RiskHigh + this.Report.data.RiskLow + this.Report.data.RiskMed + this.Report.data.RiskNA;
                    this.Report.data.Risk1 = 'width:' + (this.Report.data.RiskLow / TotalRisk * 100).toFixed(0).toString() + '%';
                    this.Report.data.Risk2 = 'width:' + ((this.Report.data.RiskLow + this.Report.data.RiskMed) / TotalRisk * 100).toFixed(0).toString() + '%';
                    this.Report.data.Risk3 = 'width:' + ((this.Report.data.RiskLow + this.Report.data.RiskMed + this.Report.data.RiskHigh) / TotalRisk * 100).toFixed(0).toString() + '%';
                    console.log(this.Report.data);
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

    PopoverShow(event) {
        this.popover[event.target.dataset.popovername] = true;
    }
    PopoverHide(event) {
        //onsole.log(event.target.dataset.popovername);
        this.popover[event.target.dataset.popovername] = false;
    }

    navigateToDistrictReport(event) {  
        let filter2 = event.target.dataset.fv2;
        let filter3 = event.target.dataset.fv3;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: '00O41000008Wl04EAC',
                objectApiName: 'Report',
                actionName: 'view'
            },
            state : {
                fv1: this.Report.Territory.Name.value,
                fv2: filter2,
                fv3: filter3
            }
        }).then(url => { window.open(url) });
    }    

    navigateToSiteReport(event) {  
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: '00O1K000009FfmJUAS',
                objectApiName: 'Report',
                actionName: 'view'
            },
            state : {
                fv0: this.Report.Territory.Name.value,
            }
        }).then(url => { window.open(url) });
    }      

    SampleCode(event) {  
        array.forEach(element => {
            
        });
    }   

};