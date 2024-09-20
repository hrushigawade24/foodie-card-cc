/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { SETUP_TYPE } = require('./Constants');
const logger = require('../logger')(module);
const config = require('../config/cred');

exports.buildCCPOrg = (orgName) => {
	try {
		let ccpPath ;
		if(config.SETUP == SETUP_TYPE.K8S){
			let org = this.getOrgName(orgName)
			let connection = 'connection-'+ org +'.json'
			ccpPath = path.resolve(__dirname, '..', 'connection-profiles', connection)
		}else{
			let org = orgName+ '.example.com';
			let connection = 'connection-'+orgName+'.json'
			ccpPath = path.resolve(__dirname, '..','..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', org, connection);
			console.log('ccpPath----', ccpPath)
		}
		logger.info({method:'buildCCPOrg'})
		
		const fileExists = fs.existsSync(ccpPath);
		if (!fileExists) {
			throw `Invalid OrgId, Please use the valid Spydra Blockchain OrgId`;
		}
		const contents = fs.readFileSync(ccpPath, 'utf8');

		// build a JSON object from the file contents
		const ccp = JSON.parse(contents);

		return ccp;
	} catch (error) {
		logger.error({method:'buildCCPOrg', error})
	}
	// load the common connection configuration file
};

// This method is used for getting k8s generated connection profiles.
// We need to make it more generic
exports.getOrgName = (orgName) => {

	switch (orgName) {
		case 'org1':
			return 'suppliers'
		case 'org2':
			return 'manufacturers'
		case 'org3':
			return 'distributors'
		default:
			return 'manufacturers'
	}
}


exports.buildWallet = async (Wallets, walletPath) => {
	try {
		logger.info({method:'buildWallet'})
	// Create a new  wallet : Note that wallet is for managing identities.
		let wallet;
		if (walletPath) {
			wallet = await Wallets.newFileSystemWallet(walletPath);
			console.log(`Built a file system wallet at ${walletPath}`);
		} else {
			wallet = await Wallets.newInMemoryWallet();
			console.log('Built an in memory wallet');
		}

		return wallet;
	} catch (error) {
		logger.error({method:'buildWallet', error})
	}
};

exports.prettyJSONString = (inputString) => {
	if (inputString) {
		 return JSON.stringify(JSON.parse(inputString), null, 2);
	}
	else {
		 return inputString;
	}
}
