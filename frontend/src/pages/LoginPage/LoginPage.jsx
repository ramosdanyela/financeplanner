import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
import { api } from "../../api/api";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setLoggedInUser } = useContext(AuthContext);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const isDev = import.meta.env.DEV;
    const useDevLogin = isDev && !form.password.trim();

    try {
      const endpoint = useDevLogin ? "/user/dev-login" : "/user/login";
      const payload = useDevLogin ? { email: form.email } : form;
      const response = await api.post(endpoint, payload);
      localStorage.setItem("loggedInUser", JSON.stringify(response.data));
      setLoggedInUser({ ...response.data });
      navigate("/profile");
    } catch (error) {
      const msg = error.response?.data?.message;
      setError(
        msg ||
          (useDevLogin
            ? "E-mail não cadastrado. Crie uma conta em Sign up primeiro."
            : "Invalid email or password")
      );
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-lg">
      <div className="card w-full max-w-md">
        <h2 className="text-balance text-text-primary text-center mb-xl">
          Welcome back
        </h2>

        {error && (
          <div className="bg-text-outcome/10 border border-text-outcome text-text-outcome text-body px-lg py-md rounded-button mb-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-lg">
          {import.meta.env.DEV && (
            <div className="bg-text-income/10 border border-text-income text-text-income text-body px-lg py-md rounded-button mb-lg">
              Modo local: deixe a senha em branco para entrar só com o e-mail.
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input w-full"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input w-full"
              placeholder={import.meta.env.DEV ? "Opcional em local" : "Enter your password"}
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {import.meta.env.DEV && !form.password ? "Entrar (sem senha)" : "Login"}
          </button>
        </form>

        <p className="mt-xl text-center text-body text-text-secondary">
          Don't have an account?{" "}
          <Link to="/sign-up" className="text-text-link hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
