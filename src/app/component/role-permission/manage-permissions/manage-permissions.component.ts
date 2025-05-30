import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Listbox, ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeModule } from 'primeng/tree';
import { auditTime, fromEvent, Subscription } from 'rxjs';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { NotificationService } from '@service/notification.service';
import { RolePermissionService } from '@service/role-permission.service';

@Component({
  selector: 'app-manage-permissions',
  imports: [ToolbarModule,
    FormsModule,
    ButtonModule,
    DividerModule,
    CommonModule,
    SelectModule,
    PageHeaderDirective,
    DynamicDialogModule,
    ListboxModule,
    MenuModule,
    ConfirmDialogModule,
    TagModule,
    TreeModule,
  ],
  templateUrl: './manage-permissions.component.html',
  providers: [DialogService, ConfirmationService],
  styleUrl: './manage-permissions.component.scss'
})
export class ManagePermissionsComponent implements OnInit, AfterViewInit, OnDestroy {

  ref: DynamicDialogRef | undefined;
  private resizeSub: Subscription;
  sourcePermissions: TreeNode[] = [];
  selectedPermissions: TreeNode[] = [];
  selectedRole: any | undefined = undefined;
  currentRole: any;
  roles: any[] = [];
  isBrowser = false;
  isPermissionLoading = false;
  isCallInitiated = false;
  optionsItems = [{ label: 'status', icon: 'pi pi-times-circle' }]
  private readonly SELECTORS = {
    MAIN_CONTAINER: 'div.layout-main-container',
    PAGE_HEADER: '[pageHeader]',
    CARD_PADDING: 'div.card',
    LIST_HEADER: '.roleGrid div.p-listbox-header'
  };

  @ViewChild('roleListBox') roleListBox: Listbox;

  constructor(public dialogService: DialogService, private rolePermissionService: RolePermissionService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: object,
    private confirmationService: ConfirmationService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.loadPermissions();
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.resizeSub = fromEvent(window, 'resize')
        .pipe(auditTime(100)).subscribe(() => this.onResize());
      this.setHeight();
    }
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
    this.resizeSub?.unsubscribe()

  }

  async addRole() {
    const roleComponent = await import('../role-add-edit/role-add-edit.component').then(m => m.RoleAddEditComponent)
    this.ref = this.dialogService.open(roleComponent, {
      header: 'Add Role',
      appendTo: 'body',
      closable: true,
      width: '40vw',
      modal: true,
    });
    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.loadRoles();
      }
    });
  }

  loadRoles(isPermissionLoad = false) {
    this.rolePermissionService.getRoles().subscribe((resp: any) => {
      this.roles = resp.data;
      this.selectedRole = this.roles[0].roleId;
      this.currentRole = this.selectedRole;
      if (isPermissionLoad) {
        this.loadRolePermission(this.currentRole);
      }
    })
  }

  loadPermissions() {
    this.rolePermissionService.getPermissions().subscribe((resp: any) => {
      this.sourcePermissions = resp.data;
      this.onResize();
      this.loadRoles(true);
    })
  }

  updateStatus(roleId, status) {
    const acceptSeelected = () => {
      this.rolePermissionService.updateRoleStatus(roleId, { status }).subscribe((resp: any) => {
        this.notificationService.showSuccess(resp.message);
        this.loadRoles();
      });
    }
    const msg = status == 1 ? 'Activate' : 'Deactivate'
    this.confirmationService.confirm({
      message: `Are you sure you want to ${msg} this role?`,
      header: 'Confirmation',
      icon: 'pi pi-info-circle',
      rejectButtonStyleClass: 'p-button-text',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        text: true,
      },
      acceptButtonProps: {
        label: 'Ok',
        text: true,
      },
      accept: acceptSeelected,
      key: 'role-delete-confirmation',
    });
  }

  savePermission() {
    if (!this.currentRole) {
      this.notificationService.showWarning("Please select role.")
      return;
    }

    const finalData = this.selectedPermissions.filter(item => item.leaf).map(item => item.key);
    if (finalData.length == 0) {
      this.notificationService.showWarning("Please select at least one permission.")
      return;
    }

    this.isCallInitiated = true;
    this.rolePermissionService.updateRolePermission(this.currentRole, { permissions: finalData }).subscribe({
      next: (resp: any) => {
        this.notificationService.showSuccess(resp.message);
        this.isCallInitiated = false;
      },
      error: (error) => {
        this.isCallInitiated = false;
      }
    });
  }

  roleChange($event) {
    this.roleListBox?.updateModel(null);
    if (this.currentRole == $event.option.roleId) {
      return;
    }
    this.currentRole = $event.option.roleId;
    this.selectedPermissions = [];
    this.loadRolePermission(this.currentRole);
  }

  loadRolePermission(roleId) {
    this.isPermissionLoading = true;
    this.resetTree(this.sourcePermissions);
    this.rolePermissionService.getRolePermission(roleId).subscribe(
      {
        next: (resp: any) => {
          const permissions = resp.data?.permissions || [];
          if (permissions.length == 0) {
            this.selectedPermissions = [];
            this.isPermissionLoading = false;
            return;
          }
          const allowedKeys = new Set<string>(permissions);
          this.selectedPermissions = this.filterPermissions(this.sourcePermissions, allowedKeys);
          this.updateTreeSelection(this.sourcePermissions, new Set(this.selectedPermissions.map(p => p.key)));
          this.isPermissionLoading = false;
        },
        error: (error: any) => {
          this.isPermissionLoading = false;
        }
      });
  }

  private filterPermissions(nodes: TreeNode[], allowedKeys: Set<string>, parent?: TreeNode): TreeNode[] {
    const result: TreeNode[] = [];
    nodes.forEach(node => {
      if (allowedKeys.has(node.key)) {
        result.push({ ...node, parent: parent ? { ...parent } : null });
      }
      if (node.children?.length) {
        result.push(...this.filterPermissions(node.children, allowedKeys, node));
      }
    });
    return result;
  }

  private resetTree(tree: TreeNode[]) {
    tree.forEach(node => {
      node.partialSelected = false;
      node.expanded = true;
      if (node.children) {
        this.resetTree(node.children)
      }
    });
  }

  private updateTreeSelection(tree: TreeNode[], selectedKeys: Set<string>) {
    tree.forEach(node => {
      if (node.children?.length) {
        this.updateTreeSelection(node.children, selectedKeys);

        const leafKeys = this.getLeafKeys(node.children);
        const selectedCount = leafKeys.filter(key => selectedKeys.has(key)).length;
        const totalCount = leafKeys.length;

        node.partialSelected = selectedCount > 0 && selectedCount < totalCount;

        if (selectedCount === totalCount && !selectedKeys.has(node.key)) {
          this.selectedPermissions.push({ ...node });
          selectedKeys.add(node.key);
        }
      }
    });
  }

  private getLeafKeys(nodes: TreeNode[]): string[] {
    return nodes.flatMap(node =>
      node.leaf ? [node.key] : (node.children && node.children.length > 0 ? this.getLeafKeys(node.children) : [])
    );
  }

  async onResize(): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }

    await new Promise(requestAnimationFrame);

    const listBoxes = Array.from(
      document.getElementsByClassName('p-listbox-list-container')
    ) as HTMLElement[];
    const trees = Array.from(
      document.getElementsByClassName('p-tree-root')
    ) as HTMLElement[];

    if (!listBoxes.length && !trees.length) {
      return false;
    }

    const dynamicHeight = window.innerHeight - this.calculateHeightReduction() - 20;

    listBoxes.forEach(el => {
      el.style.height = `${dynamicHeight}px`;
      el.style.maxHeight = `${dynamicHeight}px`;
    });

    const treeHeight = dynamicHeight - 3;
    trees.forEach(el => {
      el.style.height = `${treeHeight}px`;
      el.style.maxHeight = `${treeHeight}px`;
    });

    return true;
  }

  private calculateHeightReduction(): number {
    return Object.values(this.SELECTORS).reduce((sum, selector) => {
      let reduction = 0;
      document.querySelectorAll(selector).forEach((element: HTMLElement) => {
        if (element) {
          const styles = getComputedStyle(element);
          switch (selector) {
            case this.SELECTORS.MAIN_CONTAINER:
              reduction = reduction + parseFloat(styles.paddingTop);
              break;
            case this.SELECTORS.LIST_HEADER:
              reduction = reduction + element.offsetHeight + parseFloat(styles.paddingTop);
              break;
            case this.SELECTORS.PAGE_HEADER:
              reduction = reduction + element.offsetHeight + parseFloat(styles.marginBottom);
              break;
            case this.SELECTORS.CARD_PADDING:
              reduction = reduction + parseFloat(styles.paddingBottom) + parseFloat(styles.paddingTop);
              break;
            default:
              reduction = reduction + element.offsetHeight;
          }
        };
      })
      return sum + (Number.isFinite(reduction) ? reduction : 0);
    }, 0);
  }

  private async setHeight(called = 1): Promise<void> {
    if (!this.isBrowser) return;
    const isloaded = await this.onResize();
    if (!isloaded && called <= 3) {
      await new Promise(resolve => setTimeout(resolve, (100 * called)));
      this.setHeight(called++);
    }
  }
}
