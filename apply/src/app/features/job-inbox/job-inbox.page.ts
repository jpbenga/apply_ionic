import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GcpAuthService } from '../../services/email-integration/gcp-auth.service';
import { EmailParserService } from '../../services/email-integration/email-parser.service';
// import { JobOffer } from '../../models/job-offer.model'; // Uncomment when JobOffer model is used

@Component({
  selector: 'app-job-inbox',
  templateUrl: './job-inbox.page.html',
  styleUrls: ['./job-inbox.page.scss'],
})
export class JobInboxPage implements OnInit {

  // jobOffers$: Observable<JobOffer[]>; // Uncomment when JobOffer model is used

  constructor(
    private gcpAuthService: GcpAuthService,
    private emailParserService: EmailParserService
  ) { }

  ngOnInit() {
  }

  connectEmail() {
    this.gcpAuthService.connectGoogleAccount().subscribe({
      next: (response) => console.log('Connected to Google Account', response),
      error: (error) => console.error('Error connecting to Google Account', error)
    });
  }

  scanEmails() {
    // this.jobOffers$ = this.emailParserService.scanForJobOffers(); // Uncomment when JobOffer model is used
    this.emailParserService.scanForJobOffers().subscribe({
        next: (offers) => console.log('Job offers found:', offers),
        error: (error) => console.error('Error scanning emails:', error)
    });
  }
}
