import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BowlService } from '../shared/services/bowl.service';
import { SkyAlertModule, SkyIconModule } from '@skyux/indicators';
import { SkyDropdownModule } from '@skyux/popovers';
import { SkyAppConfig } from '@skyux/config';
import { CommonModule } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SkyRepeaterModule } from '@skyux/lists';
import { PicksComponent } from './picks.component';
import { PicksCompletedComponent } from './picks-completed/picks-completed.component';
import { PickSummaryComponent } from './pick-summary/pick-summary.component';
import { SkyPageSummaryModule } from '@skyux/layout';
import { SkyCheckboxModule } from '@skyux/forms';

@NgModule({
    declarations: [
        PicksComponent,
        PicksCompletedComponent,
        PickSummaryComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        SkyDropdownModule,
        SkyRepeaterModule,
        SkyAlertModule,
        SkyIconModule,
        SkyPageSummaryModule,
        SkyCheckboxModule
    ],
    providers: [
        BowlService,
        SkyAppConfig,
        provideAnimations()
    ],
})
export class PicksModule { }
