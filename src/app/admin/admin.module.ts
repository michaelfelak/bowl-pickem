import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BowlService } from '../shared/services/bowl.service';
import { HttpClientModule } from '@angular/common/http';
import { SkyAlertModule, SkyIconModule, SkyStatusIndicatorModule, SkyWaitModule } from '@skyux/indicators';
import { SkyDropdownModule } from '@skyux/popovers';
import { SkyAppConfig } from '@skyux/config';
import { CommonModule } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AddBowlComponent } from './add-bowl/add-bowl.component';
import { AdminComponent } from './admin.component';
import { SkyRepeaterModule } from '@skyux/lists';
import { AddBowlGameComponent } from './add-bowl-game/add-bowl-game.component';
import { PaidStatusComponent } from './paid-status/paid-status.component';
import { UpdateScoresComponent } from './update-scores/update-scores.component';
import { SkyInputBoxModule } from '@skyux/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TiebreakersComponent } from './tiebreakers/tiebreakers.component';

@NgModule({
    declarations: [
        AddBowlComponent,
        AddBowlGameComponent,
        PaidStatusComponent,
        UpdateScoresComponent,
        AdminComponent,
        TiebreakersComponent,
    ],
    imports: [
        BrowserModule,
        CommonModule,
        SkyDropdownModule,
        SkyRepeaterModule,
        SkyAlertModule,
        SkyIconModule,
        SkyInputBoxModule,

        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [
        BowlService,
        SkyAppConfig,
        provideAnimations()
    ],
})
export class AdminModule { }
