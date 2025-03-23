import Amadeus from 'amadeus';

// Initialize the Amadeus client with API credentials
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID as string,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET as string,
  hostname: process.env.AMADEUS_HOSTNAME as string,
  ssl: true,
  logger: { debug: console.debug, info: console.info, warn: console.warn, error: console.error }
});

export default amadeus; 