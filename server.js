const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path');
const url = require('url');

const app = express();
const PORT = 54321;
const HOST = 'localhost';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS and security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '3600');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files
app.use(express.static(__dirname));

// API Proxy - Forward requests to both SOURCE and DESTINATION APIs
app.all('/proxy/:target/*', async (req, res) => {
  try {
    const target = req.params.target; // 'from' or 'to'
    const apiPath = '/' + req.params[0]; // rest of the path
    
    // Determine the base URL - can be overridden by custom headers
    let baseUrl;
    let authToken;
    
    if (target === 'from') {
      // Allow dynamic URL override via header, otherwise use default
      baseUrl = req.headers['x-proxy-from-url'] || 'https://api.ignatius.io';
      authToken = req.headers['x-token-from'];
    } else if (target === 'to') {
      // Allow dynamic URL override via header, otherwise use default
      baseUrl = req.headers['x-proxy-to-url'] || 'https://devapi.ignatius.io';
      authToken = req.headers['x-token-to'];
    } else {
      return res.status(400).json({ error: 'Invalid target. Use "from" or "to"' });
    }
    
    // Build the full URL
    const targetUrl = new URL(apiPath, baseUrl);
    
    // Copy query parameters
    Object.keys(req.query).forEach(key => {
      targetUrl.searchParams.append(key, req.query[key]);
    });
    
    console.log(`📤 Proxying ${req.method} request to: ${targetUrl.href}`);
    
    // Prepare options for the request
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    // Add authorization token if provided
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Make the request to the target API
    const proxyReq = https.request(targetUrl, options, (proxyRes) => {
      let data = '';
      
      proxyRes.on('data', (chunk) => {
        data += chunk;
      });
      
      proxyRes.on('end', () => {
        console.log(`✅ Response from ${target}: ${proxyRes.statusCode}`);
        
        res.status(proxyRes.statusCode);
        
        // Copy response headers
        Object.keys(proxyRes.headers).forEach(key => {
          if (key !== 'content-encoding') { // Skip gzip encoding
            res.setHeader(key, proxyRes.headers[key]);
          }
        });
        
        res.send(data);
      });
    });
    
    proxyReq.on('error', (error) => {
      console.error(`❌ Proxy error (${target}):`, error.message);
      res.status(500).json({ 
        error: 'API request failed',
        details: error.message 
      });
    });
    
    // Send request body if POST/PUT/PATCH
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      proxyReq.write(JSON.stringify(req.body));
    }
    
    proxyReq.end();
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'Table Form Duplicator'
  });
});

// Default route - serve the HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cross-env.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: '404 Not Found',
    path: req.path
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`\n✅ Server running at http://${HOST}:${PORT}/`);
  console.log(`\n📂 Open http://${HOST}:${PORT}/cross-env.html in your browser`);
  console.log(`\n🔌 API Proxy available at http://${HOST}:${PORT}/proxy/{from|to}/*`);
  console.log(`\n📡 CORS Enabled - Browser requests will work!\n`);
  console.log('Press Ctrl+C to stop the server\n');
});

