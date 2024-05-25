import { LightningElement, track } from 'lwc';

export default class MiscUI extends LightningElement {
    @track popover = {} //Handles all popover logic
    @track modal = {} //Handles all modal logic

    // MODALS
    ModalShow(event) {
        this.modal[event.target.dataset.modalname] = true;
    }
    ModalHide(event) {
        this.modal[event.target.dataset.modalname] = false;
    }

    PopoverShow(event) {
        this.popover[event.target.dataset.popovername] = true;
    }
    PopoverHide(event) {
        //onsole.log(event.target.dataset.popovername);
        this.popover[event.target.dataset.popovername] = false;
    }


}

