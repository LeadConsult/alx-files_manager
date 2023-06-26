import { MongoClient, ObjectId } from 'mongodb';
import sha1 from 'sha1';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

/**
 * Class representing an instance of MongoDB Client for interacting with the db.
 */
export class DBClient {
  constructor() {
    this.client = new MongoClient(`mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`);
    this.isConnected = false;
    this.db = null;
    this.client.connect((err) => {
      if (!err) {
        this.isConnected = true;
        this.db = this.client.db(DB_DATABASE);
      }
    });
  }

  /**
   * Checks if the MongoDB client is alive.
   * @returns {boolean} - True if the client is alive, false otherwise.
   */
  isAlive() {
    return this.isConnected;
  }

  /**
   * Retrieves the number of users in the database.
   * @returns {Promise<number>} - A promise that resolves with the number of users.
   */
  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  /**
   * Retrieves the number of files in the database.
   * @returns {Promise<number>} - A promise that resolves with the number of files.
   */
  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  /**
   * Retrieves the "files" collection from the database.
   * @returns {Collection} - The "files" collection object.
   */
  filesCollection() {
    return this.db.collection('files');
  }

  /**
   * Finds a user in the database by email.
   * @param {string} email - The user's email.
   * @returns {Promise<Object|null>} - A promise that resolves with the user object if found, null otherwise.
   */
  findUserByEmail(email) {
    return this.db.collection('users').findOne({ email });
  }

  /**
   * Finds a user in the database by ID.
   * @param {string} userId - The user's ID.
   * @returns {Promise<Object|null>} - A promise that resolves with the user object if found, null otherwise.
   */
  findUserById(userId) {
    return this.db.collection('users').findOne({ _id: ObjectId(userId) });
  }

  /**
   * Adds a new user to the database.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<Object>} - A promise that resolves with the created user object.
   */
  async addUser(email, password) {
    const hashedPassword = sha1(password);
    const result = await this.db.collection('users').insertOne({
      email,
      password: hashedPassword,
    });
    return {
      email: result.ops[0].email,
      id: result.ops[0]._id,
    };
  }
}

const dBClient = new DBClient();
export default dBClient;
