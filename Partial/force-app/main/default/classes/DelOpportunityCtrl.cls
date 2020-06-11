/* Class:       DelOpportunityCtrl
 * Created On:  12/8/2017
 * Created by:  OpFocus Team
 * Description: Controller for override on Opportunity Delete button
 */ 
public class DelOpportunityCtrl {

	public final Opportunity opp {get; private set;}
	public String errorMsg {get; set;}
	public Boolean blnCanBeDeleted {get; set;}

	public DelOpportunityCtrl(ApexPages.StandardController stdController) {
        this.opp = (Opportunity)stdController.getRecord();
    }

    /**
     * Initialize the page  - for us, this means that we make a callout to OpportunityDeleteCheck
     * to ensure that this Opp can safely be deleted from backend. If everything is a go-ahead, 
     * delete opp and return user to Opportunity List View.
     */
    public PageReference init() {
        String endPoint = AdminApputils.getAdminAppBaseUrl() + '.careercruising.com/api/Integrations/OpportunityDeleteCheck?Id=' + this.opp.Id;  
		String responseBody = AdminApputils.makeCallout(endPoint, this.opp.Id, 'DelOpportunityCtrl.init');

		// response body is formatted as follows : {"result" : {"success":"true","message":"XXX", "detail":""}, "Id":"000000000000000"}
		System.debug('======> responseBody = ' + responseBody);
		Map<String,Object> mapParams = (Map<String,Object>)JSON.deserializeUntyped(responseBody);
		
		Map<String, Object> resultObj = (Map<String, Object>)mapParams.get(RESULT_PARAM);
    	Boolean blnSuccess = (Boolean)resultObj.get(SUCCESS_PARAM);
    	if (blnSuccess) {
    		// now need to verify that there are no Renewal Opportunities. 
    		if (!canOppBeDeleted()) {
    			return null; // stay on page so we can display error message
    		}
    		// indicate to trigger that deletion check has occured
    		opp.Is_Delete_Check_Done__c = true;
    		update opp; 
    		// opp can be deleted - delete it now and redirect back to opportunity list view
            delete opp;


    		PageReference oppListView = new PageReference('/006/o');
    		oppListView.setRedirect(true);
            return oppListView;
    	} else {
    		// Opportunity cannot be deleted
    		errorMsg = (String)resultObj.get(MESSAGE_PARAM) + ' ' + 
    			(resultObj.get(DETAIL_PARAM) != null ? resultObj.get(DETAIL_PARAM) : '');
    		return null;
    	}
    }

    /**
     * Determine if our Opportunity can be deleted. It can be as long as it is not
     * referenced by another Opportunity as the Renewal Opportunity
     * @return true if Opp is not associated with a Renewal, false otherwise
     */
    private Boolean canOppBeDeleted() {
    	blnCanBeDeleted =  true;
    	Integer numRenewalOpps = [select Count() from Opportunity where Renewal_Opportunity__c=:opp.Id];
    	if (numRenewalOpps > 0) {
    		errorMsg = FAILURE_MESSAGE;
	    	blnCanBeDeleted = false;
    	}

    	return blnCanBeDeleted;
    }

    private static final String RESULT_PARAM = 'result';
    private static final String SUCCESS_PARAM = 'success';
    private static final String DETAIL_PARAM = 'detail';
 	private static final String MESSAGE_PARAM = 'message';
 	private static final String FAILURE_MESSAGE = 'Other opportunities reference this opportunity as a renewal. ';
       
}