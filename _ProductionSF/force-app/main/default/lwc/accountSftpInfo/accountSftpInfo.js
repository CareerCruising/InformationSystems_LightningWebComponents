import { LightningElement, api, track, wire } from 'lwc';
import LightningAlert from 'lightning/alert';
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
        ,'Account.OwnerId'
        ,'Account.BillingCountryCode'
    ] }) accSF;   

    @track sftp = {
        HasFolder:false,  //data from API call
        HasReports:false,  //data from API call
        ShowCredentials:false, //Modal toggle for SFTP credentials
        ShowReportEdit:false, //Modal toggle for SFTP report edit / create
        IsAnthony:false, 
        IsOwner:false,
        IsLoaded:false,
        Is_accSF_Loaded:false,
        Debug:false,
        SftpInfo: {},
        SftpServerOption: [
            { label: 'ftp.careercruising.com', value: 'ftp.careercruising.com' },
            { label: 'ftp.xello.us', value: 'ftp.xello.us' },
            { label: 'ftp.xello.ca', value: 'ftp.xello.ca' },
            { label: 'ftp.xello.co.uk', value: 'ftp.xello.co.uk' }
        ],
        SourceServerOption: [
            { label: 'AzureUS', value: 'AzureUS' },
            { label: 'AzureCA', value: 'AzureCA' },
            { label: 'AzureUK', value: 'AzureUK' },
            { label: 'CC', value: 'CC' },
            { label: 'ISAdmin', value: 'ISAdmin' }
        ],        
        FrequencyOption: [
            { label: 'Daily', value: 'Daily' },
            { label: 'Weekly-Sun', value: 'Weekly-Sun' },
            { label: 'Weekly-Mon', value: 'Weekly-Mon' },
            { label: 'Weekly-Tue', value: 'Weekly-Tue' },
            { label: 'Weekly-Wed', value: 'Weekly-Wed' },
            { label: 'Weekly-Thu', value: 'Weekly-Thu' },
            { label: 'Weekly-Fri', value: 'Weekly-Fri' },
            { label: 'Weekly-Sat', value: 'Weekly-Sat' },
            { label: 'Monthly-Day1', value: 'Monthly-Day1' },
            { label: 'Monthly-Day7', value: 'Monthly-Day7' },
            { label: 'Monthly-Day14', value: 'Monthly-Day14' },
            { label: 'Monthly-Day21', value: 'Monthly-Day21' }
        ]        
    };

    error;
    @track blFalse = false;

    get accSF_Loaded() {  //Repeatedly checks until true - TODO: Still convinced there is a better way to wait until the @wire loads
        if(this.accSF.data !== undefined){ 
            if(!this.sftp.Is_accSF_Loaded) { //Run once
                this.acc = this.accSF.data.fields;
                this.sftp.IsOwner = (SfUserId == '00541000002RNSMAA4' || SfUserId == this.accSF.data.fields.OwnerId.value) ? true : false;
                this.sftp.Debug = (SfUserId == '00541000002RNSMAA4' || SfUserId == this.accSF.data.fields.OwnerId.value) ? true : false;
                this.sftp.Is_accSF_Loaded = true;
            }
            return true;
        } else {
            return false;
        }
            
    }

    fetchSftpData() {
        this.sftp.IsLoaded = false;
        console.log('ShowReportEdit2', this.sftp.ShowReportEdit);
        
        fetch('https://is.xello.world/api/Integrations/GetSftpForAccount?AccId=' + this.recordId).then((response) => response.json())
            .then((jsonResponse) => {
                this.sftp.SftpInfo = jsonResponse.SftpInfo;
                this.sftp.SftpReports = jsonResponse.SftpReports;  
                if(this.sftp.SftpInfo != null) {
                    this.sftp.HasReports = this.sftp.SftpReports.length > 0; //only make this true after confirmed so alert message does not appear (or flash) on screen
                    this.sftp.SftpInfo.SftpPathOld = this.sftp.SftpInfo.SftpPath;
                    this.sftp.SftpInfo.Port = (this.sftp.SftpInfo.SftpServer == 'ftp.xello.us') ? '5087' : '22';
                    //open sftp://charlevoixemmetinter:c7ttcqj2@ftp.xello.us:5087/ -hostkey=*
                    if(this.sftp.SftpInfo.SftpServer.toLowerCase().indexOf('xello.us') > 1) {
                        this.sftp.SftpInfo.SftpPath = '\\\\10.4.10.4\\SchoolUpload\\' + this.sftp.SftpInfo.UserName + '\\' + this.sftp.SftpInfo.UserName;
                        this.sftp.SftpInfo.Command = 'sftp://' + this.sftp.SftpInfo.UserName + ':' + this.sftp.SftpInfo.Password + '@ftp.xello.us:5087/ -hostkey=*';
                    }
                    if(this.sftp.SftpInfo.SftpServer.toLowerCase().indexOf('xello.co.uk') > 1) {
                        this.sftp.SftpInfo.SftpPath = '\\\\10.1.0.10\\SchoolUpload\\' + this.sftp.SftpInfo.UserName + '\\' + this.sftp.SftpInfo.UserName;
                        this.sftp.SftpInfo.Command = 'sftp://' + this.sftp.SftpInfo.UserName + ':' + this.sftp.SftpInfo.Password + '@ftp.xello.co.uk:22/ -hostkey=*';
                    }
                    if(this.sftp.SftpInfo.SftpServer.toLowerCase().indexOf('xello.ca') > 1) {
                        this.sftp.SftpInfo.SftpPath = '\\\\10.0.0.16\\SchoolUpload\\' + this.sftp.SftpInfo.UserName + '\\' + this.sftp.SftpInfo.UserName;
                        this.sftp.SftpInfo.Command = 'sftp://' + this.sftp.SftpInfo.UserName + ':' + this.sftp.SftpInfo.Password + '@ftp.xello.ca:22/ -hostkey=*';
                    }

                    this.sftp.SftpInfo.OldFtpActiveReportsExist = false;
                    this.sftp.SftpReports.forEach((entry) => {
                        entry.IsXello = (entry.SourceServer == 'CC') ? false : true;
                        if(entry.LastRunDate != null) entry.LastRunDate = new Date(entry.LastRunDate);
                        if(entry.CreatedDate != null) entry.CreatedDate = new Date(entry.CreatedDate);
                        entry.FrequencyText = entry.Frequency;
                        entry.HasSubFolder = (entry.FileSubFolder != '' && entry.FileSubFolder != null) ? true : false;
                        // switch(entry.Frequency) {
                        //     case 'M':
                        //         entry.FrequencyText = 'Monthly'
                        //       break;
                        //     case 'W':
                        //         entry.FrequencyText = 'Weekly'
                        //       break;
                        //     default:
                        //         entry.FrequencyText = 'Nightly'
                        // }
                        if(entry.DurationSeconds == null) entry.DurationSeconds = 0;
                        entry.IsTooLong = (entry.DurationSeconds > 60 && entry.IsActive)  ? true: false;
                        
                        //Check if OLD reports exists that are of concern
                        entry.ReportOnOldFtpButNewSftpActive = false;
                        if(entry.SftpServer == 'ftp.careercruising.com' && this.sftp.SftpInfo.SftpServer.toLowerCase().indexOf('xello') > 1) {
                            if(entry.IsActive) this.sftp.SftpInfo.OldFtpActiveReportsExist = true;
                            entry.ReportOnOldFtpButNewSftpActive = true; //the report is still on the OLD ftp server but the account is using the NEW sftp server
                        }
                    });
                    this.sftp.HasFolder = true;
                    console.log('SftpReports',this.sftp.SftpReports);
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
        this.CurrentReport.FileLocation = this.sftp.SftpInfo.SftpFolder + '\\Extracts\\';
        //this.CurrentReport.SftpServer = this.sftp.SftpServerOption[0].value;
        this.CurrentReport.SftpServer = this.sftp.SftpServerOption.find(obj => obj.value == this.sftp.SftpInfo.SftpServer).value;
        this.CurrentReport.IsActive = 0;
        this.CurrentReport.SchoolId = null;

        //Source server
        this.CurrentReport.SourceServer = 'AzureUS';
        if(this.sftp.SftpInfo.SftpServer == 'ftp.xello.co.uk') this.CurrentReport.SourceServer = 'AzureUK';
        if(this.sftp.SftpInfo.SftpServer == 'ftp.xello.ca') this.CurrentReport.SourceServer = 'AzureCA';
        
        this.CurrentReport.Frequency = 'Monthly-Day1';
        this.sftp.ShowReportEdit = true;
    }
    handleReportEdit(event){
        //Find report based on data.id, use {...object} to make a copy
        this.CurrentReport = {...this.sftp.SftpReports.find( ({ ID }) => ID == event.target.dataset.id)};
        this.sftp.ShowReportEdit = true;
        console.log(this.CurrentReport);
    }
    handleReportCancel(event) {
        this.sftp.ShowReportEdit = false;
    }
    handleReportSave(event) {
        
        //Hitting a wall with CORS using POST so using a larger (silly) GET - argghhhh
        var params = ''
        var params = params + '?ID=' + encodeURIComponent(this.CurrentReport.ID)
        var params = params + '&CrmAccountId=' + this.recordId
        var params = params + '&StoredProcedure=' + encodeURIComponent(this.CurrentReport.StoredProcedure)
        var params = params + '&Frequency=' + encodeURIComponent(this.CurrentReport.Frequency)
        var params = params + '&FileLocation=' + encodeURIComponent(this.CurrentReport.FileLocation)
        var params = params + '&SftpServer=' + encodeURIComponent(this.CurrentReport.SftpServer)
        var params = params + '&SourceServer=' + encodeURIComponent(this.CurrentReport.SourceServer)
        var params = params + '&IsActive=' + encodeURIComponent(this.CurrentReport.IsActive ? 1 : 0)
        var params = params + '&SchoolId=' + encodeURIComponent((this.CurrentReport.SchoolId == '') ? 'null' : this.CurrentReport.SchoolId)

        //onsole.log(params);
        //return;

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
    handleReportReRun(event) {
        
        fetch('https://is.xello.world/api/Integrations/QueryBySprocId?SprocId=959892&string&Numeric1=' + encodeURIComponent(this.CurrentReport.ID)).then((response) => response.json())
            .then((jsonResponse) => {
                this.ResultMessage = jsonResponse.QueryResults[0];
                LightningAlert.open({
                    message: this.ResultMessage.Detail,
                    theme: this.ResultMessage.alertColor, // a red theme intended for error states
                    label: this.ResultMessage.Message, // this is the header text
                });

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
            this.CurrentReport.FileLocation = this.sftp.SftpInfo.SftpFolder + '\\Extracts\\' + SprocNameOnly + '.csv';
        }
    }
    handleChangeSourceServer(event) {
        this.CurrentReport.SourceServer = event.detail.value;
    }  
    handleChangeSftpServer(event) {
        this.CurrentReport.SftpServer = event.detail.value;
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