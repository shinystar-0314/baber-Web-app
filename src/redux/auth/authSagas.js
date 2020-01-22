import { takeLatest, call, put, all } from "redux-saga/effects";
import { toast } from "react-toastify";
import api from "../../services/api";
import history from "../../services/history";
import { signInSuccess, signFailure } from "./authActions";

export function* signIn({ payload }) {
  try {
    const { email, password } = payload;

    const response = yield call(api.post, "/sessions", {
      email,
      password
    });

    const { token, user } = response.data;

    if (!user.provider) {
      toast.error("Usuário não é prestador de serviços");
      return;
    }

    // Adds user token to headers on axios requests
    api.defaults.headers["Authorization"] = `Bearer ${token}`;

    yield put(signInSuccess(token, user));

    history.push("/dashboard");
  } catch (error) {
    toast.error("Falha na autenticação, verifique seus dados");
    yield put(signFailure());
  }
}

export function* signUp({ payload }) {
  try {
    const { name, email, password } = payload;

    yield call(api.post, "/users", {
      name,
      email,
      password,
      provider: true
    });

    history.push("/");
  } catch (error) {
    toast.error("Falha no cadastro, verifique seus dados");
    yield put(signFailure());
  }
}

// Gets token from action dispatched - redux persist "persist/REHYDRATE"
export function setToken({ payload }) {
  if (!payload) return;

  const { token } = payload.auth;

  if (token) {
    // Adds user token to headers on axios requests
    api.defaults.headers["Authorization"] = `Bearer ${token}`;
  }
}

export default all([
  takeLatest("persist/REHYDRATE", setToken),
  takeLatest("@auth/SIGN_IN_REQUEST", signIn),
  takeLatest("@auth/SIGN_UP_REQUEST", signUp)
]);
