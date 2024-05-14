import { useState, useEffect } from "react";
import { contracts } from "../contracts/contracts";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import DonationAbi from "../contracts/Donation.json";
import CreateRequestModal from "./Modals/CreateRequestModal";
import DonateModal from "./Modals/DonateModal";
import ManageRequestModal from "./Modals/ManageRequestModal";

export default function Donation() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  const { chain } = useAccount();
  return (
    <>
      {showCreateModal && (
        <CreateRequestModal chain={chain} onClose={handleCloseCreateModal} />
      )}
      <div className="p-4">
        <div className="flex w-full justify-center sm:justify-end p-6">
          <button
            className="w-full sm:w-fit p-2 border border-black bg-black text-white rounded-2xl hover:bg-white hover:text-black transition duration-300"
            onClick={() => setShowCreateModal(true)}
          >
            + Open Request
          </button>
        </div>
        <div className="mt-4 w-full p-4 border border-black rounded-2xl flex flex-col justify-center items-center">
          {showAllRequests === false && (
            <div className="flex w-full justify-end p-2">
              <button
                className="w-32 p-2 border border-black bg-black text-white rounded-2xl hover:bg-white hover:text-black transition duration-300"
                onClick={() => setShowAllRequests(true)}
              >
                {showAllRequests === true ? "Refresh" : "Get Active requests"}
              </button>
            </div>
          )}
          {showAllRequests && <GetAllRequests />}
        </div>
      </div>
    </>
  );
}

function GetAllRequests() {
  const { chain, address } = useAccount();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  const [requestToDonate, setRequestToDonate] = useState(null);
  const [requestToManage, setRequestToManage] = useState(null);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    if (!requestToDonate) return;
    setShowDonateModal(true);
  }, [requestToDonate]);

  useEffect(() => {
    if (!requestToManage) return;
    setShowManageModal(true);
  }, [requestToManage]);

  const {
    data: allRequests,
    isPending,
    isLoading,
    isFetching,
    isError,
    isSuccess,
  } = useReadContract({
    address: contracts[chain.id].donation.address,
    abi: DonationAbi,
    functionName: "getAllRequests",
  });

  const handleCloseDonateModal = () => {
    setShowDonateModal(false);
    setRequestToDonate(null);
  };

  const handleCloseManageModal = () => {
    setShowManageModal(false);
    setRequestToManage(null);
  };

  useEffect(() => {
    if (!isSuccess) return;
    if (allRequests.length === 0) return;

    const _myRequests = allRequests.filter(
      (req) => req.beneficiary.toLowerCase() === address.toLowerCase()
    );
    setMyRequests(_myRequests);
  }, [isSuccess]);

  if (isError)
    return (
      <div className="flex w-full justify-center items-center">
        <p className="text-rose-500">Error occured :"{"("}</p>
      </div>
    );

  if (isPending || isLoading || isFetching)
    return (
      <div className="flex w-full justify-center items-center">
        <p>Please wait...</p>
      </div>
    );

  return (
    <>
      {showDonateModal && requestToDonate && (
        <DonateModal
          requestToDonate={requestToDonate}
          chain={chain}
          onClose={handleCloseDonateModal}
        />
      )}
      {showManageModal && requestToManage && (
        <ManageRequestModal
          requestToManage={requestToManage}
          chain={chain}
          onClose={handleCloseManageModal}
        />
      )}
      {allRequests?.length == 0 && (
        <div className="w-full text-center">
          <p className="text-center text-rose-500">Nothing to donate :{"("}</p>
        </div>
      )}

      <div className="w-full">
        <div className="w-full">
          {myRequests.length > 0 && (
            <h1 className="font-bold mb-4">Requests by you:</h1>
          )}
          {myRequests.map((req, i) => (
            <div
              key={`my-req-${i}`}
              className="p-2 my-2 flex flex-col sm:flex-row w-full border border-black rounded-2xl"
            >
              <div className="flex-auto">
                <p>Request Id: {parseInt(req.id)}</p>

                <p>
                  Value to claim: {formatEther(req.value)}{" "}
                  {chain.nativeCurrency.symbol}
                </p>
              </div>
              <div>
                <button
                  onClick={() => setRequestToManage(req)}
                  className="mt-2 sm:mt-0 w-full sm:w-fit p-2 border border-black rounded-2xl bg-black hover:bg-white text-white hover:text-black transition duration-300"
                >
                  Manage/Collect
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full mt-6">
          {allRequests?.length > 0 && (
            <>
              <h1 className="font-bold mb-4">All Requests</h1>
              {allRequests?.map((req, i) => (
                <div
                  key={`all-req-${i}`}
                  className="p-2 my-2 flex flex-col sm:flex-row w-full border border-black rounded-2xl"
                >
                  <div className="flex-auto">
                    <p>Request Id: {parseInt(req.id)}</p>
                    <p>
                      Value: {formatEther(req.value)}{" "}
                      {chain.nativeCurrency.symbol}
                    </p>
                    <p className="break-all">
                      Requested By:{" "}
                      <span className="text-xs">{req.beneficiary}</span>{" "}
                    </p>
                    {req.beneficiary.toLowerCase() ===
                      address.toLowerCase() && (
                      <p className="text-blue-500">{"(Requested by YOU)"}</p>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => setRequestToDonate(req)}
                      className="mt-2 sm:mt-0 w-full sm:w-32 p-2 border border-black rounded-2xl bg-black hover:bg-white text-white hover:text-black transition duration-300"
                    >
                      Donate
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
