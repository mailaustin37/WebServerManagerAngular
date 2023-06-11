import {DataStateEnum} from "../enum/data-state.enum";

export interface AppState<T>{
  dataState: DataStateEnum;
  appData?: T;
  error?: string;
}
