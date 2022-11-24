import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pictures',
  templateUrl: './pictures.component.html',
  styleUrls: ['./pictures.component.sass'],
})
export class PicturesComponent implements OnInit {
  public images: Img[] = [];
  public addPictureHidden = true;
  public imageSrc = '';
  public dialogImg = '';
  public dialogImgId = -1;

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.http.get('/api/images').subscribe((images: any) => {
      this.images = images.reverse();
    });
  }

  addImage() {
    this.http
      .post('/api/images', { src: this.imageSrc })
      .subscribe((image: any) => {
        this.images.unshift(image);
        this.imageSrc = '';
        this.addPictureHidden = true;
      });
  }

  openAddPicture() {
    this.addPictureHidden = !this.addPictureHidden;
  }

  openImageDialog(id: number, src: string, active: boolean) {
    if (!active) return;
    this.dialogImg = src;
    this.dialogImgId = id;
    this.dialog.nativeElement.showModal();
  }

  closeImageDialog() {
    this.dialogImg = '';
    this.dialogImgId = -1;
    this.dialog.nativeElement.close();
  }

  setProfilePic() {
    this.http
      .put('/api/images/profile', { id: this.dialogImgId })
      .subscribe((res: any) => {
        location.reload();
      });
  }

  deleteImg() {
    if (window.confirm('Do you really want to delete this image?'))
      this.http
        .delete(`/api/images/${this.dialogImgId}`)
        .subscribe((res: any) => {
          location.reload();
        });
  }
}

type Img = { id: number; src: string; active: boolean };
