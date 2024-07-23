import { Component } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { AuthModalComponent } from '../auth/auth-modal/auth-modal.component';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MessagingService } from '../messaging/messaging.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage {
  isAuthenticated$: Observable<boolean>;
  useInfo: any;

  constructor(
    private authService: AuthService,
    private msgService: MessagingService,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    this.isAuthenticated$ = authService.isAuthicated$;
    this.authService.userInfo$.subscribe((data) => {
      this.useInfo = data;
    });
    this.msgService.listen().subscribe((newMessage) => {
      if (newMessage && newMessage.notification)
        this.displayMessage(
          newMessage.notification.title!,
          newMessage.notification.body!
        );
    });
  }

  async displayMessage(title: string, message: string) {
    const toast = await this.toastController.create({
      message: message,
      header: title,
      duration: 1500,
      position: 'top',
    });

    await toast.present();
  }

  async joinNowClick() {
    const modal = await this.modalController.create({
      component: AuthModalComponent,
      componentProps: {
        isLogin: true,
      },
    });

    modal.present();
  }

  logout() {
    this.authService.signOut();
  }
}
