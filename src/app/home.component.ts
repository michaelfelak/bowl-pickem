import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DailyBlogComponent } from './blog/daily-blog.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [DailyBlogComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private titleService: Title) {}
  public ngOnInit() {
    this.titleService.setTitle("Bowl Pick'em - Home");
  }
}
