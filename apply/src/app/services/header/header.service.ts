// src/app/services/header/header.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  // BehaviorSubject pour stocker le titre actuel
  private titleSource = new BehaviorSubject<string>('Apply');
  currentTitle = this.titleSource.asObservable();

  // BehaviorSubject pour gérer la visibilité du bouton retour
  private showBackButtonSource = new BehaviorSubject<boolean>(false);
  showBackButton = this.showBackButtonSource.asObservable();

  // Pour le menu utilisateur
  private userMenuOpenSource = new BehaviorSubject<boolean>(false);
  userMenuOpen = this.userMenuOpenSource.asObservable();

  constructor(private location: Location) { }

  updateTitle(title: string) {
    console.log('Updating title to:', title);
    this.titleSource.next(title);
  }

  setShowBackButton(show: boolean) {
    this.showBackButtonSource.next(show);
  }

  goBack() {
    this.location.back();
  }

  setUserMenuOpen(isOpen: boolean) {
    this.userMenuOpenSource.next(isOpen);
  }

  toggleUserMenu() {
    this.userMenuOpenSource.next(!this.userMenuOpenSource.value);
  }
}