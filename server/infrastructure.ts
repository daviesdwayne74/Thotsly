/**
 * THOTSLY Infrastructure Configuration
 * Optimized for high-traffic, enterprise-scale performance
 */

// ============================================================================
// CACHING STRATEGY
// ============================================================================

export const cacheConfig = {
  // Redis cache TTLs (in seconds)
  ttl: {
    user: 3600, // 1 hour
    creator: 1800, // 30 minutes
    post: 900, // 15 minutes
    stream: 300, // 5 minutes
    discovery: 600, // 10 minutes
    session: 86400, // 24 hours
  },

  // Cache keys
  keys: {
    user: (id: string) => `user:${id}`,
    creator: (id: string) => `creator:${id}`,
    post: (id: string) => `post:${id}`,
    stream: (id: string) => `stream:${id}`,
    liveStreams: "streams:live",
    trendingCreators: "creators:trending",
    userFeed: (userId: string) => `feed:${userId}`,
  },
};

// ============================================================================
// DATABASE OPTIMIZATION
// ============================================================================

export const dbConfig = {
  // Connection pooling
  pool: {
    min: 5,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // Query optimization
  batchSize: 1000,
  prefetchSize: 100,

  // Indexes for high-traffic queries
  criticalIndexes: [
    "users.id",
    "creator_profiles.userId",
    "posts.creatorId",
    "posts.createdAt",
    "subscriptions.userId",
    "subscriptions.creatorId",
    "live_streams.status",
    "live_streams.creatorId",
    "stream_chat.streamId",
    "stream_tips.streamId",
    "transactions.userId",
    "transactions.creatorId",
  ],

  // Read replicas for scaling
  replicas: {
    enabled: true,
    count: 3,
    lag: 1000, // acceptable lag in ms
  },
};

// ============================================================================
// RATE LIMITING
// ============================================================================

export const rateLimitConfig = {
  // Per-user rate limits
  limits: {
    api: {
      requests: 1000,
      window: 60, // per minute
    },
    chat: {
      requests: 30,
      window: 60,
    },
    upload: {
      requests: 10,
      window: 3600, // per hour
    },
    stream: {
      requests: 5,
      window: 3600,
    },
  },

  // Burst allowance
  burst: 1.5,

  // Whitelist (for trusted services)
  whitelist: ["internal-service", "admin"],
};

// ============================================================================
// STREAMING CONFIGURATION
// ============================================================================

export const streamingConfig = {
  // HLS/DASH adaptive bitrate
  bitrates: [
    { quality: "360p", bitrate: 800, fps: 30 },
    { quality: "480p", bitrate: 1200, fps: 30 },
    { quality: "720p", bitrate: 2500, fps: 60 },
    { quality: "1080p", bitrate: 5000, fps: 60 },
  ],

  // Latency targets
  latency: {
    target: 2000, // 2 seconds (sub-2s for live interaction)
    maximum: 5000, // 5 seconds absolute max
  },

  // Chunk settings
  chunkDuration: 2, // 2 second chunks
  bufferSize: 10, // 10 seconds

  // Concurrent limits
  maxConcurrentStreams: 10000,
  maxViewersPerStream: 100000,

  // Recording
  recordingEnabled: true,
  recordingBitrate: "5000k",
  recordingFormat: "mp4",
};

// ============================================================================
// WEBSOCKET CONFIGURATION (Real-time)
// ============================================================================

export const websocketConfig = {
  // Connection settings
  maxConnections: 50000,
  maxConnectionsPerUser: 5,
  heartbeatInterval: 30000, // 30 seconds
  heartbeatTimeout: 60000, // 60 seconds

  // Message limits
  maxMessageSize: 65536, // 64KB
  messagesPerSecond: 10,

  // Rooms (for scaling)
  roomSize: 1000, // users per room
  autoScaling: true,

  // Compression
  compression: "deflate",
};

// ============================================================================
// CDN CONFIGURATION
// ============================================================================

export const cdnConfig = {
  // Static assets
  staticAssets: {
    ttl: 31536000, // 1 year (immutable)
    compression: "gzip",
    minifyCSS: true,
    minifyJS: true,
  },

  // Media (videos, images)
  media: {
    ttl: 86400, // 1 day
    compression: "none", // already compressed
    variants: {
      thumbnail: { width: 320, height: 180 },
      preview: { width: 640, height: 360 },
      full: { width: 1920, height: 1080 },
    },
  },

  // API responses
  api: {
    ttl: 300, // 5 minutes
    compression: "gzip",
  },

  // Regions
  regions: [
    "us-east-1",
    "us-west-1",
    "eu-west-1",
    "ap-southeast-1",
    "ap-northeast-1",
  ],
};

// ============================================================================
// MONITORING & ALERTS
// ============================================================================

export const monitoringConfig = {
  // Metrics to track
  metrics: {
    api: {
      p50: 100, // ms
      p95: 500,
      p99: 1000,
      errorRate: 0.01, // 1%
    },
    database: {
      p50: 50,
      p95: 200,
      p99: 500,
      connectionPoolUsage: 0.8, // 80%
    },
    streaming: {
      latency: 2000, // ms
      bufferHealth: 0.7, // 70%+
      churnRate: 0.05, // 5% acceptable
    },
  },

  // Alert thresholds
  alerts: {
    errorRate: 0.05, // 5%
    latency: 2000, // ms
    cpuUsage: 80, // %
    memoryUsage: 85, // %
    diskUsage: 90, // %
  },

  // Logging
  logging: {
    level: "info",
    sampleRate: 0.1, // 10% of requests
    slowQueryThreshold: 1000, // ms
  },
};

// ============================================================================
// LOAD BALANCING
// ============================================================================

export const loadBalancingConfig = {
  // Strategy
  strategy: "least-connections", // or "round-robin", "weighted"

  // Health checks
  healthCheck: {
    interval: 10000, // 10 seconds
    timeout: 5000, // 5 seconds
    unhealthyThreshold: 3,
    healthyThreshold: 2,
  },

  // Auto-scaling
  autoScaling: {
    enabled: true,
    minInstances: 3,
    maxInstances: 100,
    targetCPU: 70, // %
    targetMemory: 75, // %
    scaleUpThreshold: 80, // %
    scaleDownThreshold: 30, // %
  },

  // Sticky sessions
  stickySessions: {
    enabled: true,
    duration: 3600, // 1 hour
  },
};

// ============================================================================
// SECURITY
// ============================================================================

export const securityConfig = {
  // DDoS protection
  ddosProtection: {
    enabled: true,
    rateLimit: 10000, // requests per second
    burstLimit: 50000,
  },

  // API security
  apiSecurity: {
    requireAuth: true,
    tokenExpiry: 3600, // 1 hour
    refreshTokenExpiry: 604800, // 7 days
    corsOrigins: ["https://thotsly.com", "https://*.thotsly.com"],
  },

  // Data encryption
  encryption: {
    inTransit: "TLS 1.3",
    atRest: "AES-256",
  },
};

// ============================================================================
// PERFORMANCE TARGETS
// ============================================================================

export const performanceTargets = {
  // API response times
  api: {
    p50: 100, // ms
    p95: 500,
    p99: 1000,
  },

  // Page load times
  frontend: {
    firstContentfulPaint: 1500, // ms
    largestContentfulPaint: 2500, // ms
    cumulativeLayoutShift: 0.1,
  },

  // Streaming
  streaming: {
    startupTime: 2000, // ms
    latency: 2000, // ms
    rebufferingRate: 0.01, // 1%
  },

  // Availability
  availability: 0.9999, // 99.99% uptime

  // Scalability
  scalability: {
    maxConcurrentUsers: 1000000,
    maxStreams: 10000,
    maxMessages: 100000, // per second
  },
};

export default {
  cacheConfig,
  dbConfig,
  rateLimitConfig,
  streamingConfig,
  websocketConfig,
  cdnConfig,
  monitoringConfig,
  loadBalancingConfig,
  securityConfig,
  performanceTargets,
};

