let timer;

export default {
  async logIn(context, payload) {
    return context.dispatch('auth', {
      ...payload,
      mode: 'login',
    });
  },
  async signUp(context, payload) {
    return context.dispatch('auth', {
      ...payload,
      mode: 'signup',
    });
  },
  async auth(context, payload) {
    const mode = payload.mode;
    let url =
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDjA_gAnz93zDbRrm3JvqwLkD3cG47fUNU';

    if (mode === 'signup') {
      url =
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDjA_gAnz93zDbRrm3JvqwLkD3cG47fUNU';
    }

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        returnSecureToken: true,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.message || 'Failed to authenticate! Check your login data.'
      );
    }

    const expiresIn = +responseData.expiresIn * 1000;
    const expirationDate = new Date().getTime() + expiresIn;

    localStorage.setItem('token', responseData.idToken);
    localStorage.setItem('userId', responseData.localId);
    localStorage.setItem('tokenExpiration', expirationDate);

    timer = setTimeout(() => {
      context.dispatch('autoLogOut');
    }, expiresIn);

    context.commit('setUser', {
      token: responseData.idToken,
      userId: responseData.localId,
    });
  },
  tryLogIn(context) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const tokenExpiration = localStorage.getItem('tokenExpiration');

    const expiresIn = +tokenExpiration - new Date().getTime();

    if (expiresIn < 0) {
      return;
    }

    timer = setTimeout(() => {
      context.dispatch('autoLogOut');
    }, expiresIn);

    if (token && userId) {
      context.commit('setUser', {
        token,
        userId,
      });
    }
  },
  logOut(context) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('tokenExpiration');

    clearTimeout(timer);

    context.commit('setUser', {
      token: null,
      userId: null,
    });
    context.commit('setAutoLogOut');
  },
  autoLogOut(context) {
    context.dispatch('logOut');
    context.commit('setAutoLogOut');
  },
};
