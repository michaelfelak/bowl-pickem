import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BowlService } from '../shared/services/bowl.service';
import { HttpClientModule } from '@angular/common/http';
import { SkyIconModule, SkyWaitModule } from '@skyux/indicators';
import { SkyDropdownModule } from '@skyux/popovers';
import { StandingsFlyoutComponent } from './standings-flyout/standings-flyout.component';
import { SkyAppConfig } from '@skyux/config';
import { CommonModule } from '@angular/common';
import { StandingsComponent } from './standings.component';
import { provideAnimations } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        StandingsFlyoutComponent,
        StandingsComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        HttpClientModule,
        SkyWaitModule,
        SkyDropdownModule,
        SkyIconModule
    ],
    providers: [
        BowlService,
        SkyAppConfig,
        provideAnimations()
    ],
})
export class StandingsModule { }
