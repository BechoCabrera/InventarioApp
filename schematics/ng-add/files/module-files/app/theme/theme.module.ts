import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AdminLayoutComponent } from '@theme/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from '@theme/auth-layout/auth-layout.component';
import { SidebarComponent } from '@theme/sidebar/sidebar.component';
import { UserPanelComponent } from '@theme/sidebar/user-panel.component';
import { SidemenuComponent } from '@theme/sidemenu/sidemenu.component';
import { NavAccordionItemDirective } from '@theme/sidemenu/nav-accordion-item.directive';
import { NavAccordionDirective } from '@theme/sidemenu/nav-accordion.directive';
import { NavAccordionToggleDirective } from '@theme/sidemenu/nav-accordion-toggle.directive';
import { SidebarNoticeComponent } from '@theme/sidebar-notice/sidebar-notice.component';
import { TopmenuComponent } from '@theme/topmenu/topmenu.component';
import { TopmenuPanelComponent } from '@theme/topmenu/topmenu-panel.component';
import { HeaderComponent } from '@theme/header/header.component';
import { BrandingComponent } from '@theme/widgets/branding.component';
import { NotificationComponent } from '@theme/widgets/notification.component';
import { TranslateComponent } from '@theme/widgets/translate.component';
import { UserComponent } from '@theme/widgets/user.component';
// import { SharedModule } from '@shared/shared.module';

// import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
// import { AuthLayoutComponent } from './auth-layout/auth-layout.component';

// import { SidebarComponent } from './sidebar/sidebar.component';
// import { UserPanelComponent } from './sidebar/user-panel.component';
// import { SidemenuComponent } from './sidemenu/sidemenu.component';
// import { NavAccordionDirective } from './sidemenu/nav-accordion.directive';
// import { NavAccordionItemDirective } from './sidemenu/nav-accordion-item.directive';
// import { NavAccordionToggleDirective } from './sidemenu/nav-accordion-toggle.directive';
// import { SidebarNoticeComponent } from './sidebar-notice/sidebar-notice.component';

// import { TopmenuComponent } from './topmenu/topmenu.component';
// import { TopmenuPanelComponent } from './topmenu/topmenu-panel.component';

// import { HeaderComponent } from './header/header.component';

// import { BrandingComponent } from './widgets/branding.component';
// import { NotificationComponent } from './widgets/notification.component';
// import { TranslateComponent } from './widgets/translate.component';
// import { UserComponent } from './widgets/user.component';

@NgModule({
  imports: [
    SharedModule,
    AdminLayoutComponent,
    AuthLayoutComponent,
    SidebarComponent,
    UserPanelComponent,
    SidemenuComponent,
    NavAccordionDirective,
    NavAccordionItemDirective,
    NavAccordionToggleDirective,
    SidebarNoticeComponent,
    TopmenuComponent,
    TopmenuPanelComponent,
    HeaderComponent,
    BrandingComponent,
    NotificationComponent,
    TranslateComponent,
    UserComponent,
  ],
})
export class ThemeModule {}
