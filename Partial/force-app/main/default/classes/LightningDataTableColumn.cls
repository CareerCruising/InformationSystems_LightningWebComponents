/* Class:       LightningDataTableColumn
** Created by:  OpFocus (Veena Sundara-Heragu) on 7/23/18
** Description: Column specification for lightning:datatable
*/
public with sharing class LightningDataTableColumn
{
    @AuraEnabled public String label;
    @AuraEnabled public List<Action> actions;
    @AuraEnabled public CellAttribute cellAttributes;
    @AuraEnabled public Boolean editable;
    @AuraEnabled public String fieldName;
    @AuraEnabled public String iconName;
    @AuraEnabled public Integer initialWidth;
    @AuraEnabled public Boolean sortable;
    @AuraEnabled public String type; // action, boolean, button, currency, date, date-local, email, location, number, percent, phone, text, url
    @AuraEnabled public TypeAttribute typeAttributes;

    public Class Action
    {
        @AuraEnabled public String label;
        @AuraEnabled public String name;
    }

    public Class CellAttribute
    {
        @AuraEnabled public String alignment; // right, left or center
        @AuraEnabled public String iconName;
        @AuraEnabled public String iconLabel;
        @AuraEnabled public String iconPosition; // left or right
    }

    public Class TypeAttribute
    {
        // type = currency
        @AuraEnabled public String currencyCode;
        @AuraEnabled public String currencyDisplayAs; // code, name or symbol
        // type = action
        @AuraEnabled public List<Action> rowActions;
        @AuraEnabled public String menuAlignment; //left, center, right, bottom-left, bottom-center, bottom-right
        // type = button
        @AuraEnabled public Boolean disabled;
        @AuraEnabled public String iconName;
        @AuraEnabled public String iconPosition;
        @AuraEnabled public String label; // also for url
        @AuraEnabled public String name;
        @AuraEnabled public String title;
        @AuraEnabled public String variant;
        // type = date
        @AuraEnabled public String day; // also date-local // numeric or 2-digit
        @AuraEnabled public String era; // narrow, short, or long
        @AuraEnabled public String hour; // numeric or 2-digit
        @AuraEnabled public Boolean hour12; // whether time is displayed as 12-hour
        @AuraEnabled public String minute; // numeric or 2-digit
        @AuraEnabled public String month; // also date-local // 2-digit, narrow, short, or long
        @AuraEnabled public String second; // numeric or 2-digit
        @AuraEnabled public String timeZone; // any time zone listed in the IANA time zone database
        @AuraEnabled public String timeZoneName; // short or long
        @AuraEnabled public String weekday; // narrow, short, or long
        @AuraEnabled public String year; // also date-local // numeric or 2-digit
        //type = email
        @AuraEnabled public Decimal latitude;
        @AuraEnabled public Decimal longitude;
        //type = number adn percent
        @AuraEnabled public Integer minimumIntegerDigits; // 1 to 21
        @AuraEnabled public Integer minimumFractionDigits;
        @AuraEnabled public Integer maximumFractionDigits;
        @AuraEnabled public Integer minimumSignificantDigits; // 1 to 21
        @AuraEnabled public Integer maximumSignificantDigits; // 1 to 21
        //type = url
        @AuraEnabled public String target; // _blank, _parent, _self, and _top
    }
}