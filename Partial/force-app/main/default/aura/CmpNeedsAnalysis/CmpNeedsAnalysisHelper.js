({
	initData : function(component) {
		var action = component.get('c.getData');

		var params = {
			recordId : component.get('v.recordId'),
			lookupField : component.get('v.lookupField')
		};
		
		var helper = this;

		var onsuccess = function(c,r){
			helper.setInitData(c,r);
		}	

		component.call(action, params, onsuccess);
	},

	setInitData : function(component, result){
		console.log(result);
		component.set('v.checklist', result.checklist);
		component.set('v.naid', result.naId);
        if(result.naId){
            $A.util.removeClass(component.find('recordView'), 'slds-hide');
        }
        else{
            $A.util.addClass(component.find('recordView'), 'slds-hide');
        }
	}
})