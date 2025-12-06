import * as crypto from 'crypto-js';

/**
 * Password hashing utility for client-side password obfuscation
 * Uses PBKDF2 with SHA-256 to hash passwords before sending to server
 * This ensures the server never receives plaintext passwords
 */
export class PasswordHashUtil {
  // Use a consistent salt based on username to produce reproducible hashes
  private static generateSalt(username: string): string {
    // Create a deterministic salt from username
    // This allows the user to log in with the same hash every time
    return 'bowl-pickem-' + username;
  }

  /**
   * Hash password using PBKDF2
   * @param password The plaintext password
   * @param username The username (used to generate salt)
   * @param iterations Number of iterations (higher = more secure but slower)
   * @returns The hashed password as a hex string
   */
  static hashPassword(password: string, username: string, iterations: number = 100000): string {
    const salt = this.generateSalt(username);
    
    // Use PBKDF2 with SHA-256
    const hash = crypto.PBKDF2(password, salt, {
      keySize: 256 / 32, // 256-bit output
      iterations: iterations
    });

    return hash.toString();
  }

  /**
   * Hash password with a random salt (for additional security)
   * Returns both hash and salt for storage
   * @param password The plaintext password
   * @returns Object with hash and salt
   */
  static hashPasswordWithRandomSalt(password: string): { hash: string; salt: string } {
    // Generate a random salt
    const salt = crypto.lib.WordArray.random(128 / 8).toString();

    // Hash the password with the random salt
    const hash = crypto.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 100000
    });

    return {
      hash: hash.toString(),
      salt: salt
    };
  }

  /**
   * Verify a password against a hash
   * @param password The plaintext password to verify
   * @param hash The stored password hash
   * @param salt The salt used for hashing
   * @returns True if password matches, false otherwise
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const derivedHash = crypto.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 100000
    }).toString();

    return derivedHash === hash;
  }
}
