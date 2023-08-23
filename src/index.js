import app from './app.js';
import net from 'net';

const port = process.env.PORT || 3000;

// Check if the port is available
const checkPortAvailability = (port) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(`Port ${port} is already in use`);
      } else {
        reject(err);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(`Port ${port} is available`);
    });
    server.listen(port);
  });
};

// Start the server
const startServer = async () => {
  try {
    await checkPortAvailability(port);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
