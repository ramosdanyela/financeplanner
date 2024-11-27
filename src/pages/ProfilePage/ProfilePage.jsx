import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";

function ProfilePage(setLoading) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
  });

  const [img, setImg] = useState({ profileImage: profile.img });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get("/user/profile");
        setProfile(response.data);
        setForm({ name: response.data.name, email: response.data.email });
        setImg({ profileImage: response.data.profileImage });
      } catch (error) {
        console.error("Error fetching data", error);
      }
    }
    fetchData();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleImage(event) {
    setImg(event.target.files[0]);
  }

  async function handleUpload() {
    try {
      const uploadData = new FormData();
      uploadData.append("picture", img);

      const response = await api.post("/upload-image/", uploadData);

      return response.data.url;
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const imgURL = await handleUpload();

      await api.put("/user/editprofile", { ...form, profileImage: imgURL });
      navigate("login");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="mt-[100px] min-h-screen text-gray-600 flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white shadow-md text-gray-600 rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold text-gray-600 mb-6 text-center">
          {" "}
          Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="formName" className="mb-2 text-base text-left">
              Name
            </label>
            <input
              id="formName"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your name"
            />
          </div>

          <div className="flex flex-col">
            {" "}
            <label htmlFor="formImg" className="mb-2 text-base text-left">
              {" "}
              Your profile picture{" "}
            </label>
            <input id="formImg" type="file" onChange={handleImage} />
          </div>

          <div className="flex flex-col">
            {" "}
            <label htmlFor="formEmail" className="mb-2 text-base text-left">
              {" "}
              E-mail{" "}
            </label>
            <input
              id="formEmail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="formPassword" className="mb-2 text-base text-left">
              {" "}
              Password:{" "}
            </label>
            <input
              id="formPassword"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex flex-col">
            {" "}
            <label
              htmlFor="formConfirmPassword"
              className="mb-2 text-base text-left"
            >
              Password Confirmation{" "}
            </label>
            <input
              id="formConfirmPassword"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            {" "}
            Cadastrar
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {" "}
          Already have an account? {"  "}
          <a href="/login" className="text-blue-500 hover:underline">
            {" "}
            Log in{" "}
          </a>{" "}
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;
