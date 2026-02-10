import { useState } from "react";
import { api } from "../../api/api";
import { useNavigate, Link } from "react-router-dom";

function SignUpPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [img, setImg] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleImage(event) {
    setImg(event.target.files[0]);
  }

  async function handleUpload() {
    const uploadData = new FormData();
    uploadData.append("picture", img);
    const response = await api.post("/upload-image/", uploadData);
    return response.data.url;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Upload only when user selected a file (avoids 500 when no image)
      const imgURL = img ? await handleUpload() : undefined;
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
      };
      if (imgURL) payload.profileImage = imgURL;

      await api.post("/user/sign-up", payload);
      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        "Error creating account. Please try again.";
      setError(
        typeof message === "string"
          ? message
          : message.join?.(" ") || "Error creating account. Please try again."
      );
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-lg py-xl">
      <div className="card w-full max-w-md">
        <h2 className="text-balance text-text-primary text-center mb-xl">
          Create account
        </h2>

        {error && (
          <div className="bg-text-outcome/10 border border-text-outcome text-text-outcome text-body px-lg py-md rounded-button mb-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div>
            <label htmlFor="formName" className="label">
              Name
            </label>
            <input
              id="formName"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="input w-full"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="formImg" className="label">
              Profile picture
            </label>
            <input
              id="formImg"
              type="file"
              onChange={handleImage}
              className="input w-full file:mr-lg file:py-sm file:px-lg file:rounded-button file:border-0 file:bg-accent-purple file:text-white file:cursor-pointer"
            />
          </div>

          <div>
            <label htmlFor="formEmail" className="label">
              Email
            </label>
            <input
              id="formEmail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input w-full"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="formPassword" className="label">
              Password
            </label>
            <input
              id="formPassword"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="input w-full"
              placeholder="Min 8 chars, 1 number, 1 upper, 1 lower, 1 of $*&@#"
            />
            <p className="text-small text-text-secondary mt-xs">
              At least 8 characters, one number, one uppercase, one lowercase,
              one of $*&@#
            </p>
          </div>

          <div>
            <label htmlFor="formConfirmPassword" className="label">
              Confirm password
            </label>
            <input
              id="formConfirmPassword"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="input w-full"
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Create account
          </button>
        </form>

        <p className="mt-xl text-center text-body text-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="text-text-link hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
