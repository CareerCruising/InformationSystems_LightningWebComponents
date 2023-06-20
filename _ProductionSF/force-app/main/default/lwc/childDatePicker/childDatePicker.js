import { LightningElement, api, track } from 'lwc';

export default class ChildDatePicker extends LightningElement {
    @api getDatePickerValuesFromParent;
    @track StartDate;
    @track EndDate;
  
      connectedCallback() {  
          //onsole.log(this.getDatePickerValuesFromParent);
          this.StartDate = this.getDatePickerValuesFromParent.StartDate;
          this.EndDate = this.getDatePickerValuesFromParent.EndDate;
      }
  
      handleStartDateChange(event) {
          this.StartDate = event.detail.value;
      }
  
      handleEndDateChange(event) {
          this.EndDate = event.detail.value;
      }
  
      DispatchEventToParent() {
          const StartSearchEvent = new CustomEvent("getdatepickervalues", {
              detail: {StartDate: this.StartDate, EndDate: this.EndDate}
          });
          this.dispatchEvent(StartSearchEvent);
      }  
}

/* 
ADD THIS TO THE PARENT HTML
    <c-child-date-picker get-date-picker-values-from-parent={ChildDatePicker} ongetdatepickervalues={handleDatePickerChange}></c-child-date-picker>

ADD THIS TO THE PARENT js
	import {} from 'c/childDatePicker';

    @track ChildDatePicker = {
        StartDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, new Date().getDate()).toISOString().substring(0,8) + '01', 
        EndDate: new Date().toISOString().substring(0,10)
    };
    handleDatePickerChange(event) {
        this.ChildDatePicker = event.detail;
        console.log('ChildDatePicker: ', this.ChildDatePicker);
    }
*/