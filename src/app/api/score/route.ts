export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const postalCode = searchParams.get('postalCode');
  
    if (!postalCode) {
      return Response.json({ error: 'Missing postalCode' }, { status: 400 });
    }
  
    // Mock scores (later we’ll call real APIs)
    const scores = {
      familyFriendliness: Math.floor(Math.random() * 100),
      foodieScore: Math.floor(Math.random() * 100),
      greenOutdoors: Math.floor(Math.random() * 100),
      urbanBuzz: Math.floor(Math.random() * 100),
      remoteWork: Math.floor(Math.random() * 100),
      investmentPotential: Math.floor(Math.random() * 100),
    };
  
    return Response.json({ postalCode, scores });
  }
  