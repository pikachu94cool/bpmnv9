import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.production.min.js';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js/lib/Modeler';
import propertiesProviderModule from 'bpmn-js/lib/Modeler';
import { importDiagram } from './rx';
import qaExtension from './qa.json';
// import emptyJson from './empty.json';

import customModule from 'bpmn-js-custom';
import resizeTask from 'bpmn-js-task-resize/lib';

import { throwError } from 'rxjs';
import {
  AfterContentInit,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  SimpleChanges,
  EventEmitter
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { OverlayComponent } from '../overlay/overlay.component';



declare var jquery: any; // 這邊用 var
declare let $: any; // 當然 let 也可以



@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy {
  private bpmnJS: BpmnJS;

  @ViewChild('diagramDom') private el: ElementRef;
  // tslint:disable-next-line: variable-name
  @ViewChild('properties') private el_properties: ElementRef;

  @ViewChild('inputXMLFile') private el_inputXMLFile: ElementRef;

  // @ViewChild('myoverlay') private el_myoverlay: OverlayComponent;

  // @ViewChild('testDiv') private el_testDiv: ElementRef;

  @ViewChild("templateContainer", { read: ViewContainerRef }) templateContainer;


  @Output() private importDone: EventEmitter<any> = new EventEmitter();

  @Input() private url: string;

  // tslint:disable-next-line: variable-name
  _bpmnModeler: BpmnModeler;

  _tempOverlayId: string;

  _overlayString: string = 'overlay';
  _overlayComponent: OverlayComponent;

  constructor(private http: HttpClient, private window: Window
    ,         private resolver: ComponentFactoryResolver) {

    // this.bpmnJS = new BpmnJS();

    // this.bpmnJS.on('import.done', ({ error }) => {
    //   if (!error) {
    //     this.bpmnJS.get('canvas').zoom('fit-viewport');
    //   }
    // });

    // this.window.applicationCache;
    if (customModule.customRendererArg) {
      customModule.customRendererArg.loadFileEvent = this.onLoadFileClicked.bind(this);
      customModule.customRendererArg.saveFileEvent = this.onSaveFileClicked.bind(this);
      customModule.customRendererArg.clearEvent = this.onClearClicked.bind(this);
    }
    console.log(customModule.customRendererArg);
    // this.window.customPaletteArg = {};

  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit(): void {
    // console.log(this.el_myoverlay.nativeElement);
    // console.log(this.el_testDiv.nativeElement);
    console.log('ngAfterViewInit');
    console.log(this.el_inputXMLFile);
    this._bpmnModeler = new BpmnModeler({
      container: this.el.nativeElement,
      additionalModules: [
        // propertiesPanelModule,
        // propertiesProviderModule
        customModule,
        resizeTask, // 要加 taskResizingEnabled: true
      ],
      moddleExtensions: {
        qa: qaExtension
      },
      taskResizingEnabled: true,
      propertiesPanel: {
        // parent: '#properties'
        parent: this.el_properties.nativeElement,
      }
    });
    this.onClearClicked();
  }

  ngAfterContentInit(): void {
    // this.bpmnJS.attachTo(this.el.nativeElement);


    // console.log(this._bpmnModeler.importXML)
    // this.loadUrl(this.url);
    // this.loadUrl('assets/empty.bpmn');
  }

  ngOnChanges(changes: SimpleChanges) {
    // re-import whenever the url changes
    if (this._bpmnModeler && changes.url) {
      this.loadUrl(changes.url.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }

  onLoadFileClicked() {
    console.log('onLoadFileClicked');
    this.el_inputXMLFile.nativeElement.click();
  }

  onSaveFileClicked() {
    const self = this;
    console.log('onSaveFileClicked');
    if (this._bpmnModeler !== null) {
      this._bpmnModeler.saveXML({ format: true },  (err, xml) => {
        if (err) {
          console.log(err);
        } else {
          self.writeContents(xml, 'save.xml', 'text/plain;charset=utf-8');
        }
      });
    }
  }

  onClearClicked() {
    console.log('onClearClicked');
    const slef = this;
    const path = 'assets/empty.bpmn';
    // const path = 'assets/save_7.xml';
    this.http.get(path, { responseType: 'text' }).subscribe(data => {
      slef._bpmnModeler.importXML(data, (err, warnings) => {
      });
    });
  }

  writeContents(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  handleFileInput(files: FileList) {
    console.log(files);
    if (files.length) {
      this.loadXMLFile(files[0]);
    }
    // this.fileToUpload = files.item(0);
  }

  async loadXMLFile(file: File) {
    const self = this;
    if (file !== null) {
      const fileReader = new FileReader();
      const fileReaderPromise = new Promise(resolve => fileReader.onload = resolve);

      fileReader.readAsText(file);

      return fileReaderPromise.then(e => {
        const text = fileReader.result;
        console.log(text);
        self.importXMLFromText(text);
      });

      // const reader = new FileReader();

      // reader.onload = () => {
      //   const text = reader.result;
      //   console.log(text);
      //   // self.importXMLFromText(text);
      //   // importDiagram(self._bpmnModeler);
      // };
      // reader.onerror = () => {
      //   console.log('load error');
      // };
      // reader.readAsText(file);

    }
  }

  async importXMLFromText(text)  {

    if (this._bpmnModeler !== null) {
      this._bpmnModeler.importXML(text,  (err) => {
        if (err) {
          console.log(err);
          return;
        }
        this.setOverlay(this._bpmnModeler);
        this._bpmnModeler.get('canvas').zoom('fit-viewport');

      });
    }
  }

  setOverlay(bpmnModeler: BpmnModeler) {
    const overlays = bpmnModeler.get('overlays');
    const elementRegistry = bpmnModeler.get('elementRegistry');
    const taskName = 'ironman_0';
    const shape = elementRegistry.get(taskName);
    if (shape) {
      const $overlayHtml =
        $('<div class="highlight-overlay">')
          .css({
            width: shape.width,
            height: shape.height
          });

      overlays.add(taskName, {
        position: {
          top: -0,
          left: -0
        },
        html: $overlayHtml
      });


      // const Id = overlays.add(taskName, {
      //   position: {
      //     bottom: 0,
      //     right: 0
      //   },
      //   html: '<div class="diagram-note">picka 好棒棒?(我是overlays)</div>'
      // });
      // const Id = overlays.add(taskName, {
      //   position: {
      //     bottom: 0,
      //     right: 0
      //   },
      //   html: this.el_myoverlay.nativeElement ,
      // });


      const aOverlayComponent = this.createComponent();
      // aOverlayComponent.name = this._overlayString;
      const Id = overlays.add(taskName, {
        position: {
          bottom: 0,
          right: 0
        },
        html: aOverlayComponent.nativeElement,
      });
      this._overlayComponent = aOverlayComponent;
      console.log(Id);
      this._tempOverlayId = Id;
    }
  }

  createComponent(): OverlayComponent {

    this.templateContainer.clear();

    const factory = this.resolver.resolveComponentFactory(OverlayComponent);

    const componentRef = this.templateContainer.createComponent(factory);
    const aOverlayComponent = componentRef.instance as OverlayComponent;

    aOverlayComponent.name = this._overlayString;

    // componentRef.someData = { name: this._overlayString }; // send data to input
    // componentRef.changeDetectorRef.detectChanges();
    // console.log(aOverlayComponent.nativeElement);
    return aOverlayComponent;
    // componentRef.instance.message = message;
  }

  onTestClicked(): void {
    console.log('onTestClicked');
    this._overlayString = 'overlay t=' + new Date().getSeconds() + ':' + new Date().getMilliseconds();
    this._overlayComponent.name = this._overlayString;
    // if (this._bpmnModeler !== null) {
    //   this.updateOverlay(this._bpmnModeler, 'picka 好棒棒 ' + new Date().getSeconds());
    // }
  }

  updateOverlay(bpmnModeler: BpmnModeler, message: string) {
    const overlays = bpmnModeler.get('overlays');
    const elementRegistry = bpmnModeler.get('elementRegistry');
    const taskName = 'ironman_0';
    const shape = elementRegistry.get(taskName);
    if (shape) {
      overlays.remove(this._tempOverlayId);
      console.log(overlays.update);
    ;
      // const $overlayHtml =
      //   $('<div class="highlight-overlay">')
      //     .css({
      //       width: shape.width,
      //       height: shape.height
      //     });

      // overlays.add(taskName, {
      //   position: {
      //     top: -0,
      //     left: -0
      //   },
      //   html: $overlayHtml
      // });


      const Id = overlays.add(taskName, {
        position: {
          bottom: 0,
          right: 0
        },
        html: '<div class="diagram-note">' + message + '</div>',
      });
      this._tempOverlayId = Id;
    }
  }


  /**
   * Load diagram from URL and emit completion event
   */
  loadUrl(url: string) {
    const self = this;
    return (
      this.http.get(url, { responseType: 'text' }).pipe(
        catchError(err => throwError(err)),
        importDiagram(self._bpmnModeler )
      ).subscribe(
        (warnings) => {
          this.importDone.emit({
            type: 'success',
            warnings
          });
        },
        (err) => {
          this.importDone.emit({
            type: 'error',
            error: err
          });
        }
      )
    );

  //   return (
  //     this.http.get(url, { responseType: 'text' }).pipe(
  //       catchError(err => throwError(err)),
  //       importDiagram(this.bpmnJS)
  //     ).subscribe(
  //       (warnings) => {
  //         this.importDone.emit({
  //           type: 'success',
  //           warnings
  //         });
  //       },
  //       (err) => {
  //         this.importDone.emit({
  //           type: 'error',
  //           error: err
  //         });
  //       }
  //     )
  //   );
  }
}



/**
 * You may include a different variant of BpmnJS:
 *
 * bpmn-viewer  - displays BPMN diagrams without the ability
 *                to navigate them
 * bpmn-modeler - bootstraps a full-fledged BPMN editor
 */



