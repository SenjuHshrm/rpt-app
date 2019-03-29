import { Component, OnInit } from '@angular/core';
import { Credentials } from '../classes/cred';
import { login } from '../services/login.service';
import { loginAuthRes } from '../classes/login';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SetAuthRoute } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;

  constructor(
    private auth: login,
    private setRoute: SetAuthRoute,
  ) { }

  ngOnInit() {
    if(localStorage.getItem('auth')){
      this.setRoute.alreadyAuth()
    }
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    })
  }
  login(form) {
    if(this.loginForm.valid){
      let data: Credentials = {
        username: form.username,
        password: form.password
      }
      this.auth.authenticateUser(data).subscribe(res => {
        // let decodedToken = jwt_decode(res.token)
        // let authRes: loginAuthRes = {
        //   iat: decodedToken.iat,
        //   name: decodedToken.name,
        //   username: decodedToken.username
        // }
        if(!res.success){

        } else {
          this.setRoute.storeToken(res.token)
        }
      })
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.loginForm.controls[controlName].hasError(errorName);
  }

}

export default LoginComponent
