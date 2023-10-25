export default {
  logIn() {},
  async signUp(context, payload) {
    const response = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDjA_gAnz93zDbRrm3JvqwLkD3cG47fUNU',
      {
        method: 'POST',
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
          returnSecureToken: true,
        }),
      }
    );

    const responseData = response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to authenticate!');
    }

    context.commit('setUser', {
      token: responseData.idToken,
      userId: responseData.localId,
      tokenExpiration: responseData.expiresIn,
    });
  },
};