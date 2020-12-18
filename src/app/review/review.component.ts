import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {

  @Input() review:any;
  @Input() isCurrentUser:Boolean;
  @Output() deletedIdEmitter = new EventEmitter<string>();

  toEdit:any;

  showEditPost:boolean = false;
  showDeleteConfirm:boolean = false;
  showScreen:boolean = false;

  constructor() { }
  ngOnInit() { }

  showEditDelete(review: any){
    review.showEditDelete = !review.showEditDelete;
  }

  editModeToggle( ){
    this.toEdit = this.review;
    this.showEditPost = true;
    this.showScreen = true;
  }

  openDeleteConfirm(){
    this.showDeleteConfirm = true;
    this.showScreen = true;
  }

  cancelHandler(){ // called by cancel button in delete modal and edit modal, since they both need to do the same thing
    this.showDeleteConfirm = false;
    this.showScreen = false;
    this.showEditPost = false;
  }

  saveHandler( review:any ){

    let toUpdate = firebase.firestore().collection('reviews').doc(review.id);
    toUpdate.update({
      words:  review.words,
      burger: review.burger,
      bloody: review.bloody,
      beers: review.beers,
      benny: review.benny
    })
    .then(() => {
      this.cancelHandler();
      console.log("Document successfully updated!");
    })
    .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
  }

  deleteHandler(){

    firebase.firestore().collection('reviews').doc(this.review.id).delete()
    .then(() => {
      console.log('Document successfully deleted!');
      this.deletedIdEmitter.emit(this.review.id);
      this.cancelHandler();
    })
    .catch(function(error) {
      // The document probably doesn't exist.
      console.error('Error deleting document: ', error);
    });


  }

}
