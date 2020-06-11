/* Class:       DelOpportunityCtrlTest
 * Created On:  12/12/2017
 * Created by:  OpFocus Team
 * Description: Unit test for DelOpportunityCtrl apex class
 */

@isTest
public class DelOpportunityCtrlTest {
	
	@testSetup static void buildData(){
		Account acct = TestData.buildAccount('Test Account');
		insert acct;		
		Campaign campaign = TestData.buildCampaign('Test Campaign');
		insert campaign;
		Opportunity opp = TestData.buildOpportunity(acct.Id, acct.Name, campaign.Id);
		insert opp;
	}

	//test methods

	static testMethod void testSuccess() {
		Opportunity opp = [select Id from Opportunity limit 1];

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());
		DelOpportunityCtrl ctrl = new DelOpportunityCtrl(new ApexPages.StandardController(opp));
		Test.setCurrentPage(Page.DelOpportunity);
		PageReference returnUrl = null;
		Test.startTest();
			returnUrl = ctrl.init();
		Test.stopTest();
		System.assertEquals('/006/o', returnUrl.getUrl(), 'Failed to return list view URL on success.');
	}
	
	static testMethod void testRenewalOppExists() {
		Opportunity opp = [select Id from Opportunity limit 1];
		Account acct = [select Id, Name from Account limit 1];
		Campaign campaign = [select Id from Campaign limit 1];
		Opportunity renewalOpp = TestData.buildOpportunity(acct.Id, acct.Name, campaign.Id);
		renewalOpp.Renewal_Opportunity__c = opp.Id;
		insert renewalOpp;

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());
		DelOpportunityCtrl ctrl = new DelOpportunityCtrl(new ApexPages.StandardController(opp));
		Test.setCurrentPage(Page.DelOpportunity);
		PageReference returnUrl = null;
		Test.startTest();
			returnUrl = ctrl.init();
		Test.stopTest();
	}

	static testMethod void testCalloutFailure() {
		Opportunity opp = [select Id from Opportunity limit 1];
		Account acct = [select Id, Name from Account limit 1];
		Campaign campaign = [select Id from Campaign limit 1];
		Opportunity renewalOpp = TestData.buildOpportunity(acct.Id, acct.Name, campaign.Id);
		renewalOpp.Renewal_Opportunity__c = opp.Id;
		insert renewalOpp;

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock(true));
		DelOpportunityCtrl ctrl = new DelOpportunityCtrl(new ApexPages.StandardController(renewalOpp));
		Test.setCurrentPage(Page.DelOpportunity);
		PageReference returnUrl = null;
		Test.startTest();
			returnUrl = ctrl.init();
		Test.stopTest();	
	}
}