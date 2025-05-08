export type ScoreResult = {
    postalCode: string;
    scores: {
      familyFriendliness: number;
      foodieScore: number;
      greenOutdoors: number;
      urbanBuzz: number;
      remoteWork: number;
      investmentPotential: number;
    };
  };