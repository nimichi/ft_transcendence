import { Component, Input, ElementRef } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {

  @Input() modalID = ''

  constructor(
    public modal: ModalService,
    public el: ElementRef){
  }


  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement)
  }
  //fehlt was bei der Class und den imports

  closeModal(){
    this.modal.toggleModal(this.modalID)
  }

}
