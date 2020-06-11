/* Class:       CmpContactTableCtrl
** Created by:  OpFocus (Veena Sundara-Heragu) on 7/23/18
** Description: Controller for CmpContactTable
*/
public with sharing class CmpContactTableCtrl
{
    /**
     * Fetch all the existing contacts for the account and specify the column information for the
     * lightning:datatable component
     * @param accountId
     * @return
     */
    @AuraEnabled
    public static LightningTableData ctrlFetchContacts( String accountId)
    {
        try
        {
            LightningTableData retVal = new LightningTableData();

            // get contacts for this account
            retVal.lstContact = [Select Id, FirstName, LastName, Email, Phone
                                    From Contact
                                            Where AccountId = :accountId];

            // build the data for lightning:datatable to display columns
            // this can be done in javascript too
            retVal.lstColumn = new List<LightningDataTableColumn>();
            LightningDataTableColumn col1 = new LightningDataTableColumn();
            col1.fieldName = 'FirstName';
            col1.label = 'First Name';
            col1.type = 'text';
            col1.sortable = true;
            col1.editable = true;
            retVal.lstColumn.add(col1);

            LightningDataTableColumn col2 = new LightningDataTableColumn();
            col2.fieldName = 'LastName';
            col2.label = 'Last Name';
            col2.type = 'text';
            col2.sortable = true;
            col2.editable = true;
            retVal.lstColumn.add(col2);

            LightningDataTableColumn col3 = new LightningDataTableColumn();
            col3.fieldName = 'Email';
            col3.label = 'Email';
            col3.type = 'email';
            col3.sortable = true;
            col3.editable = true;
            retVal.lstColumn.add(col3);

            LightningDataTableColumn col4 = new LightningDataTableColumn();
            col4.fieldName = 'Phone';
            col4.label = 'Phone';
            col4.type = 'phone';
            col4.sortable = true;
            col4.editable = true;
            retVal.lstColumn.add(col4);

            LightningDataTableColumn col5 = new LightningDataTableColumn();
            col5.type = 'button';
            col5.typeAttributes = new LightningDataTableColumn.TypeAttribute();
            col5.typeAttributes.iconName = 'utility:delete';
            col5.typeAttributes.label = '';
            col5.typeAttributes.name = 'Delete';
            col5.typeAttributes.title = 'Delete';
            col5.typeAttributes.disabled = false;
            retVal.lstColumn.add(col5);

            LightningDataTableColumn col6 = new LightningDataTableColumn();
            col6.type = 'action';
            LightningDataTableColumn.Action ac = new LightningDataTableColumn.Action();
            ac.label = 'Edit';
            ac.name = 'Edit';
            col6.typeAttributes = new LightningDataTableColumn.TypeAttribute();
            col6.typeAttributes.rowActions = new List<LightningDataTableColumn.Action>{ac};
            retVal.lstColumn.add(col6);

            return retVal;
        }
        catch (Exception ex)
        {
            throw new AuraHandledException('Exception occurred:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
        }
    }

    /**
     * Save changed that have been made to the contacts
     * @param accountId
     * @param lstUpdateRecords
     * @return
     */
    @AuraEnabled
    public static LightningTableData ctrlSave(String accountId, List<Contact>lstUpdateRecords)
    {
        try
        {
            update lstUpdateRecords;
            // fetch the contacts again to display the new information in the component
            return ctrlFetchContacts(accountId);
        }
        catch (Exception ex)
        {
            throw new AuraHandledException('Exception occurred:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
        }
    }

    /**
     * delete contact
     * @param accountId
     * @param recordId  Id of Contact
     * @return
     */
    @AuraEnabled
    public static LightningTableData ctrlDeleteRecord(String accountId, String recordId)
    {
        try
        {
            Contact oli = new Contact(Id = recordId);
            delete oli;
            // fetch the contacts again to display the new information in the component
            return ctrlFetchContacts(accountId);
        }
        catch (Exception ex)
        {
            throw new AuraHandledException('Exception occurred:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
        }
    }

    public Class LightningTableData
    {
        @AuraEnabled public List<Contact> lstContact;
        @AuraEnabled public List<LightningDataTableColumn> lstColumn;
    }

}