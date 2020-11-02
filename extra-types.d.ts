declare module "mocha" {
  export interface Suite {
    hsetStub: any;
    hgetStub: any;
  }
}
