import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { StandingsComponent } from './standings/standings.component';
// import { AdminComponent } from './admin/admin.component';

const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent
  },
  // {
  //   path: 'admin',
  //   component: AdminComponent
  // },
  {
    path: 'standings',
    component: StandingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
