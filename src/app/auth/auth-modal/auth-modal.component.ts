import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class AuthModalComponent implements OnInit {
  @Input() isLogin!: boolean;

  signinForm!: FormGroup;
  signupForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.signinForm = this.fb.group({
      email: ['admin@gmail.com'],
      password: ['123456'],
    });

    this.signupForm = this.fb.group({
      fullName: ['Admin'],
      email: ['admin@gmail.com'],
      password: ['123456'],
    });
  }

  onSignUp() {
    this.authService.signUp(this.signupForm.value).subscribe({
      next: () => {
        this.onCancel();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onSignIn() {
    this.authService.signIn(this.signinForm.value).subscribe({
      next: () => {
        this.onCancel();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }
}
