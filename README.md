# RTGuard Express Middleware

## Overview

The **RT Guard** middleware is a security middleware for Express.js applications. It is designed to audit incoming HTTP requests for potential malicious payloads based on predefined patterns. This middleware provides configurable options to define security levels, allowed request methods, and allowed content types. It can block requests that are deemed suspicious, providing a layer of protection against common web vulnerabilities.

## Security Features

- **SQL Injection Protection**: Detects and blocks suspicious SQL patterns in URLs, headers, and JSON bodies, preventing unauthorized database access.
- **XSS Injection Protection**: Guards against Cross-Site Scripting by identifying and stopping malicious scripts embedded in requests.
- **XXE Injection Protection**: Prevents XML External Entity attacks by scanning and filtering XML input to block malicious payloads.
- **Open Redirect Protection**: Identifies and mitigates open redirect vulnerabilities by analyzing URL patterns that could lead to phishing or malicious redirects.
- **RCE Injection Protection**: Blocks Remote Code Execution attempts by detecting and intercepting code injection patterns in incoming requests.
- **RFI/LFI Protection**: Protects against Remote and Local File Inclusion attacks by scanning for malicious file paths in requests, ensuring server integrity.

## Customization Features

- **Configurable paranoia level (`plevel`)**: Defines how many attack patterns need to be detected before blocking a request.
  - `1-10`: 1 being the most paranoid, 10 being the least strict protection level. 
- **Allowed HTTP Methods (`allowedMethods`)**: Restricts requests to a specified array of HTTP methods.
    - `GET`: Allows GET methods.
    - `POST`: Allows POST methods.
    - `PUT`: Allows PUT methods.
    - `DELETE`: Allows DELETE methods.
    - `PATCH`: Allows PATCH methods.
    - `HEAD`: Allows HEAD methods.
    - `*`: Allows ALL methods.
- **Allowed Body Types (`allowedBodyTypes`)**: Restricts requests to a specified set of content types.
    - `application/json`: Allows JSON payloads.
    - `application/x-www-form-urlencoded`: Allows URL Encoded Form payloads.
    - `multipart/form-data`: Allows Multipart Form payloads.
    - `text/javascript`: Allows Javascript payloads.
    - `text/html`: Allows HTML payloads.
    - `text/css`: Allows CSS payloads.
    - `*`: Allows ALL content types.
- **Maximum Request Size (`maxRequestSize`)**: Limits the size of incoming requests.
    - Specify the maximum request size in bytes (e.g., `1048576` for 1MB).
- **Verbose Logging (`verbose`)**: Optionally logs detailed information about the request and audit process.
    - `true`: Enable verbose logging.
    - `false`: Disable verbose logging.
- **Multer (`multer`)**: Provide a custom multer for parsing multipart form data bodies. You may provide a single multer instance, or a function that returns different types of multers for different interfaces. See Example Configuration (for multi-multer applications) below.

## Example Configuration
```javascript
const guardConfig = {
    plevel: 3, // Paranoia level
    allowedBodyTypes: ['application/json', 'application/x-www-form-urlencoded'],
    allowedMethods: ['GET', 'POST', 'PUT'],
    maxRequestSize: 8192, // Increased request size limit
    verbose: false // No logging
};
```

## Example Configuration (for multi-multer applications)
```javascript
const guardConfig = {
  plevel: 3,
  allowedBodyTypes: ['*'],
  allowedMethods: [ 'PUT', 'GET', 'POST'],
  maxRequestSize: 8192,
  verbose: true,
  multer: (req) => {
    if (req.path.startsWith('/upload/images')) {
      return multer({ storage: multer.memoryStorage() }).single('image');
    } else if (req.path.startsWith('/upload/videos')) {
      return multer({ storage: multer.diskStorage({ destination: './uploads/videos' }) }).single('video');
    }
    return multer().any();
  }
}
```

## Installation

To install the middleware, use npm or yarn:

```bash
npm install rtguard
```

## How It Works
1. Initial Audit: The middleware performs an initial audit of the request to ensure it meets the allowed method, content type, and size criteria. If the request fails this audit, it is blocked immediately.

2. Body Parsing: Different body types are parsed to auditable format. See Customization Features part for auditable content types.

3. Body Audit: Each key and value in the body is tested against predefined attack patterns. The patterns are imported from a separate payloads module. 

4. Blocking Requests: If the number of detected attack patterns exceeds the configured plevel, the request is blocked, and a 418 status code is returned along with a message indicating the reason for blocking.

5. Logging: If verbose mode is enabled, the middleware logs details of the request, including detected attack patterns and the time taken to process the audit.

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

## Credits
All payloads and wordlists are taken from https://github.com/payloadbox.

## Contribution

Contributions are welcome! Feel free to open an issue or submit a pull request to enhance RT Guard middleware.

## Contact

For any questions or issues, please reach out via GitHub or email (cemgulumser4@gmail.com).