/* Class:       AssetTriggerHandlerTest
 * Created On:  
 * Created by:  J. Pipkin (OpFocus, Inc)
 * Description: 
 */

@isTest(IsParallel=false)
public class AssetTriggerHandlerTest {
	
	@testSetup static void buildData(){
		MirrorTriggerSettings__c setting = MirrorTriggerSettings__c.getOrgDefaults();
		setting.Email_on_Delete__c = 'test@noemail.com,blah@noemail.com';
		setting.Backlog_Switch__c = true;
		upsert setting;
		Account a = TestData.buildAccount('Test Account');
		a.SIS_Vendor__c = 'Maple';
		insert a;

		Product2 prod = TestData.buildProduct('The Real Game', 'Feature');
		insert prod;
	}

	//test methods

	static testMethod void insertAsset() {
		
		Account a = [Select Id, Name from Account];

		Asset ast = TestData.buildAsset(a.Id);
		Product2 prod = [select Id, Name from Product2 limit 1];
		// added by bfinn 12/18/2017 : need Product reference for Process that sets Asset Name
		ast.Product2Id = prod.Id;

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		insert ast;
		Test.stopTest(); // so that future method runs

		Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c];
		System.assertEquals(0,mab.size());
	}
	static testMethod void insertMultiAsset() {
		
		Account a = [Select Id, Name from Account];

		Asset ast1 = TestData.buildAsset(a.Id);
		Asset ast2 = TestData.buildAsset(a.Id);
		Product2 prod = [select Id, Name from Product2 limit 1];
		// added by bfinn 12/18/2017 : need Product reference for Process that sets Asset Name
		ast1.Product2Id = prod.Id;
		ast2.Product2Id = prod.Id;

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		insert new Asset[]{ast1,ast2};
		Test.stopTest(); // so that future method runs

			
		for(Mirror_API_Backlog__c mab : [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c])
		{
			System.assertEquals('Insert', mab.Action__c);
			System.assertEquals('Asset', mab.Object_Name__c);
			System.assert(ast1.Id == mab.Record_Id__c || ast2.Id == mab.Record_Id__c);
		}
	}
	
	static testMethod void updateAsset() {
		
		Account a = [Select Id, Name from Account];
		List<Account> lstAcc = new List<Account>{a};
		lstAcc.add(TestData.buildAccount('Test Account 1'));
		lstAcc.add(TestData.buildAccount('Test Account 2'));
		
		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		Asset ast = TestData.buildAsset(a.Id);
		Product2 prod = [select Id, Name from Product2 limit 1];
		// added by bfinn 12/18/2017 : need Product reference for Process that sets Asset Name
		ast.Product2Id = prod.Id;

		insert ast;
		// undo processedIds
		AssetTriggerHandler.processedIds.remove(ast.Id);

		ast.Name = 'Another Name';
		update ast;
		Test.stopTest(); // so that future method runs

		Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c];
		System.assertEquals(0,mab.size());
	}

	static testMethod void updateMultiAsset() {
		MirrorTriggerSettings__c setting = MirrorTriggerSettings__c.getOrgDefaults();
		setting.Backlog_SWitch__c = false;
		update setting;
		
		Account a = [Select Id, Name,SIS_Vendor__c from Account];
		List<Account> lstAcc = new List<Account>{a};
		lstAcc.add(TestData.buildAccount('Test Account 1'));
		lstAcc.add(TestData.buildAccount('Test Account 2'));
		
		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		Asset ast1 = TestData.buildAsset(a.Id);
		Asset ast2 = TestData.buildAsset(a.Id);
		Product2 prod = [select Id, Name from Product2 limit 1];
		// added by bfinn 12/18/2017 : need Product reference for Process that sets Asset Name
		ast1.Product2Id = prod.Id;
		ast2.Product2Id = prod.Id;

		insert new Asset[]{ast1,ast2};
		
		// undo processedIds
		AssetTriggerHandler.processedIds.remove(ast1.Id);
		AssetTriggerHandler.processedIds.remove(ast2.Id);
		
		ast1.Name = 'Test Another Name';
		ast2.Name = 'Another Name';
		update new Asset[]{ast1,ast2};

		Test.stopTest(); // so that future method runs

		Mirror_API_Backlog__c[] mabs_ins = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c where Action__c = 'Insert'];
		Mirror_API_Backlog__c[] mabs_upd = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c where Action__c = 'Update'];
		System.assertEquals(0, mabs_ins.size());
		System.assertEquals(0, mabs_upd.size());
	}

	static testMethod void deleteAsset() {
		
		Account a = [Select Id, Name from Account];
		List<Account> lstAcc = new List<Account>{a};
		lstAcc.add(TestData.buildAccount('Test Account 1'));
		lstAcc.add(TestData.buildAccount('Test Account 2'));

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		Asset ast = TestData.buildAsset(a.Id);
		Product2 prod = [select Id, Name from Product2 limit 1];
		// added by bfinn 12/18/2017 : need Product reference for Process that sets Asset Name
		ast.Product2Id = prod.Id;

		insert ast;

		// undo processedIds
		AssetTriggerHandler.processedIds.remove(ast.Id);
		delete ast;
		Test.stopTest(); // so that future method runs
		Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c];
		System.assertEquals(0,mab.size());
	}

	static testMethod void deleteMultiAsset() {
		
		Account a = [Select Id, Name from Account];
		List<Account> lstAcc = new List<Account>{a};
		lstAcc.add(TestData.buildAccount('Test Account 1'));
		lstAcc.add(TestData.buildAccount('Test Account 2'));

		// set mock callout class for http callouts
		Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

		Test.startTest();
		Asset ast1 = TestData.buildAsset(a.Id);
		Asset ast2 = TestData.buildAsset(a.Id);
		Product2 prod = [select Id, Name from Product2 limit 1];
		// added by bfinn 12/18/2017 : need Product reference for Process that sets Asset Name
		ast1.Product2Id = prod.Id;
		ast2.Product2Id = prod.Id;

		insert new Asset[]{ast1,ast2};

		// undo processedIds
		AssetTriggerHandler.processedIds.remove(ast1.Id);
		AssetTriggerHandler.processedIds.remove(ast2.Id);

		delete new Asset[]{ast1,ast2};
		Test.stopTest(); // so that future method runs
		Mirror_API_Backlog__c[] mabs_ins = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c where Action__c = 'Insert'];
		Mirror_API_Backlog__c[] mabs_del = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c where Action__c = 'Delete'];
		System.assertEquals(2, mabs_ins.size());
		System.assertEquals(2, mabs_del.size());
	}
	
}