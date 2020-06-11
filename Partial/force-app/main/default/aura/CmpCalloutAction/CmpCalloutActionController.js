/**
 * Created by brendafinn on 2019-03-07.
 */
({
    init : function(component, event, helper) {
        try{
            console.log('====> CmpCalloutActionController init()');
            helper.hlpInit(component, event);
        }
        catch(e){
            component.notify(e, 'CmpCalloutAction');
        }

    }
})