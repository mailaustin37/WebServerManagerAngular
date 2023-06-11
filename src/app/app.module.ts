import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {ServerService} from "./service/server.service";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NotifierModule} from "angular-notifier";

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    LottieModule.forRoot({ player: playerFactory }),
    NotifierModule.withConfig({
      position: {

        horizontal: {
          /**
           * Defines the horizontal position on the screen
           * @type {'left' | 'middle' | 'right'}
           */
          position: 'left',

          /**
           * Defines the horizontal distance to the screen edge (in px)
           * @type {number}
           */
          distance: 12

        },

        vertical: {

          /**
           * Defines the vertical position on the screen
           * @type {'top' | 'bottom'}
           */
          position: 'top',

          /**
           * Defines the vertical distance to the screen edge (in px)
           * @type {number}
           */
          distance: 12,

          /**
           * Defines the vertical gap, existing between multiple notifications (in px)
           * @type {number}
           */
          gap: 10

        }

      },
      theme: 'material',
    })
  ],
  providers: [ServerService],
  bootstrap: [AppComponent]
})

export class AppModule { }
