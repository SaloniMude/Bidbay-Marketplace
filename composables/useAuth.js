// export shared state variable
export const useCurrentUser = () => useState('current_user', () => null);

/**
 * Handles mock user authentication logic
 * @param {string} email
 * @param {string} password
 * @returns {boolean} True if login is successful, false otherwise
 */
export const loginUser = async (email, password) => {
  const response = await $fetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (response && response.user) {
    const extractedUsername = email.split('@')[0];

    // Update our shared global state
    const currentUser = useCurrentUser();
    currentUser.value = {
      id: response.user.id,
      username: extractedUsername,
    };

    return true;
  }
  return false;
};

/**
 * Clears user data and signs out the session
 */
export async function logoutUser() {
  try {
    //destroy backend session (secure HTTP-only cookie)
    await $fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    const currentUser = useCurrentUser();
    currentUser.value = null;

    // Redirect to home page after logout
    await navigateTo('/');
  }
}

/**
 * Registers a new user by sending data to the backend API
 * @param {string} email - User email
 * @param {string} password - User password (min 8 chars)
 * @returns {Object} Registered user data
 */
export async function registerUser(email, password) {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Call the /api/auth/register endpoint
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
      },
    });

    // Update global state with new user
    const currentUser = useCurrentUser();
    currentUser.value = {
      id: response.user.id,
      email: response.user.email,
      username: email.split('@')[0],
    };

    return response.user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
