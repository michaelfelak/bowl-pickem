import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BowlService } from '../shared/services/bowl.service';
import { SkyAlertModule, SkyIconModule, SkyKeyInfoModule } from '@skyux/indicators';
import { SkyDropdownModule } from '@skyux/popovers';
import { SkyAppConfig } from '@skyux/config';
import { CommonModule } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SkyRepeaterModule } from '@skyux/lists';
import { SkyCheckboxModule, SkyInputBoxModule } from '@skyux/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BowlPicksFlyoutComponent } from './bowl-picks-flyout/bowl-picks-flyout.component';

@NgModule({
    declarations: [
        BowlPicksFlyoutComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        SkyDropdownModule,
        SkyRepeaterModule,
        SkyAlertModule,
        SkyIconModule,
        SkyCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        SkyInputBoxModule,
        SkyKeyInfoModule
    ],
    providers: [
        BowlService,
        SkyAppConfig,
        provideAnimations()
    ],
})
export class BowlScoresModule { }
