import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";

function ProfilePage() {
  const navigate = useNavigate();

  const { loggedInUser } = useContext(AuthContext);

  if (!loggedInUser || !loggedInUser.user || !loggedInUser.user._doc) {
    return <p>Carregando...</p>; // Renderiza algo enquanto `loggedInUser` não está disponível
  }

  const idUser = loggedInUser.user._id;

  function handleLogOut() {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  }

  return (
    <div className="flex justify-center text-gray-600 items-center h-screen" >
      <div className="w-80 p-6 bg-white shadow-md rounded-lg text-center">
      <h1 className="text-2xl font-semibold mb-4">{loggedInUser.user._doc.name}</h1>
      <p className="text-gray-600 mb-6">{loggedInUser.user._doc.email}</p>

      <button onClick={handleLogOut} className="px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition duration-200">Logout</button>
      </div>
      </div> 
  );
}

export default ProfilePage;
