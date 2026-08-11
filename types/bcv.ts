export interface BcvRateResponse {
  rate: number;
  savedAt: number;
}

export interface BcvEndpoint {
  url: string;
  parse: (data: any) => number | null;
}
