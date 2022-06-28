import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import SfUserId from '@salesforce/user/Id';
import UserPreferencesShowCityToExternalUsers from '@salesforce/schema/User.UserPreferencesShowCityToExternalUsers';

export default class AccountSftpInfo extends LightningElement {
    @api recordId;
    @track record;
    @wire(getRecord, { recordId: '$recordId', fields: [
        'Account.Name'
        ,'Account.SchoolId__c'
        ,'Account.InstitutionId__c'
        ,'Account.SftpFolder__c'
        ,'Account.SftpIntegrationDistrictId__c'
        ,'Account.OwnerId'
    ] }) accSF;   

    @track sftp = {
        HasFolder:false,  //data from API call
        HasReports:false,  //data from API call
        ShowCredentials:false, //Modal toggle for SFTP credentials
        ShowReportEdit:false, //Modal toggle for SFTP report edit / create
        IsAnthony:false, 
        IsOwner:false,
        IsLoaded:false,
        Debug:false,
        SftpInfo: {},
        SourceServerOption: [
            { label: 'AzureUS', value: 'AzureUS' },
            { label: 'AzureCA', value: 'AzureCA' },
            { label: 'AzureUK', value: 'AzureUK' },
            { label: 'CC', value: 'CC' }
        ],
        FrequencyOption: [
            { label: 'Nightly', value: 'D' },
            { label: 'Weekly', value: 'W' },
            { label: 'Monthly', value: 'M' }
        ]        
    };

    error;
    @track blFalse = false;
    
    get accSF_Loaded() {  //Repeatedly checks until true
        if(this.accSF.data !== undefined){
            this.acc = this.accSF.data.fields;
            this.sftp.IsOwner = (SfUserId == '00541000002RNSMAA4' || SfUserId == this.accSF.data.fields.OwnerId.value) ? true : false;
            this.sftp.Debug = (SfUserId == '00541000002RNSMAA4' || SfUserId == this.accSF.data.fields.OwnerId.value) ? true : false;
            return true;
        } else {
            return false;
        }
            
    }

    fetchSftpData() {
        this.sftp.IsLoaded = false;
        console.log('ShowReportEdit2', this.sftp.ShowReportEdit);
        // Use standard Fetch API 
        fetch('https://is.xello.world/api/Integrations/GetSftpForAccount?AccId=' + this.recordId).then((response) => response.json())
            .then((jsonResponse) => {
                this.sftp.SftpInfo = jsonResponse.SftpInfo;
                this.sftp.SftpReports = jsonResponse.SftpReports;  
                if(this.sftp.SftpInfo != null) {
                    this.sftp.HasReports = this.sftp.SftpReports.length > 0; //only make this true after confirmed so alert message does not appear (or flash) on screen
                    console.log('ShowReportEdit3', this.sftp.ShowReportEdit);
                    this.sftp.SftpReports.forEach(function(entry) {
                        entry.IsXello = (entry.SourceServer == 'CC') ? false : true;
                        if(entry.LastRunDate != null) entry.LastRunDate = new Date(entry.LastRunDate);
                        if(entry.CreatedDate != null) entry.CreatedDate = new Date(entry.CreatedDate);
                        entry.IsMonthly = (entry.Frequency == 'M') ? true: false;
                        entry.HasExtractsFolder = (entry.FileFolder.indexOf('\\Extracts\\') != -1) ? true: false;
                        //console.log('ShowReportEdit4', this.sftp.ShowReportEdit);
                        //entry.FrequencyText = 
                        entry.FileFolder = entry.FileFolder.substring(28, 500);  
                        switch(entry.Frequency) {
                            case 'M':
                                entry.FrequencyText = 'Monthly'
                              break;
                            case 'W':
                                entry.FrequencyText = 'Weekly'
                              break;
                            default:
                                entry.FrequencyText = 'Nightly'
                        }
                        if(entry.DurationSeconds == null) entry.DurationSeconds = 0;
                        entry.IsTooLong = (entry.DurationSeconds > 60 && entry.IsActive)  ? true: false;
                    });

                    this.sftp.HasFolder = true;
                }
                else {
                    this.sftp.HasFolder = false;
                    this.sftp.NoReportsFound = true;
                }
                this.sftp.IsLoaded = true;  
                
            })       
            .catch((error) => {console.log(error);});
    }
    connectedCallback() {
        console.log('ShowReportEdit1', this.sftp.ShowReportEdit);       
        this.fetchSftpData();
        this.sftp.IsAnthony = (SfUserId == '00541000002RNSMAA4') ? true : false;

    }
    ToggleCredentials(event){
        this.sftp.ShowCredentials = !this.sftp.ShowCredentials;
    }
    @track CurrentReport = {};
    handleReportNew(event){
        //Start a new report
        this.CurrentReport.ID = null;
        this.CurrentReport.StoredProcedure = 'Extracts.';
        this.CurrentReport.ReportName = '';
        this.CurrentReport.ReportDescription = null;
        this.CurrentReport.FileLocation = this.sftp.SftpInfo.SftpPath + '\Extracts\\';
        this.CurrentReport.IsActive = 0;
        this.CurrentReport.SourceServer = 'AzureUS';
        this.CurrentReport.Frequency = 'M';
        this.sftp.ShowReportEdit = true;
    }
    handleReportEdit(event){
        //Find report based on data.id, use {...object} to make a copy
        this.CurrentReport = {...this.sftp.SftpReports.find( ({ ID }) => ID == event.target.dataset.id)};
        this.sftp.ShowReportEdit = true;
    }
    handleReportCancel(event) {
        this.sftp.ShowReportEdit = false;
    }
    handleReportSave(event) {
        
        //Hitting a wall with CORS using POST so using a larger (silly) GET - argghhhh
        var params = ''
        var params = params + '?ID=' + encodeURIComponent(this.CurrentReport.ID)
        var params = params + '&ReportName=' + encodeURIComponent(this.CurrentReport.ReportName)
        if(this.CurrentReport.ReportDescription == null) {
            var params = params + '&ReportDescription=' + encodeURIComponent(this.CurrentReport.ReportName)
        } else {
            var params = params + '&ReportDescription=' + encodeURIComponent(this.CurrentReport.ReportDescription)
        }
        var params = params + '&StoredProcedure=' + encodeURIComponent(this.CurrentReport.StoredProcedure)
        var params = params + '&Frequency=' + encodeURIComponent(this.CurrentReport.Frequency)
        //var params = params + '&Frequency=' + encodeURIComponent(this.CurrentReport.IsMonthly ? 'M' : 'D')
        var params = params + '&FileLocation=' + encodeURIComponent(this.CurrentReport.FileLocation)
        var params = params + '&SourceServer=' + encodeURIComponent(this.CurrentReport.SourceServer)
        var params = params + '&IsActive=' + encodeURIComponent(this.CurrentReport.IsActive ? 1 : 0)

        fetch('https://is.xello.world/api/Integrations/SaveSftpReport' + params).then((response) => response.json())
            .then((jsonResponse) => {
                this.fetchSftpData(); 
                this.sftp.ShowReportEdit = false;
            })       
            .catch((error) => {console.log(error);});

        
        // Use standard Fetch API 
        // fetch('https://is.xello.world/api/Integrations/SaveSftpReport',
        //     {
        //         method: "POST",
        //         body: JSON.stringify(params),
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Origin': 'https://is.xello.world',
        //             'Access-Control-Allow-Origin': '*'
        //         }
        //      }).then((response) => response.json())
        //          .then((jsonResponse) => {
        //              console.log(jsonResponse.SftpReport);
        //          })       
        //          .catch((error) => {console.log(error);});

        // fetch('https://is.xello.world/api/Integrations/SaveSftpReport',
        // {
        //     method: "POST",
        //     body: params
        // }.then((response) => response.json())
        //     .then((jsonResponse) => {
        //         console.log(jsonResponse.SftpReport);
        //     })       
        //     .catch((error) => {console.log(error);})
        // );
    }
    handleReportInputChange(event) {
        this.CurrentReport[event.target.name] = event.target.value;
        if(event.target.name == 'StoredProcedure' && this.CurrentReport.ID == null) {
            var SprocNameOnly = this.CurrentReport.StoredProcedure.replace('Extracts.','');
            this.CurrentReport.ReportName = SprocNameOnly;
            this.CurrentReport.FileLocation = this.sftp.SftpInfo.SftpPath + '\Extracts\\' + SprocNameOnly + '.csv';
        }
    }
    handleChangeSourceServer(event) {
        this.CurrentReport.SourceServer = event.detail.value;
    }
    handleChangeFrequency(event) {
        this.CurrentReport.Frequency = event.detail.value;
    }    
    handleToggleAnyBoolean(event) {
        this.CurrentReport[event.target.dataset.fieldname] = !this.CurrentReport[event.target.dataset.fieldname];
    }
    handleToggleAnyBooleanSftp(event) {
        this.sftp[event.target.dataset.fieldname] = !this.sftp[event.target.dataset.fieldname];
        
    }

}