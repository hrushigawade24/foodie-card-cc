/*
 * Copyright Paramount soft. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { getContractObject } = require('../../utils/util.js');
const { NETWORK_PARAMETERS, DOCTYPE } = require('../../utils/Constants.js');
const logger = require('../../logger/index.js')(module);
// const { formatReferences, formatAssetInput } = require('../../utils/FormatStruct');
// const AssetType = require('../../models/AssetType')

class TokenController {

	constructor() {
	}




	async mintToken(req, res, next) {
		try {
			console.log(`*******Minting Details *******`)

			let org = req.body.OrgName
			let user = req.body.UserId;
			let txId = req.body.TxnId;
			let id = req.body.Id
			let docType = req.body.DocType
			let amount = req.body.Amount
			let tokenDef = req.body

			
			console.log("org:", org,"userId:", user,", txId:", txId, ", id:", id, ", DocType:", docType, ", amount", amount )
			console.log("TokenDef--",tokenDef);
			

			const gateway = new Gateway();
			let contract = await getContractObject(org, user, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
			// let tokenData = JSON.parse(tokenDef);
			console.log(`----------Minting Start details------------`, org)
			let stateTxn = contract.createTransaction('Mint');
			// let tx = await stateTxn.submit(JSON.stringify(tokenDef));

			console.log("--------------------------------------");
			
	
			let tx = await stateTxn.submit(JSON.stringify(tokenDef));
			// let tx = await stateTxn.submit(tokenDef)
			console.log(`----------Minting Done Successfully & Minted Token - ${tx} ----------`);
			// let tx ='xxxxxxxxxxxxxxxxx'
			return res.status(200).send({
				status: true,
				message: `Minting Done Successfully & Minted Token -} `,
				txid: tx.toString()
			});

			


		} catch (error) {
			console.log(error.message)
			logger.error({ userInfo: req.loggerInfo, method: 'mintToken', error })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}
	}

	//transfer from Minter to receiver address
	async transferToken(req, res, next) {
		try {
			console.log('----------Transfer Details ----------')

			let org = req.body.OrgName
			let txId = req.body.TxnId;
			let id = req.body.Id
			let docType = req.body.DocType
			let amount = req.body.Amount
			let user = req.body.UserId
			let receiver = req.body.Receiver
			let tokenDef = req.body


			const gateway = new Gateway();
			let contract = await getContractObject(org, user, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
			// let tokenData = JSON.parse(tokenDef);
			console.log('----------Transfer Token Details------------\n', org)
			let stateTxn = contract.createTransaction('Transfer');
			// let tx = await stateTxn.submit(JSON.stringify(tokenDef));

			console.log("--------------------------------------");
			// console.log(`org-${org} user-${user} txId-${txId} id-${id} docType-${docType} amount-${amount} sender-${sender} receiver-${receiver}`);
			console.log("TokenDef",tokenDef);
			console.log("--------------------------------------");
			
			
				let tx = await stateTxn.submit(JSON.stringify(tokenDef));
			// let tx = await stateTxn.submit(receiver,amount)
			console.log(`---------- Transfer Done Successfully & From Minter to ${tokenDef.receiver} Token sent- ${tokenDef.amount} ----------`);
			// let tx ='xxxxxxxxxxxxxxxxx'
			return res.status(200).send({
				status: true,
				message: `Successfully Transferred Token to ${tokenDef.receiver}`,
				txid: tx.toString()
			});

			


		} catch (error) {
			console.log(error.message)
			logger.error({ userInfo: req.loggerInfo, method: 'transferToken', error })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}
	}


	async burnToken(req, res, next) {
		try {
			console.log(`*******Minting Details *******`)

			let org = req.body.OrgName
			let user = req.body.UserId;
			let txId = req.body.TxnId;
			let id = req.body.Id
			let docType = req.body.DocType
			let burnTokenId = req.body.BurnTokenId
			let burnTokenAmount = req.body.BurnTokenAmount
			let tokenDef = req.body

			
			console.log("org:", org,"userId:", user,", txId:", txId, ", id:", id, ", DocType:", docType, ", burnTokenId", burnTokenId,", burnTokenAmount", burnTokenAmount )
			console.log("TokenDef--",tokenDef);
			

			const gateway = new Gateway();
			let contract = await getContractObject(org, user, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
			// // let tokenData = JSON.parse(tokenDef);
			console.log(`----------Burn Token details------------`, org)
			let stateTxn = contract.createTransaction('Burn');
			// // let tx = await stateTxn.submit(JSON.stringify(tokenDef));

			// console.log("--------------------------------------");
			
	
			let tx = await stateTxn.submit(JSON.stringify(tokenDef));
			// let tx = await stateTxn.submit(tokenDef)
			console.log(`----------Burnt Token  Successfully ----------`);
			// let tx ='xxxxxxxxxxxxxxxxx'
			return res.status(200).send({
				status: true,
				message: `Burn Token Successfully `,
				txid: tx.toString()
			});

			


		} catch (error) {
			console.log(error.message)
			logger.error({ userInfo: req.loggerInfo, method: 'burnToken', error })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}
	}


	async getBalance(req, res, next) {
		try {
			console.log(`*******getBalance Details *******`)

			let org = req.body.OrgName
			let user = req.body.UserId;
			let id = req.body.Id
			let docType = req.body.DocType
			let tokenDef = req.body

			
			console.log("org:", org,"userId:", user )
			console.log("TokenDef--",tokenDef);
			

			const gateway = new Gateway();
			let contract = await getContractObject(org, user, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
			// // let tokenData = JSON.parse(tokenDef);
			console.log(`----------getBalance------------`, org)
			let stateTxn = contract.createTransaction('GetBalance');
			// // let tx = await stateTxn.submit(JSON.stringify(tokenDef));

			// console.log("--------------------------------------");
			
	
			// let tx = await stateTxn.submit(JSON.stringify(tokenDef));
			let tx = await stateTxn.submit(user,id)
			console.log(`----------getBalance fetch  Successfully ----------`);
			// let tx ='xxxxxxxxxxxxxxxxx'
			return res.status(200).send({
				status: true,
				message: `Balance fetch successfully `,
				balance: tx.toString()
			});

			


		} catch (error) {
			console.log(error.message)
			logger.error({ userInfo: req.loggerInfo, method: 'getBalance', error })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}
	}

	async getQuery(req, res, next) {
		try {
			console.log(`*******GetQuery Details *******`)

			let org = req.body.OrgName
			let user = req.body.UserId;
			// let txId = req.body.TxnId;
			let id = req.body.Id
			let docType = req.body.DocType
			// let burnTokenId = req.body.BurnTokenId
			// let burnTokenAmount = req.body.BurnTokenAmount
			let tokenDef = req.body

			
			// console.log("org:", org,"userId:", user,", txId:", txId, ", id:", id, ", DocType:", docType, ", burnTokenId", burnTokenId,", burnTokenAmount", burnTokenAmount )
			// console.log("TokenDef--",tokenDef);
			console.log("docType",docType);
			
			

			const gateway = new Gateway();
			let contract = await getContractObject(org, user, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
			// // let tokenData = JSON.parse(tokenDef);
			console.log(`----------GetQuery Token details------------`, org)
			let stateTxn = contract.createTransaction('GetQuery');
			// // let tx = await stateTxn.submit(JSON.stringify(tokenDef));

			// console.log("--------------------------------------");
			
	
			// let tx = await stateTxn.submit(JSON.stringify(tokenDef.docType));
			let tx = await stateTxn.submit(docType)
			console.log(`----------GetQuery Token  Successfully ----------`);
			// let tx ='xxxxxxxxxxxxxxxxx'
			return res.status(200).send({
				status: true,
				message: `GetQuery Fetch Successfully `,
				txid: tx.toString()
			});

			


		} catch (error) {
			console.log(error.message)
			logger.error({ userInfo: req.loggerInfo, method: 'getQuery', error })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}
	}


	async getAllOwner(req, res, next) {
		try {
			console.log(`*******getAllOwner Details *******`)

			let org = req.body.OrgName
			let user = req.body.UserId;
			let docType = req.body.DocType
			let tokenDef = req.body

			const gateway = new Gateway();
			let contract = await getContractObject(org, user, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
			// // let tokenData = JSON.parse(tokenDef);
			console.log(`----------getAllOwner details------------`, org)
			let stateTxn = contract.createTransaction('GetAllOwners');
			// // let tx = await stateTxn.submit(JSON.stringify(tokenDef));

			// console.log("--------------------------------------");
			
	
			// let tx = await stateTxn.submit(JSON.stringify(tokenDef.docType));
			let tx = await stateTxn.submit(docType)
			console.log(`----------getAllOwner Fetch  Successfully ----------`);
			// let tx ='xxxxxxxxxxxxxxxxx'
			return res.status(200).send({
				status: true,
				message: `getAllOwner Fetch Successfully `,
				txid: tx.toString()
			});

			


		} catch (error) {
			console.log(error.message)
			logger.error({ userInfo: req.loggerInfo, method: 'getAllOwner', error })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}
	}



	async getHistory(req, res, next) {
		try {
			console.log(`*******getHistory Details *******`)

			let org = req.body.OrgName
			let user = req.body.UserId;
			// let txId = req.body.TxnId;
			let id = req.body.Id
			// let docType = req.body.DocType
			// let burnTokenId = req.body.BurnTokenId
			// let burnTokenAmount = req.body.BurnTokenAmount
			let tokenDef = req.body

			
			// console.log("org:", org,"userId:", user,", txId:", txId, ", id:", id, ", DocType:", docType, ", burnTokenId", burnTokenId,", burnTokenAmount", burnTokenAmount )
			// console.log("TokenDef--",tokenDef);
			// console.log("docType",docType);
			
			

			const gateway = new Gateway();
			let contract = await getContractObject(org, user, NETWORK_PARAMETERS.CHANNEL_NAME, NETWORK_PARAMETERS.CHAINCODE_NAME, gateway)
			// // let tokenData = JSON.parse(tokenDef);
			console.log(`----------getHistory Token details------------`, org)
			let stateTxn = contract.createTransaction('GetAssetHistory');
			// // let tx = await stateTxn.submit(JSON.stringify(tokenDef));

			// console.log("--------------------------------------");
			
	
			// let tx = await stateTxn.submit(JSON.stringify(tokenDef.docType));
			let tx = await stateTxn.submit(id)
			console.log(`----------getHistory Token  Successfully ----------`);
			// let tx ='xxxxxxxxxxxxxxxxx'
			return res.status(200).send({
				status: true,
				message: `getHistory Fetch Successfully `,
				txid: tx.toString()
			});

			


		} catch (error) {
			console.log(error.message)
			logger.error({ userInfo: req.loggerInfo, method: 'getHistory', error })
			return res.status(500).send({
				status: false,
				message: error.message
			});
		}
	}




	
}


module.exports = TokenController;
