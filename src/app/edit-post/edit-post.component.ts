import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent   {

 @Input() review:any;
 @Output() saveEmitter: EventEmitter<any> = new EventEmitter<any>();
 @Output() cancelEmitter: EventEmitter<any> = new EventEmitter<any>();

  // list to repeat on 
  thingsToRate:String[];

  ngOnInit() {
    this.review = {};
  }

  constructor() {
    this.thingsToRate = ['Burger','Benny','Bloody','Beers'];
  }

  dropdownReceiver(clickObj : any){
    if(clickObj.item === 'Burger') this.review.burger = clickObj.rating;
    if(clickObj.item === 'Bloody') this.review.bloody = clickObj.rating;
    if(clickObj.item === 'Benny')  this.review.benny  = clickObj.rating;
    if(clickObj.item === 'Beers')  this.review.beers  = clickObj.rating;
  }

  getRatingFor(item:String){
    if(item === 'Burger') return this.review ? this.review.burger : null;
    if(item === 'Bloody') return this.review ? this.review.bloody : null;
    if(item === 'Benny')  return this.review ? this.review.benny  : null;
    if(item === 'Beers')  return this.review ? this.review.beers  : null;
  }

  //Utility Methods Below
  saveHandler(){
    this.saveEmitter.emit(this.review);
  }
  cancelHandler(){
    this.cancelEmitter.emit();
  }

}
