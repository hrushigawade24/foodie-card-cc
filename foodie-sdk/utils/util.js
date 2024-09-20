const { Gateway, Wallet, Wallets } = require("fabric-network");
const { buildWallet, buildCCPOrg, getOrgName } = require("./AppUtil");
const path = require('path');
const config = require('../config/cred');
const { SETUP_TYPE } = require("./Constants");
const logger = require('../logger')(module);

const getContractObject = async (orgName, user, channelName, contractName, gateway) => {


  let walletPath;
  if(config.SETUP == SETUP_TYPE.K8S){
		let org = getOrgName(orgName)
		walletPath  = '../../wallet/'+org;
	}else {
		walletPath  = '../wallet/'+orgName;
	}

  const ccp = buildCCPOrg(orgName);
  console.log(ccp)
  const walletPathOrg = path.join(__dirname, walletPath);
  const wallet = await buildWallet(Wallets, walletPathOrg);
  
  let discoverAsLocalHost = true;
  config.DISCOVERY_AS_LOCALHOST == 'false' ? discoverAsLocalHost = false : discoverAsLocalHost = true
  await gateway.connect(ccp,
    { wallet: wallet, identity: user, discovery: { enabled: true, asLocalhost: discoverAsLocalHost } });
  const network = await gateway.getNetwork(channelName);
  const contract = network.getContract(contractName);
  return contract
}



module.exports = {
  getContractObject,
}