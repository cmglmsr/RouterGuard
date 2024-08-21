# RTGuard

RTGuard is a middleware for Express.js applications that detects and blocks suspicious request payloads based on predefined patterns.

## Installation

To install RTGuard, run:

```sh
npm install rtguard
```

## Usage
You may use RTGuard in your Express application as follows.
```javascript
import express from 'express';
import rtguard from 'rtguard';

const app = express();

app.use(express.json());
app.use(rtguard);

app.post('/your-endpoint', (req, res) => {
    res.send('Request received');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
```