import { Component, OnInit } from '@angular/core';
import { BowlService } from '../shared/services/bowl.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  source: Array<any> = [
    {
      name: 'Brad',
      job: 'programmer',
      age: '40'
    },
    {
      name: 'John',
      job: 'athlete',
      age: '22'
    },
    {
      name: 'Eve',
      job: 'artist',
      age: '25'
    }
  ];
}
