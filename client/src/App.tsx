import * as React from "react";
import { Router, Route, Switch, BrowserRouter } from "react-router-dom";
import { createBrowserHistory } from "history";
// @ts-ignore
import Web3 from "web3";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";

// @ts-ignore
import { apiGetAccountAssets } from "./helpers/api";
import { getChainData } from "./helpers/utilities";
import { IAssetData } from "./helpers/types";

import { NFT_CONTRACT } from "./constants/contracts";

import Home from "./pages/home/index";
import Header from "./components/headerr";
import Footer from "./components/footer";

interface IAppState {
  fetching: boolean;
  address: string;
  web3: any;
  signer: any;
  provider: any;
  connected: boolean;
  chainId: number;
  networkId: number;
  assets: IAssetData[];
  showModal: boolean;
  pendingRequest: boolean;
  result: any | null;
  // my state
  isHide: boolean;
  isPresale: boolean;
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: "",
  web3: null,
  signer: null,
  provider: null,
  connected: false,
  chainId: 1,
  networkId: 1,
  assets: [],
  showModal: false,
  pendingRequest: false,
  result: null,
  isHide: true,
  isPresale: false,
};

function initWeb3(provider: any) {
  const web3: any = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  });
  return web3;
}

const history = createBrowserHistory();
class App extends React.Component<any, any> {
  // @ts-ignore
  public web3Modal: Web3Modal;
  public state: IAppState;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
    };

    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions(),
      theme: {
        background: "rgba(43, 51, 94, 0.9)",
        main: "rgb(250, 250, 250)",
        secondary: "rgba(250, 250, 250, 0.7)",
        border: "rgba(196, 196, 196, 0.3)",
        hover: "rgba(53, 61, 104, 0.75)",
      },
    });
  }

  public componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      // this.onConnect();
    }
    this.setState({ isHide: true });
  }

  public onConnect = async () => {
    this.setState({ isHide: true });
    const provider = await this.web3Modal.connect();
    await this.subscribeProvider(provider);
    const web3: any = initWeb3(provider);
    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];
    const networkId = await web3.eth.net.getId();
    const chainId = await web3.eth.chainId();
    const ethProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethProvider.getSigner();

    await this.setState({
      web3,
      signer,
      provider,
      connected: true,
      address,
      chainId,
      networkId,
    });
    await this.getAccountAssets();
    await this.updateState();
  };

  public subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }
    provider.on("close", () => this.resetApp());
    provider.on("accountsChanged", async (accounts: string[]) => {
      await this.setState({ address: accounts[0] });
      await this.getAccountAssets();
    });
    provider.on("chainChanged", async (chainId: number) => {
      const { web3 } = this.state;
      const networkId = await web3.eth.net.getId();
      await this.setState({ chainId, networkId });
      await this.getAccountAssets();
    });

    provider.on("networkChanged", async (networkId: number) => {
      const { web3 } = this.state;
      const chainId = await web3.eth.chainId();
      await this.setState({ chainId, networkId });
      await this.getAccountAssets();
    });
  };

  public getNetwork = () => getChainData(this.state.chainId).network;

  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            80001: "https://matic-mumbai.chainstacklabs.com",
          },
          infuraId: process.env.REACT_APP_INFURA_ID,
        },
      },
    };
    return providerOptions;
  };

  public getAccountAssets = async () => {
    const { address, chainId } = this.state;
    this.setState({ fetching: true });
    try {
      const assets = await apiGetAccountAssets(address, chainId);

      await this.setState({ fetching: false, assets });
    } catch (error) {
      console.error(error);
      await this.setState({ fetching: false });
    }
  };

  public addWhiteList = async (address: string, isAdded: number) => {
    const { signer } = this.state;
    try {
      const nftContract = new ethers.Contract(
        NFT_CONTRACT.address,
        NFT_CONTRACT.abi,
        signer
      );
      let tx;
      if (isAdded == 1) tx = await nftContract.removeFromWhiteList([address]);
      else if (isAdded == 2) tx = await nftContract.addToWhiteList([address]);
      await tx.wait();
      return true;
    } catch (error) {
      return false;
    }
  };

  public changeActiveState = async () => {
    const { signer } = this.state;
    try {
      const nftContract = new ethers.Contract(
        NFT_CONTRACT.address,
        NFT_CONTRACT.abi,
        signer
      );
      const status = await nftContract._isPreSaleActive();
      let tx = await nftContract.enablePreSale(!status);
      await tx.wait();
      await this.updateState();
      return true;
    } catch (error) {
      return false;
    }
  };

  public onValidate = async (address: string) => {
    const { signer } = this.state;
    try {
      const nftContract = new ethers.Contract(
        NFT_CONTRACT.address,
        NFT_CONTRACT.abi,
        signer
      );
      const status = await nftContract.onWhiteList(address);
      return status;
    } catch (error) {
      console.log("errorr", error);
      return false;
    }
  };

  public updateState = async () => {
    const { signer } = this.state;
    try {
      const nftContract = new ethers.Contract(
        NFT_CONTRACT.address,
        NFT_CONTRACT.abi,
        signer
      );
      const status = await nftContract._isPreSaleActive();
      this.setState({ isPresale: status });
    } catch (error) {
      console.log("errorr", error);
      return -1;
    }
  };

  public toggleModal = () =>
    this.setState({ showModal: !this.state.showModal });

  public resetApp = async () => {
    const { web3 } = this.state;
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await this.web3Modal.clearCachedProvider();
    this.setState({ ...INITIAL_STATE });
  };

  public _onHideMenu = (bool: boolean) => {
    this.setState({ isHide: bool });
  };

  public render = () => {
    const { connected, address, isPresale } = this.state;
    return (
      <div className="App">
        <BrowserRouter>
          <Header />
          <Router history={history}>
            <Switch>
              <Route
                exact
                path="/"
                render={() => (
                  <Home
                    changeActiveState={this.changeActiveState}
                    connect={this.onConnect}
                    killSession={this.resetApp}
                    connected={connected}
                    address={address}
                    isPresale={isPresale}
                    addWhiteList={this.addWhiteList}
                    onValidate={this.onValidate}
                  />
                )}
              />
            </Switch>
          </Router>
          <Footer />
        </BrowserRouter>
      </div>
    );
  };
}

export default App;
