import { Component, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'mat-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.scss']
})
export class FileuploadComponent {
  @Input() mode;
  @Input() names;
  @Input() url;
  @Input() method;
  @Input() multiple = false;
  @Input() disabled;
  @Input() accept;
  @Input() maxFileSize;
  @Input() auto = true;
  @Input() withCredentials;
  @Input() invalidFileSizeMessageSummary;
  @Input() invalidFileSizeMessageDetail;
  @Input() invalidFileTypeMessageSummary;
  @Input() invalidFileTypeMessageDetail;
  @Input() previewWidth;
  @Input() chooseLabel = 'Choose';
  @Input() uploadLabel = 'Upload';
  @Input() cancelLabel = 'Cancel';
  @Input() customUpload;
  @Input() showUploadButton;
  @Input() showCancelButton;

  @Input() dataUriPrefix;
  @Input() deleteButtonLabel;
  @Input() deleteButtonIcon = 'close';
  @Input() showUploadInfo;

  @Input() files: File[] = [];

  @Output() getFiles = new EventEmitter();

  @ViewChild('fileUpload', {static: false}) fileUpload: ElementRef;

  inputFileName: string;

  constructor() { }

  onClick(event) {
    if (this.fileUpload) {
      this.fileUpload.nativeElement.click();
    }
  }

  onInput(event) { }

  onFileSelected(event) {
      const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
      const file = files[0];

      if (file) {

        this.files.push(file);

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {

          const imageData: any = reader.result;
          const filenameParam = file.name;
          const filemimeParam = file.type;
          const dataParam = imageData.split(',')[1];

          const imageFormat = {
            filename: filenameParam,
            filemime: filemimeParam,
            data: dataParam
          };
          this.getFiles.emit(imageFormat);
        };
      } else {
        this.getFiles.emit(null);
      }
  }

  removeFile(event, file) {
    let ix;
    const fileGet = this.files && -1 !== (ix = this.files.indexOf(file));
    if (fileGet) {
      this.files.splice(ix, 1);
      this.clearInputElement();
      this.getFiles.emit(null);
    }
  }

  validate(file: File) {
    for (const f of this.files) {
      if (f.name === file.name
        && f.lastModified === file.lastModified
        && f.size === f.size
        && f.type === f.type
      ) {
        return false;
      }
    }
    return true;
  }

  clearInputElement() {
    this.fileUpload.nativeElement.value = '';
  }

  isMultiple(): boolean {
    return this.multiple;
  }


}
