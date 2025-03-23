declare module 'amadeus' {
  interface AmadeusOptions {
    clientId: string;
    clientSecret: string;
    hostname?: string;
    customAppId?: string;
    customAppVersion?: string;
    ssl?: boolean;
    port?: number;
    logger?: any;
  }

  interface AmadeusResponse {
    statusCode: number;
    body: any;
    result: any;
  }

  class Amadeus {
    constructor(options: AmadeusOptions);
    
    shopping: {
      flightOffersSearch: {
        get(params: any): Promise<AmadeusResponse>;
        post(params: any): Promise<AmadeusResponse>;
      };
      flightDestinations: {
        get(params: any): Promise<AmadeusResponse>;
      };
      hotelOffers: {
        get(params: any): Promise<AmadeusResponse>;
      };
    };
    
    referenceData: {
      locations: {
        get(params: any): Promise<AmadeusResponse>;
        pointsOfInterest: {
          get(params: any): Promise<AmadeusResponse>;
          bySquare: {
            get(params: any): Promise<AmadeusResponse>;
          };
        };
      };
      airlines: {
        get(params: any): Promise<AmadeusResponse>;
      };
    };
  }

  export default Amadeus;
} 