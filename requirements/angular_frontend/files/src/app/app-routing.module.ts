import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login-button/login.component';
import { UserComponent } from './user/user.component';

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
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
