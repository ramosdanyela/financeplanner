import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function HomePage() {

return (
    <div className=" mt-[200px] no-underline flex-col flex text-[#FFFFFF] font-bold">
    <Link to="/transactions" className="">
     See transactions
   </Link>
    </div>
)
}

export default HomePage;
