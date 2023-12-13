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

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    StandingsModule,
    AdminModule,
    PicksModule
  ],
  providers: [BowlService],
  bootstrap: [AppComponent]
})
export class AppModule { }
