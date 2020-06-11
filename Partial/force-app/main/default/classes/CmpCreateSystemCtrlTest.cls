/*
** Class:  CmpCreateSystemCtrlTest
** Created by OpFocus (Veena Sundara-Heragu) on 06/08/2017
** Description: Test class for CmpCreateSystemCtr
*/
@isTest
public class CmpCreateSystemCtrlTest {
	

	static testMethod void myTest1() {

		Account parentAccount = TestData.buildAccount('Test Account');
		insert parentAccount;

		Account childAccount = TestData.buildChildAccount('Child Account', parentAccount.Id);
		insert childAccount;

		// build parent system
		System__c parentSystem = TestData.buildSystem(parentAccount.Id);
		insert parentSystem;
		system.assertEquals(parentSystem.Name, null);

		// child has no system yet, so ctrlFetchSystem will get the parent's
		System__c sParent = CmpCreateSystemCtrl.ctrlFetchSystem(childAccount.Id);
		system.assertEquals(parentSystem.Id, sParent.Id);

		System__c childSystem = TestData.buildSystem(childAccount.Id);
		insert childSystem;

		// child has a system , so ctrlFetchSystem will get it
		System__c sChild = CmpCreateSystemCtrl.ctrlFetchSystem(childAccount.Id);
		system.assertEquals(childSystem.Id, sChild.Id);

		CmpCreateSystemCtrl.AccountWrapper a_Type = CmpCreateSystemCtrl.ctrlCheckAccountType(childAccount.Id);
		system.assertEquals(a_Type, a_Type);

		Account newAccount = TestData.buildAccount('New Account');
		insert newAccount;
		System__c newSystem = TestData.buildSystem(newAccount.Id);
		CmpCreateSystemCtrl.ctrlSave(newAccount.Id, JSON.serialize(newSystem));
		System__c s2 = [Select Id, Name from System__c where Account__c = :newAccount.Id];
		system.assertEquals(newAccount.Name, s2.Name);

	}
	
}