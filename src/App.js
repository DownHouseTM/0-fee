import Web3Wrapper from "./components/Web3Wrapper";
import MpConnectButton from "./components/MpConnectButton";
import TabBar from "./components/TabBar";

function App() {
  return (
    <Web3Wrapper>
      <nav className="bg-white top-0 w-full h-24 fixed p-4 border-b border-b-black">
        <div className="flex items-center">
          <p className="flex-auto font-bold text-2xl">0-Fee NFT Marketplace</p>
          <MpConnectButton />
        </div>
      </nav>
        <TabBar />

    </Web3Wrapper>
  );
}

export default App;
