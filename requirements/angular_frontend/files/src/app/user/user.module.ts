import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModalComponent } from './auth-modal/auth-modal.component';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserComponent } from './user.component';
// import { ChatModule } from '../chat/chat.module';
import { ChatComponent } from '../chat/chat.component';
// import { NavComponent } from '../nav/nav.component';

@NgModule({
  declarations: [
    AuthModalComponent,
    LoginComponent,
    RegisterComponent,
    UserComponent,
    ChatComponent,
    // NavComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    // ChatModule
  ],
  exports: [
    AuthModalComponent
  ]
})
export class UserModule { }
