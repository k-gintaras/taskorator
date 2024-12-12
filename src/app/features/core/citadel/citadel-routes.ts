import { Routes } from '@angular/router';
import { CitadelComponent } from './citadel/citadel.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { TemplateHandlerComponent } from './template/template-handler/template-handler.component';
import { AppRouteMap } from '../../../app.routes-models';

export const routes: Routes = [
  {
    path: '',
    component: CitadelComponent,
    children: [
      { path: '', redirectTo: 'importExport', pathMatch: 'full' },
      { path: 'importExport', component: ImportExportComponent },
      { path: 'template', component: TemplateHandlerComponent },
    ],
  },
];

export const citadelRouteMetadata: AppRouteMap = {
  importExport: {
    title: 'Import/Export Tasks',
    icon: 'upload', // Replace with the appropriate icon
    description: 'Manage task imports and exports.',
    altName: '',
  },
  template: {
    title: 'Template Manager',
    icon: 'template', // Replace with the appropriate icon
    description: 'Create and manage task templates.',
    altName: '',
  },
};
export const citadelChildPaths =
  routes[0].children?.map((child) => child.path || '') || [];
export default routes;
