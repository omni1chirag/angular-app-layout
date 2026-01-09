import { Component, HostBinding, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenuItem, TooltipOptions } from 'primeng/api';
import { filter, Subscription } from 'rxjs';
import { LayoutService } from '@service/layout.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-menuitem',
    standalone: true,
    imports: [CommonModule, RouterModule, RippleModule, TooltipModule],
    templateUrl: './menuitem.component.html',
    animations: [
        trigger('children', [
            state('collapsed', style({
                height: '0'
            })),
            state('expanded', style({
                height: '*'
            })),
            transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ],
    providers: [LayoutService]
})
export class MenuitemComponent implements OnInit, OnDestroy {

    public readonly router = inject(Router);
    private readonly layoutService = inject(LayoutService);

    @Input() item!: MenuItem;

    @Input() index!: number;

    @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;

    @Input() parentKey!: string;

    active = false;

    menuSourceSubscription: Subscription;

    menuResetSubscription: Subscription;

    key = '';

    tooltipOptions: TooltipOptions = {
        tooltipPosition: 'top',
        appendTo: 'body'
    };

    constructor(
    ) {
        this.menuSourceSubscription = this.layoutService.menuSource$.subscribe((value) => {
            Promise.resolve(null).then(() => {
                if (value.routeEvent) {
                    this.active = value.key === this.key || value.key.startsWith(this.key + '-');
                } else if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
                    this.active = false;
                }
            });
        });

        this.menuResetSubscription = this.layoutService.resetSource$.subscribe(() => {
            this.active = false;
        });

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            if (this.item.routerLink) {
                this.updateActiveStateFromRoute();
            }
        });
    }

    ngOnInit(): void {
        this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);

        if (this.item.routerLink) {
            this.updateActiveStateFromRoute();
        }
    }

    updateActiveStateFromRoute(): void {
        const activeRoute = this.router.isActive(this.item.routerLink[0], { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' });

        if (activeRoute) {
            this.layoutService.onMenuStateChange({ key: this.key, routeEvent: true });
        }
    }

    itemClick(event: Event): void {
        // avoid processing disabled items
        if (this.item.disabled) {
            event.preventDefault();
            return;
        }

        // execute command
        if (this.item.command) {
            this.item.command({ originalEvent: event, item: this.item });
        }

        // toggle active state
        if (this.item.items) {
            this.active = !this.active;
        }

        this.layoutService.onMenuStateChange({ key: this.key });
    }

    get submenuAnimation(): string {
        let state: 'expanded' | 'collapsed';
        if (this.root || this.active) {
            state = 'expanded';
        } else {
            state = 'collapsed';
        }
        return state;
    }

    @HostBinding('class.active-menuitem')
    get activeClass(): boolean {
        return this.active && !this.root;
    }

    ngOnDestroy(): void {
        if (this.menuSourceSubscription) {
            this.menuSourceSubscription.unsubscribe();
        }

        if (this.menuResetSubscription) {
            this.menuResetSubscription.unsubscribe();
        }
    }
}
