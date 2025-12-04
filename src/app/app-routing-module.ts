import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoApi } from './component/demo-api/demo-api';

const routes: Routes = [
  { path: 'demo', component: DemoApi }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
