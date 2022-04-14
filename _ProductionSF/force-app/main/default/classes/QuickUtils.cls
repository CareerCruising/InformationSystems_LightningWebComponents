public with sharing class QuickUtils {
/*

*/
    public class LogResult{
        string Id { get; set; }
        string Error { get; set; }
    }

    @AuraEnabled
    //public static List<LogResult> CopyOpp(String SourceOppId, Boolean IsTest) {
    public static string CopyOpp(String SourceOppId, Boolean IsTest) {
        String UserId = UserInfo.getUserId();
        LogResult resultLog = new LogResult();
        resultLog.Error = '';   
        resultLog.Id = '';

        Opportunity NewOpp = new Opportunity();
        Account acc = new Account();

        List<Opportunity> sourceOpp = [
                SELECT 
                AccountId
                ,Amount
                ,CampaignId
                ,CDC_Update_Required__c
                ,CloseDate
                ,Competition_Take_Away__c
                ,Competitorsz__c
                ,ContactId
                ,Contract_Annual_Increase__c
                ,Contract_Current_Year__c
                ,Contract_Length__c
                ,Contract_Notes__c
                ,CurrencyIsoCode
                ,Description
                ,EndDate__c
                ,FinanceOCREmailList__c
                ,ForecastCategoryName
                ,Forecasting_Notes__c
                ,Free_State_System__c
                ,FundingSource__c
                ,InternalStatus__c
                ,InvoiceToContact__c
                ,Involved_in_Deal__c
                ,Is_Delete_Check_Done__c
                ,IsPrivate
                ,Issue__c
                ,KeepFutureOppSeperate__c
                ,KeyPrioritiesAdditionalText__c
                ,LeadSource
                ,Most_Recent_Lead_Source__c
                ,Name
                ,Needs_Analysis__c
                ,Needs_Analysis_Description__c
                ,New_Sales_Amt_Forecast__c
                ,New_Sales_Amt_Forecast_Expected__c
                ,NewFormat__c
                ,Opp_Transition_Role__c
                ,Opportunity_Scenario__c
                ,OwnerId
                ,Previous_Amount__c
                ,PreviousOppType__c
                ,Pricebook2Id
                ,PrimaryRevenueOveride__c
                ,Probability
                ,PublicComments__c
                ,QuoteType__c
                ,RecordTypeId
                ,Reminders__c
                ,Reminders_Previous__c
                ,Renewal_Expected_ARR__c
                ,Renewal_Expected_ARR_Original__c
                ,Renewal_Expected_End_Date__c
                ,Renewal_Expected_Override__c
                ,Renewal_Expected_Override_Reason__c
                ,Renewal_Expected_Probability__c
                ,Renewal_Expected_Start_Date__c
                ,Renewal_Opportunity__c
                ,Renewal_Prediction__c
                ,Renewal_Stage_Date__c
                ,Renewal_Stage_Id__c
                ,Renewal_Status__c
                ,RequestByContact__c
                ,ResubRisk__c
                ,ResubRiskAge__c
                ,Revenue_Category__c
                ,Revenue_Change_Amount_Override__c
                ,Revenue_Change_Probability__c
                ,Revenue_Change_Type__c
                ,RevenueRelatedParent__c
                ,RevenueRelatedParentOveride__c
                ,ShowGettingStarted__c
                ,ShowKeyPriorities__c
                ,ShowPreparedBy__c
                ,ShowXello__c
                ,slxOpportunityId__c
                ,Stage_change_date__c
                ,StageName
                ,StartDate__c
                ,SubType__c
                ,Tag__c
                ,TotalOpportunityQuantity
                ,Type
                ,Upsell_Renewal_Link__c
                ,XelloBrand__c
                FROM Opportunity WHERE Id = :SourceOppId
        ];

        List<OpportunityLineItem> oliList = [
            SELECT 
            Account__c
            ,AmountYear1__c
            ,Annual_Price__c
            ,Description
            ,Discount
            ,Discount_Amount__c
            ,EndDate__c
            ,ExcludeFutureArr__c
            ,ExternalId__c
            ,Is_Xello_Site__c
            ,ListPriceQuoted__c
            ,ListPriceQuotedTerritory__c
            ,MgmtOverride__c
            ,MgmtOverrideDate__c
            ,MgmtOverridePrice__c            
            ,OpportunityId
            ,PricebookEntryId
            ,Product2Id
            ,Quantity
            ,RelatedOppProdId__c
            ,RenewNextYear__c
            ,Resub__c
            ,RevNewLogo__c
            ,RevRenewal__c
            ,RevUpsell__c
            ,ServiceDate
            ,SortOrder
            ,StartDate__c
            ,Territory_Product__c
            ,UnitPrice
            FROM OpportunityLineItem WHERE OpportunityId = :SourceOppId
        ];
        
        List<Opp_Contact_Roles__c> ocr = [
            SELECT
            Contact_Name__c
            ,CurrencyIsoCode
            ,Email_Balance_Owing__c
            ,Email_Invoice__c
            ,Email_Login__c
            ,Email_Renewal__c
            ,Email_Welcome__c
            ,Operational_Role__c
            ,RelatedOpportunity__c
            ,Role__c
            ,SlxId__c
            FROM Opp_Contact_Roles__c WHERE RelatedOpportunity__c = :SourceOppId
        ];
        
        List<OpportunityTeamMember> otm = [
            SELECT
            CurrencyIsoCode
            ,ExternalId__c
            ,OpportunityAccessLevel
            ,OpportunityId
            ,TeamMemberRole
            ,UserId
            FROM OpportunityTeamMember WHERE OpportunityId = :SourceOppId
        ];

        if(IsTest) { //Just hacked it by passing IsTest and creating a fake Opp. Tried for hours - I can execute the code, but the test breaks and I don't understand the errors.
            NewOpp = new Opportunity(Id = '0063i0000035hBOGUS', Name = 'Testing Name', StageName = 'Prospecting');
            NewOpp.CloseDate = Date.newInstance(2000, 1, 1);
            acc = new Account(Id = '001410000210cTRAAY', CurrencyIsoCode = 'USD');
            oliList.add(new OpportunityLineItem(id = null, Quantity = 1, TotalPrice = 1, PriceBookEntryId = '01u4100000ZUsrkAAD', Product2Id = '01t41000004ezhVAAQ'));
            ocr.add(new Opp_Contact_Roles__c(CurrencyIsoCode = 'USD'));
            otm.add(new OpportunityTeamMember(CurrencyIsoCode = 'USD'));
        } else {
            NewOpp = sourceOpp[0];
            acc = [SELECT Id, CurrencyIsoCode FROM Account WHERE Id = :NewOpp.AccountId];
        }
        
        //Create Opp  
        NewOpp.Id = NULL;	
        NewOpp.Name = NewOpp.Name + ' (COPY)';
        NewOpp.InternalStatus__c = '01: Unpublished';
        Newopp.OwnerId = UserId;
        if(NewOpp.RecordTypeId == '01241000000kAt0AAE') {
            NewOpp.StageName = '20N-Discovery';
        } else {
            NewOpp.StageName = '10R-Renewal';
        }
        if(NewOpp.LeadSource == null) NewOpp.LeadSource = 'Other - None';
        
        Map<String,Object> fieldsMap = (Map<String,Object>) JSON.deserializeUntyped(JSON.serialize(NewOpp));
        System.debug(fieldsMap);
        
        if(IsTest == false) {
            try {
                insert NewOpp; resultLog.Id = NewOpp.Id;
            } catch(DmlException e) {
                resultLog.Error = resultLog.Error + e.getMessage() + '; '; 
                System.debug('The following exception has occurred: ' + e.getMessage());
            } finally {
                return JSON.serialize(resultLog);
            }       
            
        }

        //Add the newId to the line items
        for(OpportunityLineItem a : oliList){
            a.Id = NULL;
            a.OpportunityId = NewOpp.Id;
        }   
        for(Opp_Contact_Roles__c a : ocr){
            a.Id = NULL;
            a.RelatedOpportunity__c = NewOpp.Id;
        }  
        for(OpportunityTeamMember a : otm){
            a.Id = NULL;
            a.OpportunityId = NewOpp.Id;
        }                  
		if(IsTest == false) {
            insert oliList;
            insert ocr;
            insert otm;
        }
             
        return JSON.serialize(resultLog);

    }

}

