import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.sass'],
})
export class SignUpComponent implements OnInit {
  public form = {
    name: '',
    email: '',
    date: '',
    password: '',
    password1: '',
  };
  public err = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    if (this.getCookie('token')) this.router.navigateByUrl('/');
  }

  onSubmit() {
    const date = this.getTime();

    this.http
      .post('/api/auth/register', { ...this.form, date })
      .subscribe((res: any) => {
        if (res.error) this.err = res.error;
        else this.router.navigateByUrl('/');
      });
  }

  private getTime() {
    let date = new Date(this.form.date);
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    return date.toISOString().split('T')[0];
  }

  getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()!.split(';').shift() : null;
  }
}
