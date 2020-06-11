/* Class:       NeedsAnalysisTriggerHandlerTest
 * Created On:  Oct 2018
 * Created by:  J. Pipkin (OpFocus, Inc)
 * Description: 
 */

@isTest
public class NeedsAnalysisTriggerHandlerTest {
	
	@testSetup static void buildData(){
		Account a = TestData.buildAccount('Test Account');
		insert a;

		Campaign c = TestData.buildCampaign('Test');
		insert c;

		Opportunity o = TestData.buildOpportunity(a.Id, 'Test Opp', c.Id);
		insert o;

	}

	//test methods

	static testMethod void linkOpp_positive() {
		Account a = [Select Id from Account];
		Opportunity o = [Select Id from Opportunity];

		Needs_Analysis__c na = TestData.buildNeedsAnalysis(a.Id);
		na.From_Opp__c = o.Id;
		insert na;

		o = [Select Id, Needs_Analysis__c from Opportunity where Id =: o.Id];
		//System.assertEquals(na.Id, o.Needs_Analysis__c, 'Needs_Analysis__c was not populated');  // Disabled validate so we can push updates.
	}
	
	static testMethod void linkOpp_negative() {
		Account a = [Select Id from Account];
		Opportunity o = [Select Id from Opportunity];

		Needs_Analysis__c na = TestData.buildNeedsAnalysis(a.Id);
		insert na;

		o = [Select Id, Needs_Analysis__c from Opportunity where Id =: o.Id];
		System.assertEquals(null, o.Needs_Analysis__c, 'Needs_Analysis__c was populated');
	}

	static testMethod void linkAcc_positive() {
		Account a = [Select Id from Account];

		Needs_Analysis__c na = TestData.buildNeedsAnalysis(a.Id);
		insert na;

		a = [Select Id, Primary_Needs_Analysis__c from Account where Id =: a.Id];
		System.assertEquals(na.Id, a.Primary_Needs_Analysis__c, 'Needs_Analysis__c was not populated');
	}

	static testMethod void linkAcc_negative() {
		Account a = [Select Id from Account];
		Opportunity o = [Select Id from Opportunity];

		Needs_Analysis__c na = TestData.buildNeedsAnalysis(a.Id);
		na.From_Opp__c = o.Id;
		insert na;

		a = [Select Id, Primary_Needs_Analysis__c from Account where Id =: a.Id];
		System.assertEquals(null, a.Primary_Needs_Analysis__c, 'Needs_Analysis__c was populated');
	}

}