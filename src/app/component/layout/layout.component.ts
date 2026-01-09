import { Component, inject, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '@component/layout/sidebar/sidebar.component';
import { NavbarComponent } from '@component/layout/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { LayoutService } from '@service/layout.service';
import { UserMenuComponent } from "@component/layout/user-menu/user-menu.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, RouterModule, UserMenuComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  private readonly renderer = inject(Renderer2);
  private readonly router = inject(Router);

  overlayMenuOpenSubscription: Subscription;

  menuOutsideClickListener;

  @ViewChild(UserMenuComponent) userMenu!: UserMenuComponent;

  constructor() {
    this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
          if (this.isOutsideClicked(event)) {
            this.hideMenu();
          }
        });
      }

      if (this.layoutService.layoutState().staticMenuMobileActive) {
        this.blockBodyScroll();
      }
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.hideMenu();
    });
  }

  isOutsideClicked(event: MouseEvent): boolean {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');
    const eventTarget = event.target as Node;

    return !(sidebarEl?.isSameNode(eventTarget) || sidebarEl?.contains(eventTarget) || topbarEl?.isSameNode(eventTarget) || topbarEl?.contains(eventTarget));
  }

  hideMenu(): void {
    this.layoutService.layoutState.update((prev) => ({ ...prev, overlayMenuActive: false, staticMenuMobileActive: false, menuHoverActive: false }));
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (typeof document !== 'undefined') {
      if (document.body.classList) {
        document.body.classList.remove('blocked-scroll');
      } else {
        document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
    }
  }

  get containerClass(): Record<string, boolean> {
    return {
      'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
      'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
      'layout-static-inactive': this.layoutService.layoutState().staticMenuDesktopInactive && this.layoutService.layoutConfig().menuMode === 'static',
      'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
    };
  }

  ngOnDestroy(): void {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }
}

