import { Component } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { ModalComponent } from '../shared/modal/modal.component';


@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent {

    constructor( public tokenModal: ModalService){}

    ngOnInit(){

		  this.tokenModal.register('loginTFA')
      this.tokenModal.toggleModal('loginTFA')
    }

    ngOnDestroy(): void {
      this.tokenModal.unregister('loginTFA')
    }
}
