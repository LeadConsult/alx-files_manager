import {
  authenticateUser,
  deleteSessionToken,
  generateSessionToken,
  getBasicAuthToken,
  getCurrentUser,
  getSessionToken,
} from '../utils/auth';

/**
 * AuthController class
 */
class AuthController {
  /**
   * Handles the request to authenticate a user and generate a session token.
   * @param {Object} request - The HTTP request object.
   * @param {Object} response - The HTTP response object.
   * @returns {Promise<Object|void>} - The response with the generated session token or an error response.
   */
  static async getConnect(request, response) {
    const { email, password } = getBasicAuthToken(request);
    if (!email || !password) {
      return response.status(401).json({
        error: 'Unauthorized',
      });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return response.status(401).json({
        error: 'Unauthorized',
      });
    }
    const token = await generateSessionToken(user._id);
    return response.status(200).json(token);
  }

  /**
   * Handles the request to delete a session token.
   * @param {Object} request - The HTTP request object.
   * @param {Object} response - The HTTP response object.
   * @returns {Promise<Object|void>} - The response indicating success or an error response.
   */
  static async getDisconnect(request, response) {
    const token = getSessionToken(request);
    if (!token) {
      return response.status(401).json({
        error: 'Unauthorized',
      });
    }

    const result = await deleteSessionToken(token);
    if (!result) {
      return response.status(401).json({
        error: 'Unauthorized',
      });
    }
    return response.sendStatus(204);
  }

  /**
   * Handles the request to get the current user.
   * @param {Object} request - The HTTP request object.
   * @param {Object} response - The HTTP response object.
   * @returns {Promise<Object|void>} - The response with the current user or an error response.
   */
  static async getMe(request, response) {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return response.status(401).json({
        error: 'Unauthorized',
      });
    }
    return response.status(200).json(currentUser);
  }
}

export default AuthController;
