import icon from "../../assets/icon.svg";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";
import { useContext, useState, useEffect } from "react";

function Navbar() {
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  function handleLogOut() {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    setIsDropdownOpen(false);
    navigate("/login");
  }

  function toggleDropdown(event) {
    event.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  }

  return (
    <nav className="bg-[#252525] flex-auto w-full flex-row items-center text-[#FFFFFF] fixed top-0 left-0 z-[1000] h-[60px]">
      <div className="flex w-full items-center justify-between text-[#FFFFFF]  flex-row no-underline font-bold pr-[30px] pl-[30px]">
        <div>
          <Link to="/" className="no-underline cursor-default">
            Home
          </Link>
        </div>
        <div className="flex text-[#000000] items-center justify-center flex-row  ">
          {" "}
          <img
            className=" p-[5px] max-w-[60px] max-h-[60px] rounded-ls"
            src={icon}
          />
          <h1 className="text-[#FFFFFF]">FINANCE PLANNER</h1>{" "}
        </div>{" "}
        <div className="no-underline flex-row flex text-[#FFFFFF] font-bold">
          {!loggedInUser ? (
            <>
              <Link to="/sign-up" className="mr-[15px] no-underline">
                Create account
              </Link>
              <Link to="/login" className="no-underline">
                Login
              </Link>
            </>
          ) : (
            <>
              <div className="mr-[5px] flex flex-row items-center">
                <div className="mr-[5px]">
                  {" "}
                  <Link to="/transactions">Transactions</Link>{" "}
                </div>
                <div>
                  <Link to="/charts">Charts</Link>
                </div>
              </div>

              <div className="dropdown-container relative">
                <img
                  className="p-[5px] maw-w-[60px] max-h-[60px] rounded-full cursor-pointer"
                  src={
                    loggedInUser?.profileImage ||
                    "https://res.cloudinary.com/dcj6uxtqe/image/upload/v1729036082/profpic_htzaix.jpg"
                  }
                  onClick={toggleDropdown}
                />

                {isDropdownOpen && (
                  <div className="flex flex-col shadow-current">
                    <ul>
                      <li>
                        <Link to="/profile" className=" cursor-pointer block">
                          Profile
                        </Link>
                      </li>
                      <li
                        className="cursor-pointer block"
                        onClick={handleLogOut}
                      >
                        LogOut
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
