import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BowlService } from './shared/services/bowl.service';
import { HttpClientModule } from '@angular/common/http';
import { StandingsModule } from './standings/standings.module';
import { AdminModule } from './admin/admin.module';
import { PicksModule } from './picks/picks.module';
import { FooterComponent } from './shared/footer/footer.component';
import { BowlScoresComponent } from './bowl-scores/bowl-scores.component';
import { HomeComponent } from './home.component';
import { BowlScoresModule } from './bowl-scores/bowl-scores.module';
import { SkyRepeaterModule } from '@skyux/lists';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BowlScoresComponent,
    FooterComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    StandingsModule,
    AdminModule,
    PicksModule,
    BowlScoresModule,
    SkyRepeaterModule
  ],
  providers: [BowlService],
  bootstrap: [AppComponent]
})
export class AppModule { }
