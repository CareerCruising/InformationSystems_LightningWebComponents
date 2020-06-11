/* Class:       OpportunityTriggerTest
 * Created On:  
 * Created by:  J. Pipkin (OpFocus, Inc)
 * Description: 
 */

@isTest(IsParallel=false)
public class OpportunityTriggerTest {
	
	@testSetup static void buildData(){
		MirrorTriggerSettings__c setting = MirrorTriggerSettings__c.getOrgDefaults();
		setting.Email_on_Delete__c = 'test@noemail.com,blah@noemail.com';
		setting.Backlog_SWitch__c = true;
		upsert setting;
		Account a = TestData.buildAccount('Test Account');
		insert a;
	}

	//test methods

	static testMethod void insertOpp() {
		
		Account a = [Select Id, Name from Account];
		Campaign c = TestData.buildCampaign('Test Campaign');
		insert c;

		Opportunity o = TestData.buildOpportunity(a.Id, a.Name, c.Id);

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		insert o;
		Test.stopTest(); // so that future method runs

		Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c];
		System.assertEquals(0,mab.size());
	}
	static testMethod void insertMultiOpp() {
		
		Account a = [Select Id, Name from Account];
		Campaign c = TestData.buildCampaign('Test Campaign');
		insert c;

		Opportunity o1 = TestData.buildOpportunity(a.Id, a.Name + ' 1', c.Id);
		Opportunity o2 = TestData.buildOpportunity(a.Id, a.Name + ' 2', c.Id);

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		insert new Opportunity[]{o1,o2};
		Test.stopTest(); // so that future method runs

		Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c];
		System.assertEquals(2,mab.size());
		System.assertEquals('Opportunity',mab[0].Object_Name__c);
		System.assertNotEquals(null,mab[0].Record_Id__c);
		System.assertNotEquals(null,mab[1].Record_Id__c);
	}
	
	static testMethod void updateOpp() {
		
		Account a = [Select Id, Name from Account];
		Account a1 = TestData.buildAccount('Test Account 1');
		insert a1;
		Campaign c = TestData.buildCampaign('Test Campaign');
		insert c;

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		Opportunity o = TestData.buildOpportunity(a.Id, a.Name, c.Id);
		insert o;

		o.StageName = [Select ApiName from OpportunityStage where ApiName != :o.StageName and IsClosed = false LIMIT 1].ApiName;
		o.Description = 'test';
		o.Needs_Analysis_Description__c = 'test';
		o.AccountId = a1.Id;
		update o;
		Test.stopTest(); // so that future method runs

		Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c];
		System.assertEquals(0,mab.size());
	}

	static testMethod void updateOppOwner() {
		
		Account a = [Select Id, Name from Account];
		Account a1 = TestData.buildAccount('Test Account 1');
		insert a1;
		Campaign c = TestData.buildCampaign('Test Campaign');
		insert c;

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		Opportunity o = TestData.buildOpportunity(a.Id, a.Name, c.Id);
		List<User> lstSuccessUsers = [Select Profile.Name From User Where Profile.Name = 'Success' and IsActive = true];
		o.OwnerId = lstSuccessUsers[0].id;
		insert o;

		o.OwnerId = lstSuccessUsers[1].id;
		update o;

		List<User> lstSalesUsers = [Select Profile.Name From User Where Profile.Name = 'Sales' and IsActive = true];
		o.OwnerId = lstSalesUsers[0].id;
		update o;

		Test.stopTest(); // so that future method runs

		System.assertEquals(o.OwnerId,lstSalesUsers[0].id);
	}

	static testMethod void updateMultiOpp() {
		MirrorTriggerSettings__c setting = MirrorTriggerSettings__c.getOrgDefaults();
		setting.Backlog_SWitch__c = false;
		update setting;
		
		Account a = [Select Id, Name,SIS_Vendor__c from Account];
		Account a1 = TestData.buildAccount('Test Account 1');
		insert a1;
		Campaign c = TestData.buildCampaign('Test Campaign');
		insert c;

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		Opportunity o1 = TestData.buildOpportunity(a.Id, a.Name + ' 1', c.Id);
		Opportunity o2 = TestData.buildOpportunity(a.Id, a.Name + ' 2', c.Id);
		insert new Opportunity[]{o1,o2};
		o1.StageName = [Select ApiName from OpportunityStage where ApiName != :o1.StageName and IsClosed = false LIMIT 1].ApiName;
		o2.StageName = [Select ApiName from OpportunityStage where ApiName != :o2.StageName and IsClosed = false LIMIT 1].ApiName;
		o1.Description = 'test';
		o2.Description = 'test';
		o1.Needs_Analysis_Description__c = 'test';
		o2.Needs_Analysis_Description__c = 'test';
		o1.AccountId = a1.Id;
		o2.AccountId = a1.Id;
		update new Opportunity[]{o1,o2};

		Test.stopTest(); // so that future method runs
		
		Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c];
		System.assertEquals(0,mab.size());
	}

	static testMethod void deleteOpp() {
		
		Account a = [Select Id, Name from Account];
		Campaign c = TestData.buildCampaign('Test Campaign');
		insert c;

		Opportunity o1 = TestData.buildOpportunity(a.Id, a.Name + ' 1', c.Id);
		Opportunity o2 = TestData.buildOpportunity(a.Id, a.Name + ' 2', c.Id);
		insert new Opportunity[]{o1,o2};

		Database.DeleteResult results = null;
		Test.startTest();
			try {
				results = Database.delete(o1);
				System.assert(false);
			}
			catch (Exception exc) {
				System.assert(exc.getMessage().contains('Integrations/OpportunityDeleteCheck'), 'Failed to return expected error.');
			}
			// now try for success case
			o1.Is_Delete_Check_Done__c = true;
			update o1;

			results = Database.delete(o1);
		Test.stopTest(); 
		System.assert(results.isSuccess(), 'Failed to successfully delete opp when check performed.');
	}

	static testMethod void deleteMultiOpp() {
		
		Account a = [Select Id, Name from Account];
		List<Account> lstAcc = new List<Account>{a};
		lstAcc.add(TestData.buildAccount('Test Account 1'));
		lstAcc.add(TestData.buildAccount('Test Account 2'));
		Campaign c = TestData.buildCampaign('Test Campaign');
		insert c;
		Opportunity o1 = TestData.buildOpportunity(a.Id, a.Name + ' 1', c.Id);
		Opportunity o2 = TestData.buildOpportunity(a.Id, a.Name + ' 2', c.Id);
		insert new Opportunity[]{o1,o2};

		List<Database.DeleteResult> results = null;
		Test.startTest();
			results = Database.delete(new Opportunity[]{o1,o2});
		Test.stopTest();

		Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c where Action__c='Delete'];
		System.assertEquals(2, mab.size(), 'Failed to create Mirror API Backlog for multiple opps.');

	}	
}