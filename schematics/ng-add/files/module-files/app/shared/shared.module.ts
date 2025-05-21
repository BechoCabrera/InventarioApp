import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { MaterialExtensionsModule } from '../material-extensions.module';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { NgProgressbar } from 'ngx-progressbar';
import { NgProgressRouter } from 'ngx-progressbar/router';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ErrorCodeComponent } from '@shared/components/error-code/error-code.component';

import { ToObservablePipe } from '@shared/pipes/to-observable.pipe';
import { SafeUrlPipe } from '@shared/pipes/safe-url.pipe';
import { NgModule } from '@angular/core';
import { DisableControlDirective } from '@shared/directives/disable-control.directive';




const MODULES: any[] = [
  CommonModule,
  RouterModule,
  ReactiveFormsModule,
  FormsModule,
  MaterialModule,
  MaterialExtensionsModule,
  FormlyModule,
  FormlyMaterialModule,
  NgxPermissionsModule,
  ToastrModule,
  TranslateModule,
  NgProgressbar,
  NgProgressRouter,
];
const COMPONENTS: any[] = [BreadcrumbComponent, PageHeaderComponent, ErrorCodeComponent];
const DIRECTIVES: any[] = [DisableControlDirective];
const PIPES: any[] = [SafeUrlPipe, ToObservablePipe];

@NgModule({
  imports: [...MODULES, ...COMPONENTS, ...DIRECTIVES, ...PIPES],
  exports: [...MODULES, ...COMPONENTS, ...DIRECTIVES, ...PIPES],
})
export class SharedModule {}
