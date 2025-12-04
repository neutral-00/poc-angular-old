import { Component } from '@angular/core';
import { ApiService } from '../../service/api';

@Component({
  selector: 'app-demo-api',
  standalone: false,
  templateUrl: './demo-api.html',
  styleUrl: './demo-api.scss',
})
export class DemoApi {

  response: any;

  constructor(private apiService: ApiService) { }

  callValidApi() {
    this.apiService.getPosts().subscribe(data => this.response = data);
  }

  callInvalidApi() {
    this.apiService.getInvalid().subscribe({
      next: (data) => { this.response = data },
      error: (error) => { console.log('handled by interceptor') }
    });
  }
}
