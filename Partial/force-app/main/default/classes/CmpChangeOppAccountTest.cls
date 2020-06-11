/**
 * Created by Rick on 3/17/2018.
 */

@IsTest
private class CmpChangeOppAccountTest {

    static testMethod void myTest1() {

        Account acct = TestData.buildAccount('Test Account');
        insert acct;
        Campaign campaign = TestData.buildCampaign('Test Campaign');
        insert campaign;
        Opportunity opp = TestData.buildOpportunity(acct.Id, acct.Name, campaign.Id);
        insert opp;

        Account ac = CmpChangeOppAccountCtrl.ctrlFetchAccountFromAccountId(acct.id);

        system.assertEquals(acct.Id, ac.Id);
    }

    static testMethod void myTest2() {

        Account acct = TestData.buildAccount('Test Account');
        insert acct;
        Campaign campaign = TestData.buildCampaign('Test Campaign');
        insert campaign;
        Opportunity opp = TestData.buildOpportunity(acct.Id, acct.Name, campaign.Id);
        insert opp;

        Account ac = CmpChangeOppAccountCtrl.ctrlFetchAccountFromOpp(opp.id);

        system.assertEquals(acct.Id, opp.AccountId);
    }

    static testMethod void myTest3() {

        Account a = TestData.buildAccount('AcctName');
        insert a;
        Account a2 = TestData.buildAccount('AcctName2');
        insert a2;
        Campaign c = TestData.buildCampaign('Test Campaign');
        insert c;


        Opportunity o = TestData.buildOpportunity(a.Id, a.Name + ' 1', c.Id);
        insert o;

        // set mock callout class for http callouts
        Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

        Test.startTest();

        CmpChangeOppAccountCtrl.calloutResult cr = CmpChangeOppAccountCtrl.ctrlSave(o.id, a2.Id);

        Test.stopTest(); // so that future method runs

        System.assertEquals(true, cr.result);
    }

}