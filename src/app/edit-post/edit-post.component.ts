import { Component, OnInit, Input } from '@angular/core';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent implements OnInit {

  @Input() review:any;

  constructor() {
   }

  ngOnInit() {
    
  }


}
