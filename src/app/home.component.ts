import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DailyBlogComponent } from './blog/daily-blog.component';
import { PageVisitService } from './shared/services/page-visit.service';
import { AuthService } from './shared/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [DailyBlogComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private titleService: Title,
    private pageVisitService: PageVisitService,
    private authService: AuthService
  ) {
    this.titleService.setTitle("Bowl Pick'em - Home");
  }

  public ngOnInit() {
    this.logPageVisit();
  }

  private logPageVisit() {
    const userId = this.authService.getCurrentUserId();
    this.pageVisitService.addPageVisit({
      page: 'Home',
      action: 'view',
      action_date: new Date(),
      user_id: userId ? parseInt(userId, 10) : undefined,
    }).subscribe({
      error: (err) => console.error('Error logging page visit:', err),
    });
  }
}
