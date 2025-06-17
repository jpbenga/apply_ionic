import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { JobInboxPageRoutingModule } from './job-inbox-routing.module'; // Will be created in the integration step
import { JobInboxPage } from './job-inbox.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobInboxPageRoutingModule
  ],
  declarations: [JobInboxPage]
})
export class JobInboxPageModule {}
