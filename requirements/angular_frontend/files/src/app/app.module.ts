import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { NavComponent } from './nav/nav.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login-button/login.component';
import { HomeComponent } from './home/home.component';
import { SocketService } from './services/socket.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    LoginComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    UserModule,
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
