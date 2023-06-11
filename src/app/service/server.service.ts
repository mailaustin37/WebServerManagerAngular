import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable, of, throwError} from "rxjs";
import {catchError, tap} from "rxjs/operators";
import {CustomResponse} from "../interface/custom-response";
import {Server} from "../interface/server";
import {StatusEnum} from "../enum/status.enum";

@Injectable({
  providedIn: 'root'
})


export class ServerService {

  private readonly apiURL:string = "";

  constructor(private httpClient:HttpClient) {
    this.apiURL=environment.domain;
  }

  //Procedural
  /*getServers$ = ():Observable<CustomResponse> =>  {
    return this.httpClient.get<CustomResponse>(`${this.apiURL}/server/all`)
  }
  getServer$ = (id:number): Observable<CustomResponse> => {
    return this.httpClient.get<CustomResponse>(`${this.apiURL}/server/get/${id}`)
  }

  pingServer$ = (ipAddress:string): Observable<CustomResponse> => {
    return this.httpClient.get<CustomResponse>(`${this.apiURL}/server/ping/${ipAddress}`)
  }

  updateServer$ = (server:Server):Observable<CustomResponse> => {
    return this.httpClient.put<CustomResponse>(`${this.apiURL}/server/update`,server);
  }

  saveServer$ = (server:Server):Observable<CustomResponse> => {
    return this.httpClient.post<CustomResponse>(`${this.apiURL}/server/save`,server);
  }

  deleteServer$ = (id:number): Observable<CustomResponse> => {
    return this.httpClient.delete<CustomResponse>(`${this.apiURL}/server/delete/${id}`)
  }
*/

  //Reactive Approach

  //<Observable<CustomResponse>>this.httpClient.get<CustomResponse>(`${this.apiURL}/server/all`)
  //the above line casts the results to type <Observable<CustomResponse>>

  /*filterIT = (status: StatusEnum, response: CustomResponse):Observable<CustomResponse> => {
    return of({...response, message: `Servers filtered by ${status}`} );
  }*/

  filter$ = (status: StatusEnum, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      subscriber => {
        //console.log(response);
        if (response.data.servers) {
          subscriber.next(
            status === StatusEnum.ALL ?
              {...response, message: `Servers filtered by ${status}`} :
              {
                ...response,
                message: response.data.servers.filter(server => {
                  return server.status === status;
                }).length > 0 ?
                  `Servers filtered by ${status === StatusEnum.SERVER_UP ? "SERVER UP" : "SERVER DOWN"}` :
                  `No Servers of ${status} found`,
                data: {
                  servers: response.data.servers.filter(server => {
                    return server.status === status;
                  })
                }
              }
          )
        }
        subscriber.complete();
      }
    );

  getServers$ = () => <Observable<CustomResponse>>this.httpClient.get<CustomResponse>(`${this.apiURL}/server/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  getServer$ = (id: number) => <Observable<CustomResponse>>this.httpClient.get<CustomResponse>(`${this.apiURL}/server/get/${id}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  pingServer$ = (ipAddress: string) => <Observable<CustomResponse>>this.httpClient.get<CustomResponse>(`${this.apiURL}/server/ping/${ipAddress}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  deleteServer$ = (id: number) => <Observable<CustomResponse>>this.httpClient.delete<CustomResponse>(`${this.apiURL}/server/delete/${id}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  saveServer$ = (server: Server) => <Observable<CustomResponse>>this.httpClient.post<CustomResponse>(`${this.apiURL}/server/save`, server)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  private handleError(e:HttpErrorResponse): Observable<never> {
    console.log(e);
    return throwError("An error occurred");
  }
}
