import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue, ExtraTypeInfo } from 'lightning/uiRecordApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { getDataConnectorSourceFields } from 'lightning/analyticsWaveApi';

export default class RevSummaryOpp extends LightningElement {
    @api recordId;
    loaded = false;
    @track Opp = {
        IsLoaded:false //page loaded and ready to display
        ,IsSfLoaded:false
        ,isTimeLineVisible:false
        ,ShowNew:false
        ,ShowRenewal:false
        ,ShowRevChange:false
    };

    get RenewalExpectedOveride() { 
        return this.Opp.Renewal_Expected_Override__c;
    }

    get PrimaryRevenueOveride() { 
        if(this.Opp.PrimaryRevenueOveride__c == null || this.Opp.PrimaryRevenueOveride__c == 0) {
            return false;
        } else {
            return true;
        }
    }    

    fetchLineItems() {
        // Use standard Fetch API - TODO: Use the getRelatedListRecords wire call eventually 
        this.Opp.IsLoaded = false;
        fetch('https://is.xello.world/api/Integrations/GetLineItemsForRevenueReporting?OppId=' + this.recordId).then((response) => response.json())
        .then((jsonResponse) => {
            this.Opp =  {...this.Opp, ...jsonResponse.Opp};
            this.Opp.LineItems = jsonResponse.LineItems;
            if(this.Opp.LineItems.length == 0) {
                this.Opp.NoStatsFound
                return;
            }

            this.Opp.DurationMths = Math.round(this.Opp.Contract_Duration__c * 12); //Get Duration
            // this.Opp.Year1Value = 0;
            // this.Opp.ValueYearFuture = 0;
            this.Opp.FirstYearMark = Math.round(12 / this.Opp.DurationMths * 100);

            //Determine the tick marks for each year
            let n = 12;
            let Ticks = [];
            while (n < this.Opp.DurationMths) {
                let tempStyle = 'margin-left:' + Math.round(n / this.Opp.DurationMths * 100) + '%;';
                Ticks.push({TickStyle: tempStyle, TickText: 'YR' + ((n/12) + 1)});
                n = n + 12;
            }
            this.Opp.Ticks = Ticks;
            this.Opp.HasLineSplits = false;

            //Generates values for display lines
            this.Opp.LineItems.forEach((entry) => {
                entry.SecondaryRevenue = entry.TotalPrice - entry.PrimaryRevenue;
                entry.LineStart = (entry.MthsFromStart > 0) ? Math.round(entry.MthsFromStart / this.Opp.DurationMths * 100) : 0;
                entry.LineClass = (entry.MthsFromStart >= 12) ? 'TimelineBar RevenueFuture' : 'TimelineBar RevenueCurrent';
                entry.LineValue = (entry.MthsFromStart >= 12) ? entry.SecondaryRevenue : entry.PrimaryRevenue;
                entry.LineSplit = (entry.MthsFromStart < 12 && entry.DurationMth + entry.MthsFromStart > 12) ? true : false; //Must start in first year and go beyond 12 months

                entry.LineWidth = Math.round(entry.DurationMth / this.Opp.DurationMths * 100) - 1;
                entry.LineStyle = 'margin-left: ' + entry.LineStart + '%; width:' + entry.LineWidth + '%';

                if(entry.LineSplit) { 
                    entry.LineStyle2 = 'margin-left: ' + this.Opp.FirstYearMark + '%; width:' + (entry.LineStart + entry.LineWidth - this.Opp.FirstYearMark) + '%';
                    this.Opp.HasLineSplits = true;
                }
                entry.Title = entry.StartDate.substring(0, 10) + ' - ' + entry.EndDate.substring(0, 10);
                //totals
                
                // this.Opp.Year1Value = this.Opp.PrimaryRevenue__c;

                entry.ShowResubIcon = false;
                entry.ResubIcon = '';
                entry.ResubIconText = '';
                if(entry.RenewNextYear__c) {
                    entry.ResubIcon = 'utility:sync';
                    entry.ShowResubIcon = true;
                    entry.ResubIconText = 'Added to future Opps';
                }
                
                entry.ResubIconVariant = '';
                if(entry.RenewNextYear__c && entry.ExcludeFutureArr__c) {
                    entry.ResubIconVariant = 'error';
                    entry.ResubIconText = 'Added to future Opps (but not Expected ARR)';
                }
                
            });


            this.Opp.SecondaryRevenue = this.Opp.Amount - this.Opp.PrimaryRevenue__c;
            this.Opp.PrimaryRevTickStyle = 'margin-left: 0%; width:' + Math.round((12 / this.Opp.DurationMths * 100) - 1) + '%;position:absolute;';
            this.Opp.SecondaryRevTickStyle = 'margin-left: ' + Math.round(12 / this.Opp.DurationMths * 100) + '%; width:' + Math.round(99 - (12 / this.Opp.DurationMths * 100)) + '%;position:absolute;';

            //Determine renewal rate
            this.Opp.RenewalRateBadgeolor = 'slds-badge BadgeMinPadding';
            this.Opp.RenewalRate = Math.round(this.Opp.Renewal_Adjusted_Rate__c);
            if(this.Opp.RenewalRate > 100) { this.Opp.RenewalRateBadgeolor = 'slds-badge slds-theme_success BadgeMinPadding Opacity5' } 
            if(this.Opp.RenewalRate < 100) { this.Opp.RenewalRateBadgeolor = 'slds-badge slds-theme_error BadgeMinPadding Opacity5' } 

            if(this.Opp.Type != 'New') { this.Opp.ShowRenewal = true } //Renewal or Upsell
            if(this.Opp.Type != 'Renewal') { this.Opp.ShowNew = true } //New or Upsell
            if(this.Opp.Revenue_Change_Amount_Override__c != null || this.Opp.Revenue_Change_Amount__c > 0) { this.Opp.ShowRevChange = true } //only show when needed

            console.log('this.Opp',this.Opp);
            this.Opp.IsLoaded = true;

        })       
        .catch((error) => {console.log(error);});

    }

    connectedCallback() {
        this.fetchLineItems();
    }

    TimelineToggle(event) { 
        this.Opp.isTimeLineVisible = !this.Opp.isTimeLineVisible;
    }

    RefreshOppData() { 
        this.fetchLineItems(); 
    }
}