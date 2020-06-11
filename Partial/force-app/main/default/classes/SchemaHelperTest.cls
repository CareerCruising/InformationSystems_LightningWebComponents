/* Class:       SchemaHelperTest
 * Created On:  06/01/2017
 * Created by:  Veena Sundara-Heragu (OpFocus, Inc)
 * Description: Test class for SchemaHelper
 */

@isTest
public class SchemaHelperTest {
	
	
	//test methods

	static testMethod void myTest1() {
		Schema.SObjectField f = Schema.SObjectType.Account.fields.getMap().get('AccountNumber');
		System.assert(SchemaHelper.canFilter(f));
		System.assert(SchemaHelper.canGroup(f));
		System.assertNotEquals(null,SchemaHelper.canSee(f));
		System.assert(SchemaHelper.canSort(f));
		System.assertNotEquals(null,(SchemaHelper.canUpdate(f)));
		System.assert(SchemaHelper.getFieldsByName('Account', new String[]{'Id','Name'}) != null);
		System.assert(SchemaHelper.getFieldsByName('Account', new Set<String>{'Id','Name'}) != null);
		System.assert(SchemaHelper.getFieldsByNameNoPermission('Account', new String[]{'Id','Name'}) != null);
		System.assert(SchemaHelper.getFieldsByNameNoPermission('Account', new Set<String>{'Id','Name'}) != null);
		System.assert(SchemaHelper.getPicklistValues('Opportunity', 'StageName') != null);
		//System.assert(SchemaHelper.getRecordType('Account', 'Certified Partner') != null);
		//System.assert(SchemaHelper.getRecordType('Account', 'Client') != null);
		System.assert(SchemaHelper.getRelationshipSObjectFields('Account', 'Name') != null);
		System.assert(SchemaHelper.getRelationshipSObjectFieldsNoPermission('Account', 'Name') != null);
		System.assert(SchemaHelper.getSOPicklistValues('Opportunity', 'StageName') != null);
		System.assert(SchemaHelper.getSObjectFields('Account') != null);
		System.assert(SchemaHelper.getSObjectFieldsNoPermission('Account') != null);
		System.assert(SchemaHelper.getSetFieldsByNames('Account', new String[]{'Id','Name'}) != null);
		System.assert(SchemaHelper.getSetFieldsByNames('Account', new Set<String>{'Id','Name'}) != null);
		System.assert(SchemaHelper.getSetFieldsByNamesNoPermission('Account', new String[]{'Id','Name'}) != null);
		System.assert(SchemaHelper.getSetFieldsByNamesNoPermission('Account', new Set<String>{'Id','Name'}) != null);
		System.assert(SchemaHelper.getSetFieldsByObject('Account') != null);
		System.assert(!SchemaHelper.ignorePermissions);

	}
	
}