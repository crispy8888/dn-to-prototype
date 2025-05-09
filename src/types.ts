  export type Insight = {
    placeType: string;
    metricType: string;
    value: number;
  };
  
  export type ScoreResult = {
    postalCode: string;
    location: {
      displayName: string;
      lat: number;
      lon: number;
    };
    insights: Insight[];
  };
  