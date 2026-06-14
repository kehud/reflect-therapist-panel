import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppLanguageService } from './core/services/app-language.service';
import { LayoutDirectionService } from './core/services/layout-direction.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor() {
    inject(AppLanguageService);
    inject(LayoutDirectionService);
    inject(ThemeService);
  }
}
