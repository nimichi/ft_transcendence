import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { NavComponent } from './nav/nav.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login-button/login.component';
import { HomeComponent } from './home/home.component';
import { SocketService } from './socket/socket.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FriendsComponent } from './friends/friends.component';
import { RedirectComponent } from './redirect/redirect.component';
import { DisplayComponent } from './display/display.component';
import { SharedModule } from './shared/shared.module';
import { ChatModule } from './chat/chat.module';
import { HistoryComponent } from './history/history.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    LoginComponent,
    HomeComponent,
    FriendsComponent,
    RedirectComponent,
    DisplayComponent,
    HistoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    ChatModule,
    UserModule,
    HttpClientModule,
    BrowserAnimationsModule,
	  ReactiveFormsModule,
    FormsModule
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
