import { Component } from '@angular/core';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent {

  // playing 1, offline 2, online 3
  listValues: {name: string, status: number, pic: string}[] = [
    {name: 'mnies', status: 2, pic: 'https://cdn.intra.42.fr/users/f39c95b440a7892a13fd0815fdc4ed78/mnies.jpg'},
    {name: 'dmontema', status: 3, pic: 'https://cdn.intra.42.fr/users/90e5daf132867874fda0b6d5c6227f08/dmontema.jpg'},
    {name: 'lrosch', status: 1, pic: 'https://cdn.intra.42.fr/users/cd93c8ee7920347eedfeafb9f8b7b294/lrosch.jpg'},
    {name: 'mjeyavat', status: 1, pic: 'https://cdn.intra.42.fr/users/70fdc8bacb35cb5b1f666383b0eee5ff/mjeyavat.JPG'}
  ];
  
}
