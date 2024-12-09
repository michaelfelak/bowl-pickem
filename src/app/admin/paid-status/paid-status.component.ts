import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import { Entry } from '../../shared/services/bowl.model';
import { mergeMap } from 'rxjs/operators';
import {
  SkyConfirmInstance,
  SkyConfirmService,
  SkyConfirmType,
} from '@skyux/modals';
import { CommonModule } from '@angular/common';
import { SkyIconModule } from '@skyux/indicators';
import { SkyRepeaterModule } from '@skyux/lists';
import { SettingsService } from 'src/app/shared/services/settings.service';

@Component({
  standalone: true,
  selector: 'app-paid-status',
  imports: [CommonModule, SkyIconModule],
  providers: [SettingsService],
  templateUrl: './paid-status.component.html',
  styleUrls: ['./paid-status.component.scss'],
})
export class PaidStatusComponent implements OnInit {
  @Output()
  public numberOfEntrants = new EventEmitter<string>();

  public entries: Entry[] = [];
  public numUnpaidEntries = 0;
  public numPaidEntries = 0;
  public selectedAction: any;
  public selectedText: any;
  constructor(
    private svc: BowlService,
    private confirmService: SkyConfirmService,
    private settings: SettingsService
  ) {}

  public ngOnInit() {
    this.refresh();
  }

  public refresh() {
    this.svc
      .getEntries(this.settings.currentYear)
      .subscribe((result: Entry[]) => {
        this.entries = result;

        this.sortEntriesByPaidStatus();
        this.calculatePaidTotal();
      });
  }

  // sorts entries by paid status, unpaid then paid
  public sortEntriesByPaidStatus() {
    if (this.entries) {
      this.entries.sort((a: Entry, b: Entry) => {
        return Number(a.paid) - Number(b.paid);
      });
    }
  }

  public togglePaid(id: string) {
    this.svc
      .togglePaid(id)
      .pipe(
        mergeMap(() => {
          return this.svc.getEntries(this.settings.currentYear);
        })
      )
      .subscribe((result: Entry[]) => {
        this.entries = result;
        this.calculatePaidTotal();
        this.sortEntriesByPaidStatus();
      });
  }

  public deleteEntry(id: string) {
    const dialog: SkyConfirmInstance = this.confirmService.open({
      message: 'Delete entry ' + id,
      body: 'Are you sure you want to delete this entry?',
      type: SkyConfirmType.YesCancel,
    });

    dialog.closed.subscribe((result: any) => {
      if (result.action === 'yes') {
        this.svc.deleteEntry(id).subscribe(() => {
          this.refresh();
          this.calculatePaidTotal();
        });
      }
    });
  }

  private calculatePaidTotal() {
    if (this.entries) {
      this.numPaidEntries = this.entries.filter(function (entry) {
        return entry.paid === true;
      }).length;

      this.numUnpaidEntries = this.entries.filter(function (entry) {
        return entry.paid === false;
      }).length;

      //   <span class="label">
      //   {{ this.numUnpaidEntries }} Unpaid - {{ this.numPaidEntries }} Paid -
      //   {{ this.numPaidEntries + this.numUnpaidEntries }} Total
      // </span>
      this.numberOfEntrants.emit(
        this.numUnpaidEntries +
          ' Unpaid - ' +
          this.numPaidEntries +
          ' Paid - ' +
          this.entries +
          ' Total'
      );
    }
  }
}
