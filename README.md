# RTGuard Express Middleware

## Overview

The **RT Guard** middleware is a security middleware for Express.js applications. It is designed to audit incoming HTTP requests for potential malicious payloads based on predefined patterns. This middleware provides configurable options to define security levels, allowed request methods, and allowed content types. It can block requests that are deemed suspicious, providing a layer of protection against common web vulnerabilities.

## Features

- **Configurable paranoia level (`plevel`)**: Defines how many attack patterns need to be detected before blocking a request.
- **Allowed HTTP Methods (`allowedBodyTypes`)**: Restricts requests to a specified set of HTTP methods.
- **Allowed Body Types (`allowedMethods`)**: Restricts requests to a specified set of content types.
- **Maximum Request Size (`maxRequestSize`)**: Limits the size of incoming requests.
- **Verbose Logging (`verbose`)**: Optionally logs detailed information about the request and audit process.

## Installation

To install the middleware, use npm or yarn:

```bash
npm install rtguard
```

## How It Works
1. Initial Audit: The middleware performs an initial audit of the request to ensure it meets the allowed method, content type, and size criteria. If the request fails this audit, it is blocked immediately.

2. JSON Body Audit: If the request body is JSON, it is parsed, and each key and value is tested against predefined attack patterns. The patterns are imported from a separate payloads module.

3. Blocking Requests: If the number of detected attack patterns exceeds the configured plevel, the request is blocked, and a 418 status code is returned along with a message indicating the reason for blocking.

4. Logging: If verbose mode is enabled, the middleware logs details of the request, including detected attack patterns and the time taken to process the audit.

## Usage
You may use RTGuard in your Express application as follows.
```javascript
import express from 'express';
import { rtguard } from 'rtguard';

const app = express();

// Configure RT Guard
const guardConfig = {
    plevel: 5,
    allowedBodyTypes: ['application/json'],
    allowedMethods: ['GET', 'POST'],
    maxRequestSize: 4096,
    verbose: true
};

const guard = new rtguard(guardConfig);

// Apply RT Guard middleware
app.use(express.json()); // Required to parse JSON bodies
app.use(guard.rtguard);

// Define your routes
app.post('/secure-endpoint', (req, res) => {
    res.send('Request passed the security audit!');
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
```

## Example Configuration
```javascript
const guardConfig = {
    plevel: 3, // Lower paranoia level
    allowedBodyTypes: ['application/json', 'application/x-www-form-urlencoded'],
    allowedMethods: ['GET', 'POST', 'PUT'],
    maxRequestSize: 8192, // Increased request size limit
    verbose: false // No logging
};
```

## Credits
All payloads and wordlists are taken from https://github.com/payloadbox.

## Contribution

Contributions are welcome! Feel free to open an issue or submit a pull request to enhance RT Guard middleware.

## Contact

For any questions or issues, please reach out via GitHub or email (cemgulumser4@gmail.com).