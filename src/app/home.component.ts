import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DailyBlogComponent } from './blog/daily-blog.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [DailyBlogComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle("Bowl Pick'em - Home");
  }
}
