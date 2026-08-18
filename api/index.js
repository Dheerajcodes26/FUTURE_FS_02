// Vercel Serverless Function entry point
// Imports the Express app from the existing server implementation
// No route or controller logic is duplicated here.

// Dynamically import the Express app (server.js is ES module)
const { default: app } = await import('../server/server.js');

export default app;
