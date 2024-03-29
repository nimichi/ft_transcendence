import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal/modal.component';
import { TabsContainerComponent } from './tabs-container/tabs-container.component';
import { TabComponent } from './tab/tab.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';
import { NgxMaskDirective } from 'ngx-mask';
import { NgxMaskPipe } from 'ngx-mask';
import { AlertComponent } from './alert/alert.component';
import { ModalService } from '../services/modal.service';


@NgModule({
  declarations: [
    ModalComponent,
    TabsContainerComponent,
    TabComponent,
    AlertComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe
  ],
  exports: [
    ModalComponent,
    TabsContainerComponent,
    TabComponent,
    AlertComponent,
  ],
  providers: [
    provideNgxMask(),
  ]
})
export class SharedModule {
	constructor(public modalService: ModalService){

	}
}
