/*
** Class: CmpOpportunityLineTableCtrlTest
** Created by OpFocus (Veena Sundara-Heragu) on 7/23/18
** Description: Test class for CmpOpportunityLineTableCtrl
*/
@isTest
public class CmpOpportunityLineTableCtrlTest
{

    static testMethod void myTest1()
    {
        Account a = TestData.buildAccount('Test Account');
        insert a;
        Campaign c = TestData.buildCampaign('Test Campaign');
        insert c;
        Opportunity o = TestData.buildOpportunity(a.Id, 'Test Opp', c.Id);
        insert o;

        // Create some Products
        Product2 p1 = TestData.buildProduct('p1', 'fam1');
        Product2 p2 = TestData.buildProduct('p2', 'fam1');
        insert new List<Product2>{p1, p2};

        // Create standard Pricebook entries for these Products
        Id stPBId = Test.getStandardPricebookId();

        PricebookEntry pbeStd_p1    = new PricebookEntry(Pricebook2Id=stPBId, Product2Id=p1.Id, UnitPrice=100, isActive=true);
        PricebookEntry pbeStd_p2    = new PricebookEntry(Pricebook2Id=stPBId, Product2Id=p2.Id, UnitPrice=100, isActive=true);
        insert new List<PricebookEntry>{pbeStd_p1, pbeStd_p2};

        // now create OLIs for our test Opportunity
        List<OpportunityLineItem> lstOLIs = new List<OpportunityLineItem>();

        lstOLIs.add(TestData.buildOli(o.Id, pbeStd_p1,  1));
        lstOLIs.add(TestData.buildOli(o.Id, pbeStd_p2,  1));
        insert lstOLIs;

        Test.startTest();
        CmpOpportunityLineTableCtrl.LightningTableData retVal = CmpOpportunityLineTableCtrl.ctrlFetchLines(o.Id);
        system.assertEquals(2, retVal.lstOLI.size());

        for(OpportunityLineItem oli : retVal.lstOLI)
        {
            oli.Quantity = 100;
        }

        retVal = CmpOpportunityLineTableCtrl.ctrlSave(o.Id, retVal.lstOLI);
        for(OpportunityLineItem oli : retVal.lstOLI)
        {
            system.assertEquals(100, oli.Quantity);
        }

        retVal = CmpOpportunityLineTableCtrl.ctrlDeleteRecord(o.Id, retVal.lstOLI[0].Id);
        system.assertEquals(1, retVal.lstOLI.size());

        Test.stopTest();

    }

}