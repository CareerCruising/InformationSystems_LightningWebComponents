/*
** Class: CmpContactTableCtrlTest
** Created by OpFocus (Veena Sundara-Heragu) on 7/28/18
** Description: Test class for CmpContactTableCtrl
*/
@isTest
public class CmpContactTableCtrlTest
{
    static testMethod void myTest1()
    {
        Account a = TestData.buildAccount('Test Account');
        insert a;

        List<Contact>lstContact = new List<Contact>();
        for(Integer i = 0; i < 5; i++)
        {
            Contact c = TestData.buildContact(a.Id, 'Test', 'Contact' + i);
            c.Email = 'test' + i + '@yahoo.com';
            c.MailingStateCode = 'MA';
            lstContact.add(c);
        }
        insert lstContact;

        // get contacts
        CmpContactTableCtrl.LightningTableData data = CmpContactTableCtrl.ctrlFetchContacts(a.Id);

        // update contact names
        for(Contact c : data.lstContact)
        {
            c.FirstName = 'Testy';
        }
        CmpContactTableCtrl.ctrlSave(a.Id, data.lstContact);
        // check results
        for(Contact c: [Select FirstName from Contact Where AccountId = :a.Id])
        {
            system.assertEquals('Testy', c.FirstName);
        }

        // delete one contact
        CmpContactTableCtrl.ctrlDeleteRecord(a.Id, data.lstContact[0].Id);
        //check results
        lstContact = [Select Id from Contact where AccountId = :a.Id];
        system.assertEquals(4, lstContact.size());
    }

}