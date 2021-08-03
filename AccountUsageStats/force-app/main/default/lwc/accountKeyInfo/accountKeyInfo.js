import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class AccountKeyInfo extends NavigationMixin(LightningElement) {
    @api recordId;
    @track record;
    @wire(getRecord, { recordId: '$recordId', fields: [
        'Account.GradeSummaryAdoption__c'
        ,'Account.GradePercentStudentsLoginYTD__c'
        ,'Account.GradeLoginsPerStudentYTD__c'
        ,'Account.GradeLessonsPerStudentYTD__c'
        ,'Account.GradePercentLessonCompYTD__c'
        ,'Account.MetricPercentStudentsLoginYTD__c'
        ,'Account.MetricLoginsPerStudentYTD__c'
        ,'Account.MetricLessonsPerStudentYTD__c'
        ,'Account.MetricPercentLessonCompYTD__c'

        ,'Account.GradeSummaryRelationship__c'
        ,'Account.GradeStrengthOfRelationship__c'
        ,'Account.GradePointsOfConnections__c'
        ,'Account.GradeLastContact__c'

        ,'Account.Type'
        
    ] })
    account;  


    get WeirdButWorks() {  //Forces call from HTML

        this.OverallAdoptionGrade = getFieldValue(this.account.data, 'Account.GradeSummaryAdoption__c')
        this.OverallAdoptionClass = 'metric Grade' + this.OverallAdoptionGrade;

        this.StudentLoginsGrade = getFieldValue(this.account.data, 'Account.GradePercentStudentsLoginYTD__c')
        this.StudentLoginsMetric = getFieldValue(this.account.data, 'Account.MetricPercentStudentsLoginYTD__c')
        this.StudentLoginsClass = 'metric Grade' + this.StudentLoginsGrade;
        this.StudentLoginsTitle = 'Percent of Students who have accessed Xello (' + this.StudentLoginsMetric + '%)';
    
        this.LoginsPerStudentGrade = getFieldValue(this.account.data, 'Account.GradeLoginsPerStudentYTD__c')
        this.LoginsPerStudentMetric = getFieldValue(this.account.data, 'Account.MetricLoginsPerStudentYTD__c')
        this.LoginsPerStudentClass = 'metric Grade' + this.LoginsPerStudentGrade;
        this.LoginsPerStudentTitle = 'Logins / Student for students who have accessed Xello (' + this.LoginsPerStudentMetric + ')';
    
        this.LessonsPerStudentGrade = getFieldValue(this.account.data, 'Account.GradeLessonsPerStudentYTD__c')
        this.LessonsPerStudentMetric = getFieldValue(this.account.data, 'Account.MetricLessonsPerStudentYTD__c')
        this.LessonsPerStudentClass = 'metric Grade' + this.LessonsPerStudentGrade;
        this.LessonsPerStudentTitle = 'Lessons / Student for students who have accessed Xello (' + this.LessonsPerStudentMetric + ')';
    
        this.LessonsCompleteGrade = getFieldValue(this.account.data, 'Account.GradePercentLessonCompYTD__c')
        this.LessonsCompleteMetric = getFieldValue(this.account.data, 'Account.MetricPercentLessonCompYTD__c')
        this.LessonsCompleteClass = 'metric Grade' + this.LessonsCompleteGrade;
        this.LessonsCompleteTitle = 'Percent of students who have completed all core lessons (' + this.LessonsCompleteMetric + '%)';
        
        this.OverallRelationshipGrade = getFieldValue(this.account.data, 'Account.GradeSummaryRelationship__c')
        if(this.OverallRelationshipGrade == null) this.OverallRelationshipGrade = 'X';
        this.OverallRelationshipClass = 'Grade' + this.OverallRelationshipGrade;

        this.StrengthOfRelationshipGrade = getFieldValue(this.account.data, 'Account.GradeStrengthOfRelationship__c')
        if(this.StrengthOfRelationshipGrade == null) this.StrengthOfRelationshipGrade = 'X';
        this.StrengthOfRelationshipClass = 'metric Grade' + this.StrengthOfRelationshipGrade;

        this.PointsOfConnectionsGrade = getFieldValue(this.account.data, 'Account.GradePointsOfConnections__c')
        if(this.PointsOfConnectionsGrade == null) this.PointsOfConnectionsGrade = 'X';
        this.PointsOfConnectionsClass = 'metric Grade' + this.PointsOfConnectionsGrade;
        
        this.LastContactGrade = getFieldValue(this.account.data, 'Account.GradeLastContact__c')
        if(this.LastContactGrade == null) this.LastContactGrade = 'X';
        this.LastContactClass = 'metric Grade' + this.LastContactGrade;

        if(this.StudentLoginsGrade != null){
            return true;
        } else {
            return false;
        }
            
    }

    get ShowRelationshipMetrics() {  //Forces call from HTML
        
        this.OverallRelationshipGrade = getFieldValue(this.account.data, 'Account.GradeSummaryRelationship__c')
        if(this.OverallRelationshipGrade == null) this.OverallRelationshipGrade = 'X';
        this.OverallRelationshipClass = 'Grade' + this.OverallRelationshipGrade;

        this.StrengthOfRelationshipGrade = getFieldValue(this.account.data, 'Account.GradeStrengthOfRelationship__c')
        if(this.StrengthOfRelationshipGrade == null) this.StrengthOfRelationshipGrade = 'X';
        this.StrengthOfRelationshipClass = 'metric Grade' + this.StrengthOfRelationshipGrade;

        this.PointsOfConnectionsGrade = getFieldValue(this.account.data, 'Account.GradePointsOfConnections__c')
        if(this.PointsOfConnectionsGrade == null) this.PointsOfConnectionsGrade = 'X';
        this.PointsOfConnectionsClass = 'metric Grade' + this.PointsOfConnectionsGrade;
        
        this.LastContactGrade = getFieldValue(this.account.data, 'Account.GradeLastContact__c')
        if(this.LastContactGrade == null) this.LastContactGrade = 'X';
        this.LastContactClass = 'metric Grade' + this.LastContactGrade;

        this.AccountType = getFieldValue(this.account.data, 'Account.Type')
        if('Regional or Government Office, School District Office'.indexOf(this.AccountType) >= 0){ //Is AccountType in the defined list?
            return true;
        } else {
            return false;
        }
            
    }

    navigateSample(event) {
        console.log('event.detail',event.detail);
        console.log(event.detail.value);
        console.log(event.target);
    }   

    navigateToKB_AdoptionMetrics() {
        //https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_page_reference_type
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/articles/Knowledge/Adoption-Metrics-and-Grading'
            }
        });
    }    

    navigateToKB_RelationshipMetrics() {
        //https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_page_reference_type
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/articles/Knowledge/Relationship-Metrics'
            }
        });
    }        
}

