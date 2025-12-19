import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { StandingsComponent } from './standings/standings.component';
import { AdminComponent } from './admin/admin.component';
import { AdminRouteGuard, PicksRouteGuard } from './admin/index.guard';
import { PicksComponent } from './picks/picks.component';
import { HomeComponent } from './home.component';
import { BowlScoresComponent } from './bowl-scores/bowl-scores.component';
import { ScenarioGeneratorComponent } from './scenario-generator/scenario-generator.component';
import { LoginComponent } from './auth/login.component';
import { ResetPasswordComponent } from './auth/reset-password.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { MyEntriesComponent } from './my-entries/my-entries.component';
import { ViewEntryComponent } from './my-entries/view-entry/view-entry.component';
import { EditEntryComponent } from './my-entries/edit-entry/edit-entry.component';
import { PickBreakdownsComponent } from './pick-breakdowns/pick-breakdowns.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
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
    component: PicksComponent,
    canActivate: [AuthGuard]
    // canActivate: [PicksRouteGuard]
  },
  {
    path: 'my-entries',
    component: MyEntriesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-entries/:id/view',
    component: ViewEntryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-entries/:id/edit',
    component: EditEntryComponent,
    canActivate: [AuthGuard]
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
  },
  {
    path: 'pick-breakdowns',
    component: PickBreakdownsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AdminRouteGuard, PicksRouteGuard, AuthGuard]
})
export class AppRoutingModule { }
