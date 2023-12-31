import dbClient from '../utils/db';
import { userQueue } from '../worker';

/**
 * UsersController class
 */
class UsersController {
  /**
   * Handles the request to create a new user.
   * @param {Object} request - The HTTP request object.
   * @param {Object} response - The HTTP response object.
   * @returns {Promise<Object>} - The response with the newly created user or an error response.
   */
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }

    const existingUser = await dbClient.findUserByEmail(email);
    if (existingUser) {
      return response.status(400).json({ error: 'Already exist' });
    }

    const newUser = await dbClient.addUser(email, password);
    userQueue.add({ userId: newUser.id });
    return response.status(201).json(newUser);
  }
}

export default UsersController;
