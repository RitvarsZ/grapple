export enum GrappleEventTypes {
  ToggleOverlay = 'ToggleOverlay',
  Search = 'Search',
  ShowResults = 'ShowResults',
  Navigate = 'Navigate',
}
export default class GrappleEvent {
  public type: GrappleEventTypes;
  public payload: any;

  constructor(type: GrappleEventTypes, payload: any) {
    this.type = type;
    this.payload = payload;

    console.log('GrappleEvent', this)
  }
}