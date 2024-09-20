/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, enrollAdmin } = require('./utils/CAUtil.js');
const { buildCCPOrg, buildWallet } = require('./utils/AppUtil.js');
const logger = require('./logger/');

const mspOrg1 = 'Org1MSP';
const mspOrg2 = 'Org2MSP';

async function connectToOrgCA(orgName) {

   try {
    logger.info('connectToOrgCA')
    let caOrg = 'ca.' + orgName + '.example.com';
    let walletPath = 'wallet/' + orgName;
    let mspOrg;

    switch (orgName) {

        case 'org1':
            mspOrg = 'Org1MSP';
            break;
        case 'org2':
            mspOrg = 'Org2MSP';
            break;
        case 'org3':
            mspOrg = 'Org2MSP';
            break;
        default:
            break;
    }


    console.log('\n--> Enrolling the Org1 CA admin');
    const ccpOrg = buildCCPOrg(orgName);
    const caOrgClient = buildCAClient(FabricCAServices, ccpOrg, caOrg);

    const walletPathOrg = path.join(__dirname, walletPath);
    const walletOrg = await buildWallet(Wallets, walletPathOrg);

    await enrollAdmin(caOrgClient, walletOrg, mspOrg);
   } catch (error) {
    logger.error('connectToOrgCA', error)
   }

}

async function main() {

    if (process.argv[2] == undefined) {
        console.log("Usage: node enrollAdmin.js Org");
        process.exit(1);
    }

    const org = process.argv[2];
    logger.info('Main')
    try {

        if (org == 'org1' || org == 'org2' || org == 'org3') {
            await connectToOrgCA(org);
        } else {
            console.log("Usage: node registerUser.js org userID");
            console.log("Org must be Org1 or Org2");
        }
    } catch (error) {
        console.error(`Error in enrolling admin: ${error}`);
        logger.error('Main', error)
        process.exit(1);
    }
}

main();
