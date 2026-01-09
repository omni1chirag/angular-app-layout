import { AfterViewInit, ChangeDetectorRef, Directive, inject, NgZone } from "@angular/core";
import { MultiSelect } from "primeng/multiselect";
import { Select } from "primeng/select";
import { take } from "rxjs";

@Directive({
  selector: `p-multiselect, p-select`,
  standalone: true
})
export class SelectConfigDirective implements AfterViewInit {

  private readonly multiSelect = inject(MultiSelect, { optional: true, host: true });
  private readonly select = inject(Select, { optional: true, host: true });
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      if (this.multiSelect) {
        this.multiSelect.display = "chip";
        this.multiSelect.maxSelectedLabels = 10;
        this.multiSelect.resetFilterOnHide = true;
        this.cdr.detectChanges();
      }

      if (this.select) {
        this.select.resetFilterOnHide = true;
        this.cdr.detectChanges();
      }
    });
  }
}
