import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  //video 108 maybe change this all how he did it...?
    registerForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3)

      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      age: new FormControl('', [
        Validators.required,
        Validators.min(18),
        Validators.max(120)
      ]),
      pw: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
      ]),
      pwconfirm: new FormControl('', [
        Validators.required
      ]),
      phone: new FormControl('', [
        Validators.required,
        Validators.min(13),
        Validators.max(13)
      ])

    })
    //retrieve info from the form and controll it

    showAlert = false
    alertMsg = 'Please wait! Your account is being created.'
    alertColor = 'blue'

    register(){
      this.showAlert = true
      this.alertMsg = 'Please wait! Your account is being created.'
      this.alertColor = 'blue'
    }

    constructor(){
      this.registerForm.controls.name
    }
}
