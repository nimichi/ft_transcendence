import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  public modals: IModal[] = []

  constructor() { }

  register(id: string) {
    this.modals.push({
      id,
      visible: false
    })
	console.log('model length: ' + this.modals.length)
  }

  unregister(id: string){
    this.modals = this.modals.filter(
      element => element.id !== id
    )
	console.log(this.modals)
  }
  //puts all but the id objct in a new array

  isModalVisible(id: string): boolean{
	const bool = Boolean(this.modals.find(element => element.id === id)?.visible)
    return bool;
    // return !!this.modals.find(element => element.id === id)?.visible
    //? is called optional chaining to prevent segfault so to say
    //beide varianten sind dafur da um boolean zu forcen
  }

  toggleModal(id: string){
    const modal = this.modals.find(element => element.id === id)
    if(modal)
    modal.visible = !modal.visible
  }

  showModal(id: string){
    const modal = this.modals.find(element => element.id === id)
    if(modal)
    	modal.visible = true
  }

  hideModal(id: string){
    const modal = this.modals.find(element => element.id === id)
    if(modal)
    	modal.visible = false
  }
}
