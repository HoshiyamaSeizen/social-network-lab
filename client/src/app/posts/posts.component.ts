import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { socketConnect } from '../socket';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.sass'],
})
export class PostsComponent implements OnInit {
  public posts: Post[] = [];
  public createPostHidden = true;
  public postContent = '';
  public socket: any;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('/api/posts').subscribe((posts: any) => {
      this.posts = posts.reverse();

      this.http.get('/api/auth/info').subscribe((user: any) => {
        this.socket = socketConnect(user.id);

        this.socket.on('post', (post: any) => {
          this.posts.unshift(post);
        });
      });
    });
  }

  addPost() {
    const date = this.getTime();

    this.http
      .post('/api/posts', { content: this.postContent, date })
      .subscribe((post: any) => {
        this.posts.unshift(post);
        this.socket.emit('post', post);
        this.postContent = '';
        this.createPostHidden = true;
      });
  }

  openCreatePost() {
    this.createPostHidden = !this.createPostHidden;
  }

  private getTime() {
    let date = new Date();
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    return date.toISOString().split('T')[0];
  }
}

type Post = {
  id: number;
  author: string;
  avatar: string;
  content: string;
  date: string;
  active: boolean;
};
