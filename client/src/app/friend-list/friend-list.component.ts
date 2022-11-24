import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.sass'],
})
export class FriendListComponent implements OnInit {
  public users: User[] = [];
  public addFriendHidden = true;
  public userId = '';
  public err = '';
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get('/api/users/friends').subscribe((users: any) => {
      this.users = users;
    });
  }

  addFriend() {
    this.http
      .post('/api/users/friends/add', { id: this.userId })
      .subscribe((user: any) => {
        if (user.error) this.err = user.error;
        else {
          this.users.unshift(user);
          this.userId = '';
          this.err = '';
          this.addFriendHidden = true;
        }
      });
  }

  openAddFriend() {
    this.addFriendHidden = !this.addFriendHidden;
    this.err = '';
  }

  openChat(id: number) {
    this.router.navigateByUrl('/chat/' + id);
  }
}

type User = {
  id: number;
  name: string;
  avatar: 'string';
  friend: boolean;
};
