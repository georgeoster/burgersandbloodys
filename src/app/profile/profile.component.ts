import { Component, OnInit, HostListener} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase/app';
// tslint:disable
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  toDelete: any;
  toEdit: any;
  showDeleteConfirm: boolean;
  showEditPost:boolean;
  thingsToRate: Array<String>;

  reviews: any[];
  userEmail: string;
  userDisplayName: string;
  userImage: string;
  showChangePicture: boolean;
  user;

  @HostListener('document:click', ['$event'])
    // documentClick(event: MouseEvent) {
    documentClick(event: any) {
      console.log(event);
        if ( !event.srcElement.attributes.class || event.srcElement.attributes.class.value !=  'verticalMenuIcon' ){
          for (let review of this.reviews){
            review.showEditDelete = false ;
          }
        }
    }

  constructor( private readonly route: ActivatedRoute, private readonly router: Router) {
    this.showDeleteConfirm = false;
    this.showEditPost = false;
    this.reviews = [];
    this.thingsToRate = ['Burger', 'Benny'];
  }

  dropdownReceiver(clickObj : any, review: any){
    if (clickObj.item === 'Burger') review.burger = clickObj.rating;
    if (clickObj.item === 'Bloody') review.bloody = clickObj.rating;
    if (clickObj.item === 'Benny') review.benny = clickObj.rating;
    if (clickObj.item === 'Beers') review.beers = clickObj.rating;
    console.log('the review is now:');
    console.log(review);
}

  loadUser(){
    this.reviews = [];

    firebase.firestore().collection('reviews').where('email', '==', this.userEmail)
    .get()
    .then(
      (querySnapshot) => {
        this.populateReviews(querySnapshot);
        this.getPictureFromAPI();
      }
    );
  }

  populateReviews(querySnapshot){

    this.reviews = [];
    querySnapshot.forEach( (doc) => {
      this.reviews.push(doc.data());
      this.reviews[this.reviews.length - 1].id = doc.id;
    });

    this.user = firebase.auth().currentUser;
    this.showChangePicture = false;

    if ( this.user && this.user.email === this.userEmail){
      this.showChangePicture = true;
    }

    this.reviews.sort(
      (a, b) => (a['reviewDate'] < b['reviewDate']) ? 1 : -1 );

    this.reviews.forEach( (r) => {r.editMode = true; r.showEditDelete = false; })
  }

   getPictureFromAPI(){

    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -33.866, lng: 151.196},
      zoom: 15
    });

    for (const review of this.reviews) {
      this.doAPICall(review, map);
    }
  }

  doAPICall(review, map) {
    let request = {
      placeId: review['placeId'],
      fields: ['photos']
    };
    new google.maps.places.PlacesService(map)
    .getDetails(request, (place, status) => {
      //console.log('status: '+status);
      if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT ){
        setTimeout( () => {this.doAPICall(review, map)} , 2000);
      }
      else
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        if (place['photos'] !== undefined ) review['image1'] = place['photos'][0].getUrl({'maxWidth': 300, 'maxHeight': 300});
        else review['image1'] =  ' ';
      }
    });
  }


  ngOnInit() {

    this.showChangePicture = false;

    this.route.params.subscribe(params => {
      this.userEmail = params['email']; //.get("email");
      this.userDisplayName = this.userEmail.substring(0, this.userEmail.lastIndexOf("@"));
      firebase.storage().ref().child( this.userEmail )
      .getDownloadURL()
      .then(
        (url) => {
          this.userImage = url;
          this.loadUser();
          }
        )
        .catch(
          () => {
            this.userImage = '';
            this.loadUser();
          }

        )
        ;
    });
  }

  updateUserImage(){

    firebase.storage().ref().child( this.userEmail )
    .getDownloadURL()
    .then( (url) => {
        this.userImage = url;
        this.user.updateProfile({photoURL: url, displayName: this.user.displayName})
        .then( () => {
            this.updateReviews();
            }
          );
        }
      );
    }

  updateReviews(){
    firebase.firestore().collection("reviews").where("email", "==", this.user.email )
    .get()
    .then(
      ( querySnapshot ) => {
        querySnapshot.forEach( (doc) => {
            firebase.firestore().collection("reviews").doc(doc.id).update({userImageURL : this.user.photoURL});
            }
          );
        }
      );
    }


  showEditDelete(review: any){
    review.showEditDelete = !review.showEditDelete;
  }

  editModeToggle( review: any, i: number ){

    this.toEdit = review;

    this.showEditPost = true;

    review.showEditDelete = false ;


    // review.editMode = !review.editMode;
    // review.showEditDelete = false;

    // if ( i !== -1 ){ // -1 is key for "do not mess with contenteditable"
    //   let myElement = document.getElementById('words' +i);
    //   console.log(myElement);
    //   myElement.setAttribute('contenteditable', 'true');
    //   myElement.classList.add("editwords");
    // }

  }

  cancelEditHandler(review: any, i: number){
    review.editMode = !review.editMode;
    review.showEditDelete = false;
    let myElement = document.getElementById('words' + i);
    myElement.removeAttribute('contenteditable');
    myElement.classList.remove('editwords');
    myElement.innerText = review.words;
  }

  saveHandler( review: any, i: number ){

    let myElement = document.getElementById('words' + i);
    console.log(myElement);
    let updatedWords =  myElement.innerText;
    myElement.removeAttribute('contenteditable');
    myElement.classList.remove('editwords');

    let toUpdate = firebase.firestore().collection('reviews').doc(review.id);
    toUpdate.update({
      words: updatedWords
    })
    .then(() => {
      this.editModeToggle( review, -1); // pass -1 as special key for "do not mess with contenteditable"
        console.log("Document successfully updated!");
    })
    .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });


  }

  deleteHandler( /*review:any*/ ){

    this.showDeleteConfirm = false;
    // firebase.firestore().collection('reviews').doc(review.id).delete()
    firebase.firestore().collection('reviews').doc(this.toDelete.id).delete()

    .then(() => {
      this.reviews = this.reviews.filter( r =>  r.id !== this.toDelete.id );
        console.log('Document successfully deleted!');
    })
    .catch(function(error) {
        // The document probably doesn't exist.
        console.error('Error deleting document: ', error);
    });


  }

  openDeleteConfirm(review: any){
    this.toDelete = review;
    this.showDeleteConfirm = true;
    review.showEditDelete = false ;
    console.log('this.toDelete:'); console.log(this.toDelete); console.log('this.showDeletedConfirm:'); console.log(this.showDeleteConfirm);
  }

  cancelHandler(){
    this.showDeleteConfirm = false;
    this.toDelete = null;
  }


  upload( imageInput: any ){

    if (this.user) { // if user is signed in

      const file: File = imageInput.files[0];
      const reader = new FileReader();

      reader.addEventListener('load',
        (event: any) => {

          firebase.storage().ref().child( this.userEmail )
          .put( file )
          .then(
            (snapshot) => {//file was successfully uploaded
              this.updateUserImage();
            }
          );
        }
      );
      reader.readAsDataURL(file);
    }// end if user is signed in
  } // end upload method

}
