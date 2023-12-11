import { Component, OnInit } from '@angular/core';
import { BowlService } from '../../shared/services/bowl.service';
import { Entry } from '../../shared/services/bowl.model';
import { mergeMap } from 'rxjs/operators';
import {
  SkyConfirmInstance,
  SkyConfirmService,
  SkyConfirmType
} from '@skyux/modals';

@Component({
  selector: 'paid-status',
  templateUrl: './paid-status.component.html',
  styleUrls: ['./paid-status.component.scss']
})
export class PaidStatusComponent implements OnInit {
  public entries: Entry[] = [];
  public numUnpaidEntries: number = 0;
  public numPaidEntries: number = 0;
  public selectedAction: any;
  public selectedText: any;
  constructor(
    private svc: BowlService,
    private confirmService: SkyConfirmService
  ) {}

  public ngOnInit() {
    this.refresh();
  }

  public refresh() {
    this.svc.getEntries().subscribe(
      (result: Entry[]) => {
        this.entries = result;
        this.sortEntriesByPaidStatus();
        this.calculatePaidTotal();
      },
      (err: Error) => {
        console.log('error reaching the web service: ', err);
      }
    );
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
        mergeMap((result: any) => {
          return this.svc.getEntries();
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
      type: SkyConfirmType.YesCancel
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
    }
  }
}
