import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dBClient from './db';
import redisClient from './redis';

/**
 * Parses the basic authentication token from the request headers.
 * @param {Object} request - The request object.
 * @returns {Object|null} - The email and password extracted from the token, or null if not present.
 */
export function getBasicAuthToken(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader) { return null; }
  const token = authHeader.split(' ')[1];
  if (!token) { return null; }
  const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
  const [email, password] = decodedToken.split(':');
  return { email, password };
}

/**
 * Retrieves the session token from the request headers.
 * @param {Object} request - The request object.
 * @returns {string|null} - The session token or null if not present.
 */
export function getSessionToken(request) {
  const xHeader = request.headers['x-token'];
  if (!xHeader) { return null; }
  return xHeader;
}

/**
 * Authenticates a user with the provided email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Object|null} - The user object if authenticated, or null if not found or password doesn't match.
 */
export async function authenticateUser(email, password) {
  const user = await dBClient.findUserByEmail(email);
  if (!user) { return null; }
  const hashedPassword = sha1(password);
  if (user.password !== hashedPassword) { return null; }
  return user;
}

/**
 * Generates a session token for the specified user ID and stores it in Redis.
 * @param {string} userId - The ID of the user.
 * @returns {Object} - The generated session token.
 */
export async function generateSessionToken(userId) {
  const token = uuidv4();
  const key = `auth_${token}`;
  await redisClient.set(key, userId, 24 * 60 * 60); // Sets the token in Redis with a 24-hour expiry.
  return { token };
}

/**
 * Deletes a session token from Redis.
 * @param {string} token - The session token to delete.
 * @returns {boolean} - True if the token was deleted, false otherwise.
 */
export async function deleteSessionToken(token) {
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) { return false; }
  await redisClient.del(`auth_${token}`); // Deletes the token from Redis.
  return true;
}

/**
 * Retrieves the user associated with the specified session token.
 * @param {string} token - The session token.
 * @returns {Object|null} - The user object if found, null otherwise.
 */
export async function getUserFromSession(token) {
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) { return null; }
  const user = await dBClient.findUserById(userId);
  if (!user) { return null; }
  return { email: user.email, id: user._id };
}

/**
 * Retrieves the current authenticated user based on the request's session token.
 * @param {Object} request - The request object.
 * @returns {Object|null} - The current user object if authenticated, null otherwise.
 */
export async function getCurrentUser(request) {
  const token = getSessionToken(request);
  if (!token) { return null; }
  const user = await getUserFromSession(token);
  if (!user) { return null; }
  return user;
}
