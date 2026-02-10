import { useState, useEffect } from "react";
import { api } from "../../api/api";

function ProfilePage({ setLoading }) {
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
    <div className="min-h-screen flex items-center justify-center px-lg py-xl">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between mb-xl">
          <h2 className="text-balance text-text-primary">Profile</h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-secondary">
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
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
                New password
              </label>
              <input
                id="formPassword"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="formConfirmPassword" className="label">
                Confirm password
              </label>
              <input
                id="formConfirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input w-full"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex gap-lg">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Save changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-lg">
            {profile.profileImage && (
              <div className="flex justify-center">
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-border-subtle"
                />
              </div>
            )}
            <div className="space-y-md">
              <div className="flex justify-between py-md border-b border-border-subtle">
                <span className="text-body text-text-secondary">Name</span>
                <span className="text-body text-text-primary font-medium">
                  {profile.name}
                </span>
              </div>
              <div className="flex justify-between py-md border-b border-border-subtle">
                <span className="text-body text-text-secondary">Email</span>
                <span className="text-body text-text-primary font-medium">
                  {profile.email}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
