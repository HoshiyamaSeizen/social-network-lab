import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.sass'],
})
export class SignInComponent implements OnInit {
  public form = {
    email: '',
    password: '',
  };
  public err = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    if (this.getCookie('token')) this.router.navigateByUrl('/');
  }

  onSubmit() {
    this.http.post('/api/auth/login', this.form).subscribe((res: any) => {
      if (res.error) this.err = res.error;
      else this.router.navigateByUrl('/');
    });
  }

  getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()!.split(';').shift() : null;
  }
}
