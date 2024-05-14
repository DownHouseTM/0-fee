import { useState } from "react";
import { useAccount } from "wagmi";
import Marketplace from "./Marketplace";
import Listing from "./Listing";
import Mint from "./Mint";
import Donation from "./Donation";

export default function TabBar() {
  const [page, setPage] = useState("marketplace");
  const account = useAccount();

  if (account.isConnected) {
    return (
      <>
        <div className="fixed top-24 w-full bg-white">
          <div className="flex gap-2 p-2 shadow-lg shadow-black/5">
            <button
              onClick={() => setPage("marketplace")}
              disabled={page === "marketplace"}
              className={`p-2 disabled:font-bold disabled:text-bold disabled:border-b-4 disabled:border-b-black ${
                page !== "marketplace" &&
                "hover:text-gray-500 duration-300 transition"
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setPage("listing")}
              disabled={page === "listing"}
              className={`p-2 disabled:font-bold disabled:text-bold disabled:border-b-4 disabled:border-b-black ${
                page !== "listing" &&
                "hover:text-gray-500 duration-300 transition"
              }`}
            >
              Listing
            </button>
            <button
              onClick={() => setPage("mint")}
              disabled={page === "mint"}
              className={`p-2 disabled:font-bold disabled:text-bold disabled:border-b-4 disabled:border-b-black ${
                page !== "mint" && "hover:text-gray-500 duration-300 transition"
              }`}
            >
              Mint
            </button>
            <button
              onClick={() => setPage("donation")}
              disabled={page === "donation"}
              className={`p-2 disabled:font-bold disabled:text-bold disabled:border-b-4 disabled:border-b-black ${
                page !== "donation" &&
                "hover:text-gray-500 duration-300 transition"
              }`}
            >
              Donation
            </button>
          </div>
        </div>
        <div className="mt-44">
          {page === "marketplace" && <Marketplace />}
          {page === "listing" && <Listing />}
          {page === "mint" && <Mint />}
          {page === "donation" && <Donation />}
        </div>
      </>
    );
  } else {
    return <div className="text-center">Please connet wallet</div>;
  }
}
