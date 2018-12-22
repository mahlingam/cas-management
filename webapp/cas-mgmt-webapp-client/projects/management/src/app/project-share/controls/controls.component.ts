import {Component, OnInit, Output, EventEmitter, ViewChild, Input} from '@angular/core';
import {UserService, Commit, AppConfigService, SpinnerService} from 'mgmt-lib';
import {ControlsService} from './controls.service';
import {Location} from '@angular/common';
import {PublishComponent} from '../publish/publish.component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {CommitComponent} from '../commit/commit.component';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})

export class ControlsComponent implements OnInit {

  @Input()
  showEdit: boolean;

  @Input()
  showRefresh: boolean;

  @Input()
  showOpen: boolean;

  @Input()
  showVersionControl = true;

  @Input()
  saveEnabled = false;

  @Input()
  showSpinner = false;

  @Input()
  showBack = true;

  @Input()
  showEditorOptions = false;

  @ViewChild('publishModal')
  submitComp: PublishComponent;

  @Output()
  save: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  openFile: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  refresh: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  reset: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  editorOptions: EventEmitter<void> = new EventEmitter<void>();

  constructor(public service: ControlsService,
              public userService: UserService,
              public appService: AppConfigService,
              public dialog: MatDialog,
              public snackBar: MatSnackBar,
              public location: Location,
              public spinner: SpinnerService) { }

  ngOnInit() {
    if (this.appService.config.versionControl && this.showVersionControl) {
      this.service.gitStatus();
    }
  }

  goBack() {
    this.location.back();
  }

  openModalCommit() {
      const dialogRef = this.dialog.open(CommitComponent, {
          data: [this.service.status, this.userService.user.administrator],
          width: '500px',
          position: {top: '100px'}
      });
      dialogRef.afterClosed().subscribe(result => {
          if (result) {
              this.commit(result);
          }
      });
  }

  commit(msg: string) {
    if (msg === 'CANCEL') {
      return;
    } else if (!this.userService.user.administrator) {
      this.submit(msg);
    } else {
      if (msg !== null && msg !== '') {
        this.spinner.start('Committng changes');
        this.service.commit(msg)
          .pipe(finalize(() => this.spinner.stop()))
          .subscribe(
            () => this.handleCommit(),
            () => this.handleNotCommitted()
          );
      }
    }
  }

  handleCommit() {
    this.service.gitStatus();
    this.snackBar
      .open('Service changes successfully committed.',
        'Dismiss',
        {duration: 5000}
      );
    this.refresh.emit();
  }

  handleNotCommitted() {
    this.snackBar
      .open('A problem has occurred while trying to commit service changes. Please check system logs for additional information.',
        'Dismiss',
        {duration: 5000}
      );
  }

  openModalPublish() {
      const dialogRef = this.dialog.open(PublishComponent, {
          width: '500px',
          position: {top: '100px'}
      });
      dialogRef.afterClosed().subscribe(result => {
          if (result) {
              this.publish(result);
          }
      });
  }

  publish(commits: Commit[]) {
    if (commits.length > 0 ) {
      this.spinner.start('Publishing');
      this.service.publish()
        .pipe(finalize(() => this.spinner.stop()))
        .subscribe(
          () => this.handlePublish(),
          () => this.handleNotPublished()
        );
    }
  }

  handlePublish() {
    this.service.gitStatus();
    this.snackBar
      .open('Service changes successfully published.',
        'Dismiss',
        {duration: 5000}
      );
    this.refresh.emit();
  }

  handleNotPublished() {
    this.snackBar
      .open('A problem has occurred while trying to publish services to CAS nodes.  Please check system logs for additional information.',
        'Dismiss',
        {duration: 5000}
      );
  }

  callSubmit() {
    this.openModalCommit();
  }

  submit(msg: string) {
    this.spinner.start('Submitting request');
    this.service.submit(msg)
      .pipe(finalize(() => this.spinner.stop()))
      .subscribe(
        () => this.handleSubmit(),
        () => this.handleNotSubmitted()
      );
  }

  handleSubmit() {
    this.service.gitStatus();
    this.snackBar
      .open('Your commit has been submitted for review',
        'Dismiss',
        {duration: 5000}
      );
    this.refresh.emit();
  }

  handleNotSubmitted() {
    this.snackBar
      .open('Something went wrong and your commit was not able to be submitted',
        'Dismiss',
        {duration: 5000}
      );
  }

  isAdmin(): boolean {
    return this.appService.config.versionControl &&
           this.userService.user &&
           this.userService.user.administrator;
  }

  hasChanges(): boolean {
    return this.appService.config.versionControl &&
           this.service.status &&
           this.service.status.hasChanges;
  }


  unpublished (): boolean {
    return this.appService.config.versionControl &&
           this.service.status &&
           this.service.status.unpublished;
  }
}
