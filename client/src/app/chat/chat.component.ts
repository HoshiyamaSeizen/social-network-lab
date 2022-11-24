import { socketConnect } from './../socket';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.sass'],
})
export class ChatComponent implements OnInit {
  public id = 0;
  public userId = 0;
  public username = '';
  public socket: any;
  public message = '';
  public friend?: User;
  public friend_online = false;
  public messages: Message[] = [];
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;

    if (!this.getCookie('token')) this.router.navigateByUrl('/login');

    this.http.get('/api/messages/' + this.id).subscribe((messages: any) => {
      this.messages = messages;

      this.http.get('/api/auth/info').subscribe((user: any) => {
        this.userId = user.id;
        this.username = user.name;

        this.socket = socketConnect(this.userId);
        this.socket.emit('connect-chat', this.id);

        this.socket.on('online', (status: boolean) => {
          this.friend_online = status;
        });

        this.socket.on('message', (content: string) => {
          this.messages.push({ you: false, content });
        });

        this.http.get('/api/users/friends').subscribe((users: any) => {
          this.friend = users.find((u: any) => u.id === +this.id);
        });
      });
    });
  }

  sendMessage() {
    if (!this.message) return;
    this.http
      .post('/api/messages/' + this.id, { content: this.message })
      .subscribe(({ sent }: any) => {
        if (!sent) return;
        this.messages.push({ you: true, content: this.message });
        this.socket.emit('message', { to: this.id, message: this.message });
        this.message = '';
      });
  }

  getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()!.split(';').shift() : null;
  }
}

type User = {
  id: number;
  name: string;
  avatar: 'string';
  friend: boolean;
  status: string;
};

type Message = {
  you: boolean;
  content: string;
};
