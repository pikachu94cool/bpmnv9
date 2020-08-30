import { Component, OnInit, ElementRef, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})

export class OverlayComponent implements OnInit {

  // tslint:disable-next-line: variable-name
  private _name = '';

  @Input()
  get name(): string { return this._name; }
  set name(name: string) {
    this._name = name;
    console.log(name);
  }

  // valueChange: EventEmitter<any> = new EventEmitter();

  public nativeElement = null;

   constructor(element: ElementRef) {
      // console.log(element.nativeElement);
      this.nativeElement = element.nativeElement;
   }

  ngOnInit(): void {
  }

  onClicked(): void {
    console.log('OverlayComponent onClicked', this.name);
  }

}
