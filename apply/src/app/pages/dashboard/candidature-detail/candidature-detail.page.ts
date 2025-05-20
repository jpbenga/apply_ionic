// src/app/pages/dashboard/candidature-detail/candidature-detail.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonList, IonButton, 
  IonIcon, IonChip
} from '@ionic/angular/standalone';
import { HeaderService } from '../../../services/header/header.service';
import { UserHeaderComponent } from '../../../components/user-header/user-header.component';
import { addIcons } from 'ionicons';
import { documentText, mail, call, calendar } from 'ionicons/icons';

@Component({
  selector: 'app-candidature-detail',
  templateUrl: './candidature-detail.page.html',
  styleUrls: ['./candidature-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent,
    IonItem, 
    IonLabel, 
    IonList, 
    IonButton,
    IonIcon,  
    IonChip,
    UserHeaderComponent
  ]
})
export class CandidatureDetailPage implements OnInit {
  candidatureId: string | null = null;
  candidature: any = {}; // Remplacer par votre modèle de candidature

  constructor(
    private route: ActivatedRoute,
    private headerService: HeaderService
    // Injecter d'autres services nécessaires (CandidatureService, etc.)
  ) {
    addIcons({ documentText, mail, call, calendar });
  }

  ngOnInit() {
    this.headerService.updateTitle('Détail candidature');
    this.headerService.setShowBackButton(true);
    
    // Récupérer l'ID de la candidature depuis l'URL
    this.candidatureId = this.route.snapshot.paramMap.get('id');
    
    if (this.candidatureId) {
      this.loadCandidature(this.candidatureId);
    }
  }

  ionViewWillLeave() {
    this.headerService.setShowBackButton(false);
  }

  loadCandidature(id: string) {
    // Exemple - à remplacer par votre logique de récupération des données
    // this.candidatureService.getCandidature(id).subscribe(data => {
    //   this.candidature = data;
    // });
    
    // Données fictives pour démonstration
    this.candidature = {
      id: id,
      entreprise: 'Entreprise ABC',
      poste: 'Développeur Full Stack',
      status: 'interview',
      datePostulation: new Date(),
      description: 'Poste de développeur full stack avec technologies modernes.',
      suivis: [
        { date: new Date(), type: 'email', notes: 'Envoi de candidature' },
        { date: new Date(), type: 'appel', notes: 'Appel pour convenir d\'un entretien' }
      ]
    };
  }
}