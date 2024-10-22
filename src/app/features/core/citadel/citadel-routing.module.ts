import { NgModule } from '@angular/core';
import { CitadelComponent } from './citadel/citadel.component';
import { Routes, RouterModule } from '@angular/router';
import { ALL_APP_PATHS } from '../../../app.all-paths.module';

// 'Task Cleanup';
// 'Import/Export Tasks';
// 'Utility Tools';
// 'Purifier';
// 'Portal';
const routes: Routes = [
  {
    path: '',
    component: CitadelComponent,
    children: [
      // ALL_APP_PATHS['parent'],
      // clean tasks, similar... completed...
      // import export
    ],
  },
];

export const citadelChildren =
  routes[0].children
    ?.map((c) => c.path)
    .filter((path): path is string => !!path) || [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CitadelRoutingModule {}
