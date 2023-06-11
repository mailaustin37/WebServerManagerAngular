import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ServerService} from "./service/server.service";
import {BehaviorSubject, map, Observable, of, startWith} from "rxjs";
import {AppState} from "./interface/app-state";
import {CustomResponse} from "./interface/custom-response";
import {DataStateEnum} from "./enum/data-state.enum";
import {catchError} from "rxjs/operators";
import {AnimationOptions} from "ngx-lottie";
import {StatusEnum} from "./enum/status.enum";
import {NgForm} from "@angular/forms";
import {Server} from "./interface/server";
import {NotifierService} from 'angular-notifier';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush //Benefit of using observables
})
export class AppComponent implements OnInit{
  title = 'Server Manager'; //Test
  private readonly notifier: NotifierService;
  appState$:Observable<AppState<CustomResponse>>|undefined;
  readonly DataState = DataStateEnum;
  readonly Status = StatusEnum;
  private filterSubject = new BehaviorSubject<string>("");
  private dataSubject = new BehaviorSubject<CustomResponse|undefined>(undefined);
  filterSubject$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  options: AnimationOptions = {
    path: "assets/lottie/loading_lines.json",
  };
  styles: Partial<CSSStyleDeclaration> = {
    maxWidth: '500px',
    margin: '0 auto',
  };

  constructor(private serverService: ServerService, notifierService: NotifierService) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {

    /*this.serverService.getServers$().subscribe(response=>{
      this.appState$ = of({
        dataState: DataStateEnum.LOADED_STATE,
        appData: response});
    });*/


    this.appState$= this.serverService.getServers$().pipe(
      map(response =>{
        this.dataSubject.next(response);
        return {
          dataState: DataStateEnum.LOADED_STATE,
          appData: response
        }
      }),
      startWith({dataState: DataStateEnum.LOADING_STATE}),
      catchError((error:string) => {
        return of({
          dataState: DataStateEnum.ERROR_STATE,
          error
        });
      })
    );

  }

  filterServers = (status: StatusEnum):void =>{
    this.notifier.notify('success', `Filtering by ${status}`);
    this.appState$ = this.serverService.filter$(status, this.dataSubject.value)
      .pipe(
        map(response =>{
             return {dataState: DataStateEnum.LOADED_STATE, appData: response}
          }),
        startWith({dataState: DataStateEnum.LOADING_STATE}),
        catchError((error:string) => {
          this.notifier.notify('error', `Error occurred while filtering`);
          return of({
            dataState: DataStateEnum.ERROR_STATE,
            error
          });
        })
      );
  }

  saveServer = (serverForm: NgForm):void =>{
    this.isLoading.next(true);
    this.appState$ = this.serverService.saveServer$(<Server>serverForm.value)//you can also cast like so --> serverForm.value as Server
      .pipe(
        map(response =>{
          this.dataSubject.next(
            {
              ...response,data: { servers : [response.data.server, ...this.dataSubject.value.data.servers]}
            }
          );
          this.isLoading.next(false);
          document.getElementById("closeModal").click();
          serverForm.resetForm({status : this.Status.SERVER_DOWN});
          this.notifier.notify('success', `New Server saved successfully.`);
          return {dataState: DataStateEnum.LOADED_STATE, appData: this.dataSubject.value}
        }),
        startWith({dataState: DataStateEnum.LOADING_STATE}),
        catchError((error:string) => {
          this.isLoading.next(false);
          this.notifier.notify('error', `Error occurred saving new Server`);
          return of({
            dataState: DataStateEnum.ERROR_STATE,
            error
          });
        })
      );
  }

  deleteServer = (server : Server):void =>{
    this.appState$ = this.serverService.deleteServer$(server.id)
      .pipe(
        map(response =>{
          this.notifier.notify('success', `Server with IP ${server.id} has been deleted`);
          this.dataSubject.next({...response, data :{servers : this.dataSubject.value.data.servers.filter(s =>s.id !== server.id)}});
          return {dataState: DataStateEnum.LOADED_STATE, appData: this.dataSubject.value}
        }),
        startWith({dataState: DataStateEnum.LOADING_STATE }),
        catchError((error:string) => {
          this.notifier.notify('error', `Error occurred while attempting to delete Server`);
          return of({
            dataState: DataStateEnum.ERROR_STATE,
            error
          });
        })
      );
  }

  pingServer = (ipAddress: string):void =>{
    this.filterSubject.next(ipAddress);
    this.appState$ = this.serverService.pingServer$(ipAddress).pipe(
        map(response =>{
            let index = this.dataSubject.value.data.servers.findIndex(server=>server.id === response.data.server.id);
            this.dataSubject.value.data.servers[index] = response.data.server;
            this.filterSubject.next("");
          this.notifier.notify('success', response.message);
          return {dataState: DataStateEnum.LOADED_STATE, appData : this.dataSubject.value}
        }),
        startWith({dataState: DataStateEnum.LOADED_STATE, appData : this.dataSubject.value}),
        catchError((error:string) => {
          this.filterSubject.next("");
          this.notifier.notify('error', error);
          return of({
            dataState: DataStateEnum.ERROR_STATE,
            error
          });
        })
      );
  }

  printReport = ():void =>{
    //option 1
    window.print();

    //option 2
    /*let dataType = "application/vnd.ms-excel.sheet.macroEnabled.12";
    let tableSelect = document.getElementById("servers");
    let tableHtml = tableSelect.outerHTML.replace(/ /g,"%20");//replace all spaces or it won't work
    let downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    downloadLink.href = "data:" + dataType + ", " + tableHtml;
    downloadLink.download = "server-report.xls";
    downloadLink.click();
    document.body.removeChild(downloadLink);*/
  }
}
