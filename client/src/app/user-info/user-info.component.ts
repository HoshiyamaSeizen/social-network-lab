import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.sass'],
})
export class UserInfoComponent implements OnInit {
  public err = '';
  public isAdmin = false;
  public id = 0;
  public form = {
    name: '',
    date: '',
  };
  public image = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.http.get('/api/auth/info').subscribe((user: any) => {
      this.id = user.id;
      this.form = { name: user.name, date: user.date };
      this.isAdmin = user.role.toLowerCase() === 'admin';
      this.image = user.avatar;
    });
  }

  onSubmit() {
    const date = this.getTime();

    this.http.put('/api/auth', { ...this.form, date }).subscribe((res: any) => {
      if (res.error) this.err = res.error;
      else this.snackBar.open('Changes saved', 'OK');
    });
  }

  deleteAcc(e: MouseEvent) {
    e.preventDefault();
    if (window.confirm('Do you really want to delete your account?'))
      this.http
        .delete('/api/auth')
        .subscribe(() => this.router.navigateByUrl('/login'));
  }

  logout() {
    this.http.get('/api/auth/logout').subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }

  goAdmin() {
    window.open('https://localhost:3000/', '_blank')!.focus();
  }

  private getTime() {
    let date = new Date(this.form.date);
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    return date.toISOString().split('T')[0];
  }
}
