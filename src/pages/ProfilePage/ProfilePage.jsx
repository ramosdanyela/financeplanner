import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";

function ProfilePage({ setLoading }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [img, setImg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading?.(true);
      try {
        const response = await api.get("/user/profile");
        setProfile(response.data);
        setForm({
          name: response.data.name || "",
          email: response.data.email || "",
          password: "",
          confirmPassword: "",
        });
        setImg(response.data.profileImage || null);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading?.(false);
      }
    }
    fetchData();
  }, [setLoading]);

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
      console.error("Error uploading image:", error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const imgURL = img instanceof File ? await handleUpload() : img;
      await api.put("/user/editprofile", { ...form, profileImage: imgURL });
      setIsEditing(false);
      setProfile({ ...form, profileImage: imgURL });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }

  return (
    <div className="mt-[100px] min-h-screen text-gray-600 flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white shadow-md text-gray-600 rounded-lg p-8 w-96">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-600">Profile</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="formName" className="mb-2 text-base text-left">
                Name
              </label>
              <input
                id="formName"
                name="name"
                type="text"
                value={form.name} // Corrigido para form.name
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your name"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="formImg" className="mb-2 text-base text-left">
                Your profile picture
              </label>
              <input id="formImg" type="file" onChange={handleImage} />
            </div>

            <div className="flex flex-col">
              <label htmlFor="formEmail" className="mb-2 text-base text-left">
                Email
              </label>
              <input
                id="formEmail"
                name="email"
                type="email"
                value={form.email} // Corrigido para form.email
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="formPassword"
                className="mb-2 text-base text-left"
              >
                Password
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
              <label
                htmlFor="formConfirmPassword"
                className="mb-2 text-base text-left"
              >
                Confirm Password
              </label>
              <input
                id="formConfirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Save
            </button>
          </form>
        ) : (
          <div className="text-left space-y-4">
            <div>
              <strong>Name:</strong> {profile.name}
            </div>
            <div>
              <strong>Email:</strong> {profile.email}
            </div>
            {profile.profileImage && (
              <div>
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
