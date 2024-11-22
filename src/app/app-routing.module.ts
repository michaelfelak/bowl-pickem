import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { StandingsComponent } from './standings/standings.component';
import { AdminComponent } from './admin/admin.component';
import { AdminRouteGuard } from './admin/index.guard';
import { PicksComponent } from './picks/picks.component';
import { HomeComponent } from './home.component';
import { BowlScoresComponent } from './bowl-scores/bowl-scores.component';
import { ScenarioGeneratorComponent } from './scenario-generator/scenario-generator.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'picks',
    component: PicksComponent
  },
  {
    path: 'scores',
    component: BowlScoresComponent
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminRouteGuard]
  },
  {
    path: 'standings',
    component: StandingsComponent
  },
  {
    path: 'scenario-generator',
    component: ScenarioGeneratorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AdminRouteGuard]
})
export class AppRoutingModule { }
