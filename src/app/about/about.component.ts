import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

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
  constructor(private titleService: Title) {}
  public ngOnInit() {
    this.titleService.setTitle("Bowl Pick'em - About");
  }
}
