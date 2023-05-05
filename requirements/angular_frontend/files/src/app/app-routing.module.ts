import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login-button/login.component';
import { UserComponent } from './user/user.component';
import { FriendsComponent } from './friends/friends.component';

const routes: Routes = [{

  path: '',
  component: LoginComponent
},
{
  path: 'user',
  component: UserComponent
},
{
  path: 'home',
  component: HomeComponent
},
{
  path: 'friends',
  component: FriendsComponent
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
