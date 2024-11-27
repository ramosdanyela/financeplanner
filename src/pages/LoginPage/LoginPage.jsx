import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const { setLoggedInUser } = useContext(AuthContext);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await api.post("/user/login", form);
      console.log("Response.data:", response.data);

      localStorage.setItem("loggedInUser", JSON.stringify(response.data));
      setLoggedInUser({ ...response.data });

      navigate("/profile");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="mt-[100px] flex flex-col justify-center items-center">
      <div className=" flex-grow items-center bg-white shadow-md text-gray-600 rounded-lg p-8 w-96 flex-auto flex-col">
      <h2 className="text-2xl font-bold text-gray-600 mb-6 text-center"> Login </h2>

    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="flex flex-col">
        {" "}
        <label htmlFor="email" className="mb-2 text-sm text-left text-gray-600 ">
          Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 bg-gray-100  rounded-lg focus:outline-none focus: ring-2 focus:ring-blue-400"
          placeholder="Enter your email"
        />{" "}
      </div>
      <div className="flex flex-col">
        <label htmlFor="password" className="mb-2 text-sm text-left text-gray-600">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        className="px-4 py-2 border border-gray-300 bg-gray-100 text-gray-600 rounded-lg focus:outline-none focus: ring-2 focus:ring-blue-400"
          placeholder="Enter your password"
        />
      </div>
      <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-300">Login</button>
    </form>

<p className="mt-4 text-center text-sm text-gray-600"> Don't have an account? {"  "}
  <a href="/sign-up" className="text-blue-500 hover:underline"> Sign up </a>
</p>

    </div>
    </div>
  );
}

export default LoginPage;
