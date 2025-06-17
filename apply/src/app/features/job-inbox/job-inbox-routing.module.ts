import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobInboxPage } from './job-inbox.page';

const routes: Routes = [
  {
    path: '',
    component: JobInboxPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobInboxPageRoutingModule {}
