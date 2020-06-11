({
  doneRendering: function(component, event, helper) {
  	console.log('in doneRendering');
    if(!component.get("v.isDoneRendering")){
      component.set("v.isDoneRendering", true);
      $A.get('e.force:refreshView').fire();
      $A.get("e.force:closeQuickAction").fire();
    }
  }
})