/* Class:       CmpNeedsAnalysisCtrlTest
 * Created On:  
 * Created by:  J. Pipkin (OpFocus, Inc)
 * Description: 
 */

@isTest
public class CmpNeedsAnalysisCtrlTest {
	
	@testSetup static void buildData(){
		Account a = TestData.buildAccount('Test Account');
		insert a;

		Needs_Analysis__c na = TestData.buildNeedsAnalysis(a.Id);
		na.Mandate_Compliance__c = true;
		na.Student_Engagement__c = true;
		na.Future_Readiness__c = true;
		insert na;
	}

	//test methods

	static testMethod void myTest1() {
		Account a = [Select Id from Account];
		Needs_Analysis__c na = [Select Id from Needs_Analysis__c];
		CmpNeedsAnalysisCtrl.Input i = new CmpNeedsAnalysisCtrl.Input();
		i.deviceInfoStr = '{}';
		i.recordId = a.Id;
		i.lookupField = 'Primary_Needs_Analysis__c';

		CmpNeedsAnalysisCtrl.Output out = CmpNeedsAnalysisCtrl.getData(JSON.serialize(i));
		System.assertEquals(na.Id, out.naId);
		System.assertEquals(3, out.checklist.size());
	}
	
}