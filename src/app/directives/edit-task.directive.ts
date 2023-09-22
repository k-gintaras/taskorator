import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appEditTask]',
})
export class EditTaskDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
