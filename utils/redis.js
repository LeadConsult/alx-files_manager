import { createClient } from 'redis';
import { promisify } from 'util';

/**
 * A Redis client class that can be used to interact with Redis.
 */
class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnected = false;

    this.client.on('error', (err) => {
      console.log('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      this.isConnected = true;
    });

    // Binding asynchronous Redis commands to use promises
    this.asyncSetX = promisify(this.client.setex).bind(this.client);
    this.asyncGet = promisify(this.client.get).bind(this.client);
    this.asyncDel = promisify(this.client.del).bind(this.client);
    this.asyncExpire = promisify(this.client.expire).bind(this.client);
  }

  /**
   * Checks if the Redis client is connected to the server.
   * @returns {boolean} - True if the client is connected, false otherwise.
   */
  isAlive() {
    return this.isConnected;
  }

  /**
   * Sets a key-value pair in Redis with an expiry time.
   * @param {string} key - The key.
   * @param {string} value - The value.
   * @param {number} expiry - The expiry time in seconds.
   */
  set(key, value, expiry) {
    this.asyncSetX(key, expiry, value);
  }

  /**
   * Retrieves the value associated with a key from Redis.
   * @param {string} key - The key.
   * @returns {Promise<string|null>} - A promise that resolves with the value if found, null otherwise.
   */
  get(key) {
    return this.asyncGet(key);
  }

  /**
   * Deletes a key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<number>} - A promise that resolves with the number of keys deleted.
   */
  del(key) {
    return this.asyncDel(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
