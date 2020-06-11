/*
** Class:  CmpAccountSummaryCtrlTest
** Created by OpFocus (Veena Sundara-Heragu) on 06/27/2017
** Description: Test class for CmpAccountSummaryCtrl
*/
@isTest
public class CmpAccountSummaryCtrlTest {
	
	static testMethod void myTest1() {

		//np Expiry date and no other ids - colors will all be white
		Account a1 = TestData.buildAccount('Test Account1');
		//no Expiry date and YES all other ids - colors will all be white
		Account a2 = TestData.buildAccount('Test Account2');
		a2.SchoolId__c = 11.11;
		a2.RegionId__c = '11.11';
		a2.InstitutionId__c = 11.11;
		//Expiry date < today and YES all other ids - colors will all be gray
		Account a3 = TestData.buildAccount('Test Account3');
		a3.SchoolId__c = 22.22;
		a3.RegionId__c = '22.22';
		a3.InstitutionId__c = 22.22;
		a3.ExpiryDate__c = system.today().addDays(-2);
		//Expiry date > today and YES all other ids - colors will all be green
		Account a4 = TestData.buildAccount('Test Account4');
		a4.SchoolId__c = 33.33;
		a4.RegionId__c = '33.33';
		a4.InstitutionId__c = 33.33;
		a4.ExpiryDate__c = system.today().addDays(2);
		List<Account> lstAccount = new List<Account>{a1, a2, a3, a4};
		insert lstAccount;

		// to test parent with system
		a2.ParentId = a1.Id;
		update a2;

		Campaign c = TestData.buildCampaign('Test Campaign');
		insert c;

		List<Opportunity> lstOpp = new List<Opportunity>();
		for(Account a : lstAccount)
		{
			lstOpp.add(TestData.buildOpportunity(a.Id, 'Test Opp', c.Id));
		}
		insert lstOpp;

		System__c s1 = TestData.buildSystem(a1.Id);
		insert s1;

		Test.startTest();

		CmpAccountSummaryCtrl.ctrlFetchAccount(lstOpp[0].Id, '');
		CmpAccountSummaryCtrl.ctrlFetchAccount('0064200000Cx8dUAAR', ''); //Fake ID

		//np Expiry date and no other ids - colors will all be white
		CmpAccountSummaryCtrl.AccountWrapper aw = CmpAccountSummaryCtrl.ctrlFetchAccount(lstOpp[0].Id, 'AccountId');
		system.assertEquals(a1.Id, aw.a.Id);
		system.assertEquals(s1.Id, aw.s.Id);
		system.assertEquals('white', aw.sColor);
		system.assertEquals('white', aw.rColor);
		system.assertEquals('white', aw.xColor);

		//no Expiry date and YES all other ids - colors will all be white
		aw = CmpAccountSummaryCtrl.ctrlFetchAccount(lstOpp[1].Id, 'AccountId');
		system.assertEquals(a2.Id, aw.a.Id);
		system.assertEquals(s1.Id, aw.s.Id);
		system.assertEquals('white', aw.sColor);
		system.assertEquals('white', aw.rColor);
		system.assertEquals('white', aw.xColor);

		//Expiry date < today and YES all other ids - colors will all be gray
		aw = CmpAccountSummaryCtrl.ctrlFetchAccount(lstOpp[2].Id, 'AccountId');
		system.assertEquals(a3.Id, aw.a.Id);
		system.assertEquals('gray', aw.sColor);
		system.assertEquals('gray', aw.rColor);
		system.assertEquals('gray', aw.xColor);

		//Expiry date > today and YES all other ids - colors will all be green
		aw = CmpAccountSummaryCtrl.ctrlFetchAccount(lstOpp[3].Id, 'AccountId');
		system.assertEquals(a4.Id, aw.a.Id);
		system.assertEquals('green', aw.sColor);
		system.assertEquals('green', aw.rColor);
		system.assertEquals('green', aw.xColor);

		Test.stopTest();
	}
	
}