import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PageVisitService } from '../shared/services/page-visit.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  public team: { name: string; email: string }[] = [
    {
      name: 'Michael Felak',
      email: '',
    },
    {
      name: 'John Felak',
      email: '',
    },
  ];
  
  constructor(
    private titleService: Title,
    private pageVisitService: PageVisitService,
    private authService: AuthService
  ) {}
  
  public ngOnInit() {
    this.titleService.setTitle("Bowl Pick'em - About");
    this.logPageVisit();
  }

  private logPageVisit() {
    const userId = this.authService.getCurrentUserId();
    this.pageVisitService.addPageVisit({
      page: 'About',
      action: 'view',
      action_date: new Date(),
      user_id: userId ? parseInt(userId, 10) : undefined,
    }).subscribe({
      error: (err) => console.error('Error logging page visit:', err),
    });
  }
}
