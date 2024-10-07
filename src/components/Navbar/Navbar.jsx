import icon from "../../assets/icon.svg";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-[#3d423c] flex-auto w-full flex-row items-center text-[#FFFFFF] fixed top-0 left-0 z-[1000] h-[60px]">
      <div className="flex w-full items-center justify-between text-[#FFFFFF]  flex-row no-underline font-bold pr-[30px] pl-[30px]">
        <div>
          <Link to="/" className="no-underline cursor-default">
            Home
          </Link>
        </div>
        <div className="flex text-[#000000] items-center justify-center flex-row  ">
          {" "}
          <img
            className=" p-[5px] maw-w-[60px] max-h-[60px] rounded-ls"
            src={icon}
          />
          <h1 className="text-[#FFFFFF]">FINANCE PLANNER</h1>{" "}
        </div>{" "}
        <div className="no-underline flex-col flex text-[#FFFFFF] font-bold">
           <Link to="/login" className="">
            Login
          </Link>
          <Link to="/profile">
            Profile</Link>
         </div>
      </div>
    </nav>
  );
}

export default Navbar;
