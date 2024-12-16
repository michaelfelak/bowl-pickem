import { Component, OnInit } from '@angular/core';
import { BlogEntry } from '../shared/services/bowl.model';
import { BowlService } from '../shared/services/bowl.service';
import * as dayjs from 'dayjs';
import { SettingsService } from '../shared/services/settings.service';
import { SkyRepeaterModule } from '@skyux/lists';

@Component({
  standalone: true,
  selector: 'app-daily-blog',
  imports: [SkyRepeaterModule],
  providers: [SettingsService],
  templateUrl: './daily-blog.component.html',
  styleUrls: ['./daily-blog.component.scss'],
})
export class DailyBlogComponent implements OnInit {
  public blogs: BlogEntry[] = [];

  constructor(private svc: BowlService, private settings: SettingsService) {}

  public ngOnInit() {
    this.svc
      .getBlogEntries(this.settings.currentYear)
      .subscribe((result: BlogEntry[]) => {
        if (result) {
          result.forEach((b: BlogEntry) => {
            this.blogs.push({
              Id: b.Id,
              // Body: b.Body.replace(/(?:\r\n|\r|\n)/g, '<br>'),
              Body: b.Body,
              CreatedDate: dayjs(b.CreatedDate).format('MM/DD/YYYY'),
              PostedBy: b.PostedBy,
              Title: b.Title,
            });
          });
        }
      });
  }
}
