package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type FOODIE struct {
	OrgName     string `json:"OrgName"`
	UserId      string `json:"UserId"`
	TxnID       string `json:"TxnId"`
	ID          string `json:"Id"`
	DocType     string `json:"DocType"`
	Amount      int    `json:"Amount"`
	TotalSupply int    `json:"TotalSupply"`
}

type TRANSFER struct {
	TxnID    string `json:"TxnId"`
	ID       string `json:"Id"`
	DocType  string `json:"DocType"`
	Amount   int    `json:"Amount"`
	UserId   string `json:"UserId"`
	Receiver string `json:"Receiver"`
}

type TXN struct {
	UserID  string `json:"UserId"`
	TxnID   string `json:"TxnId"`
	ID      string `json:"Id"`
	DocType string `json:"DocType"`
	Amount  int    `json:"Amount"`
}

type OWNERSTRUCT struct {
	ID      string `json:"Id"`
	UserID  string `json:"UserId"`
	DocType string `json:"DocType"`
	Amount  int    `json:"Amount"`
}

type BURNTOKEN struct {
	OrgName         string `json:"OrgName"`
	TxnID           string `json:"TxnId"`
	ID              string `json:"Id"`
	DocType         string `json:"DocType"`
	UserID          string `json:"UserId"`
	BurnTokenID     string `json:"BurnTokenId"`
	BurnTokenAmount int    `json:"BurnTokenAmount"`
}

type BURNTXN struct {
	TxnID           string `json:"TxnId"`
	ID              string `json:"Id"`
	DocType         string `json:"DocType"`
	UserID          string `json:"UserId"`
	BurnTokenID     string `json:"BurnTokenId"`
	BurnTokenAmount int    `json:"BurnTokenAmount"`
}

type HistoryQueryResult struct {
	Record    *FOODIE   `json:"record"`
	TxId      string    `json:"txId"`
	Timestamp time.Time `json:"timestamp"`
	IsDelete  bool      `json:"isDelete"`
}

const MINTTXN = "MINTTX"
const OWNER = "OWNER"
const TRANSFERTXN = "TRANSFERTXN"
const DOCTYPE = "foodie"
const BURN = "BURNTXN"

func (s *SmartContract) Mint(ctx contractapi.TransactionContextInterface, input string) error {
	// Unmarshal the input JSON into a foodieInput structure
	var foodieInput FOODIE
	err := json.Unmarshal([]byte(input), &foodieInput)
	if err != nil {
		return fmt.Errorf("failed to unmarshal input: %w", err)
	}
	fmt.Println("Unmarshaled input data:", foodieInput)

	// Retrieve the client's MSPID
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSPID: %w", err)
	}
	fmt.Println("Client MSPID:", clientMSPID)

	// Ensure only Org1 is authorized to mint tokens
	if clientMSPID != "Org1MSP" {
		return fmt.Errorf("client is not authorized to mint new tokens")
	}

	// Get the user's role (Minter or student)
	getUserRole, _, err := ctx.GetClientIdentity().GetAttributeValue("UserRole")
	if err != nil {
		return err
	}

	// Ensure only Minter can mint tokens
	if getUserRole != "Minter" {
		return fmt.Errorf("only Minter can mint the token")
	}

	// Retrieve the minter's ID
	minter, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get minter ID")
	}
	fmt.Println("Minter ID:", minter)

	// Validate that the mint amount is greater than zero
	if foodieInput.Amount <= 0 {
		return fmt.Errorf("mint amount must be greater than zero")
	}

	// Create a transaction object for minting
	var txn TXN
	txn.ID = foodieInput.ID
	txn.UserID = foodieInput.UserId
	txn.Amount = foodieInput.Amount
	txn.DocType = MINTTXN
	txn.TxnID = foodieInput.TxnID

	// Create a composite key for the transaction
	indexName := "TxnID~" + DOCTYPE //DOCTYPE = foodie
	TxnCompositeKey, err := ctx.GetStub().CreateCompositeKey(indexName, []string{txn.TxnID, txn.ID})
	if err != nil {
		return err
	}

	// Check for duplicate transactions
	checkTxnDuplication, err := ctx.GetStub().GetState(TxnCompositeKey)
	if err != nil {
		return fmt.Errorf("error checking transaction duplication: %w", err)
	}

	if checkTxnDuplication != nil {
		fmt.Println("Duplicate transaction found")
		return fmt.Errorf("duplicate transaction")
	}

	// Retrieve the current state for the given foodieInput.ID
	forTotalSupply, err := ctx.GetStub().GetState(foodieInput.ID)
	if err != nil {
		return err
	}
	fmt.Println("Current total supply state:", string(forTotalSupply))

	// Update the total supply based on current state
	if forTotalSupply == nil {
		foodieInput.TotalSupply = foodieInput.Amount
	} else {
		var currFoodie FOODIE
		err = json.Unmarshal(forTotalSupply, &currFoodie)
		if err != nil {
			return fmt.Errorf("failed to unmarshal total supply: %w", err)
		}
		// Update the total supply
		foodieInput.TotalSupply = currFoodie.TotalSupply + foodieInput.Amount
		fmt.Println("Updated total supply:", foodieInput)
	}

	// Add the balance to the owner's account
	err = addBalance(ctx, foodieInput.UserId, foodieInput.ID, foodieInput.Amount)
	if err != nil {
		return err
	}

	// Marshal the foodieInput and store it on the ledger
	foodieAsByte, err := json.Marshal(foodieInput)
	if err != nil {
		return fmt.Errorf("failed to marshal foodieInput: %w", err)
	}

	err = ctx.GetStub().PutState(foodieInput.ID, foodieAsByte)
	if err != nil {
		return fmt.Errorf("failed to store foodie state: %v", err)
	}

	// Marshal the transaction and store it on the ledger
	TXNAsByte, err := json.Marshal(txn)
	if err != nil {
		return fmt.Errorf("failed to marshal transaction: %w", err)
	}

	err = ctx.GetStub().PutState(TxnCompositeKey, TXNAsByte)
	if err != nil {
		return fmt.Errorf("failed to store transaction state: %v", err)
	}

	return nil
}

func (s *SmartContract) Transfer(ctx contractapi.TransactionContextInterface, input string) error {
	// Unmarshal the input JSON into a transferInput structure
	var transferInput TRANSFER
	err := json.Unmarshal([]byte(input), &transferInput)
	if err != nil {
		return fmt.Errorf("failed to unmarshal input: %w", err)
	}
	fmt.Println("Unmarshaled input data:", transferInput)

	// Ensure the transfer amount is positive
	if transferInput.Amount <= 0 {
		return fmt.Errorf("transfer amount must be greater than zero")
	}

	//DocType change TransferTxn
	var txn TRANSFER
	txn.DocType = TRANSFERTXN
	txn.ID = transferInput.ID
	txn.Amount = transferInput.Amount
	txn.TxnID = transferInput.TxnID
	txn.Receiver = transferInput.Receiver
	txn.UserId = transferInput.UserId

	// Create a composite key for the transaction
	indexName := "TxnID~" + DOCTYPE
	TxnCompositeKey, err := ctx.GetStub().CreateCompositeKey(indexName, []string{txn.TxnID, txn.ID})
	if err != nil {
		return err
	}

	// Check if the transaction already exists
	checkTxnDuplication, err := ctx.GetStub().GetState(TxnCompositeKey)
	if err != nil {
		return fmt.Errorf("error checking transaction duplication: %w", err)
	}
	fmt.Println("Transaction composite key:", checkTxnDuplication)

	// Validate for duplicate transactions
	if checkTxnDuplication != nil {
		fmt.Println("Duplicate transaction found")
		return fmt.Errorf("duplicate transaction")
	}

	// Remove the specified balance from the owner's account
	err = removeBalance(ctx, transferInput.UserId, transferInput.ID, transferInput.Amount)
	if err != nil {
		return err
	}

	// Add the specified balance to the receiver's account
	err = addBalance(ctx, transferInput.Receiver, transferInput.ID, transferInput.Amount)
	if err != nil {
		return err
	}

	// Marshal the transaction input and store it on the ledger
	TXNAsByte, err := json.Marshal(txn)
	if err != nil {
		return fmt.Errorf("failed to marshal transfer input: %w", err)
	}

	err = ctx.GetStub().PutState(TxnCompositeKey, TXNAsByte)
	if err != nil {
		return fmt.Errorf("failed to store composite key state: %v", err)
	}

	return nil
}

func (s *SmartContract) Burn(ctx contractapi.TransactionContextInterface, input string) error {
	// Unmarshal input JSON into burnTokenInput structure
	var burnTokenInput BURNTOKEN
	err := json.Unmarshal([]byte(input), &burnTokenInput)
	if err != nil {
		return fmt.Errorf("failed to unmarshal input: %w", err)
	}
	fmt.Println("Unmarshaled input data:", burnTokenInput)

	// Retrieve client's MSPID
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSPID: %w", err)
	}
	fmt.Println("Client MSPID:", clientMSPID)

	// Get the user's role
	getUserRole, _, err := ctx.GetClientIdentity().GetAttributeValue("UserRole")
	if err != nil {
		return err
	}
	fmt.Println("Get User Role - ", getUserRole)

	// Authorize only specific roles to burn tokens
	if getUserRole != "Minter" && clientMSPID != "Org1MSP" {
		return fmt.Errorf("client is not authorized to burn tokens or contact college")
	}

	// Create a burn transaction object
	var burntxn BURNTXN
	burntxn.ID = burnTokenInput.ID
	burntxn.UserID = burnTokenInput.UserID
	burntxn.BurnTokenID = burnTokenInput.BurnTokenID
	burntxn.DocType = BURN
	burntxn.TxnID = burnTokenInput.TxnID
	burntxn.BurnTokenAmount = burnTokenInput.BurnTokenAmount

	// Create a composite key for the transaction
	indexName := "TxnID~" + DOCTYPE
	TxnCompositeKey, err := ctx.GetStub().CreateCompositeKey(indexName, []string{burntxn.TxnID, burntxn.ID})
	if err != nil {
		return err
	}

	// Check for duplicate transactions
	checkTxnDuplication, err := ctx.GetStub().GetState(TxnCompositeKey)
	if err != nil {
		return fmt.Errorf("error checking transaction duplication: %w", err)
	}
	if checkTxnDuplication != nil {
		fmt.Println("Duplicate transaction found")
		return fmt.Errorf("duplicate transaction")
	}

	// Burn the specified amount of tokens
	err = removeBalance(ctx, burnTokenInput.BurnTokenID, burnTokenInput.ID, burnTokenInput.BurnTokenAmount)
	if err != nil {
		return err
	}

	// Retrieve the current total supply
	forTotalSupply, err := ctx.GetStub().GetState(burnTokenInput.ID)
	if err != nil {
		return err
	}
	fmt.Println("Current total supply state:", string(forTotalSupply))

	var currFoodie FOODIE
	// Unmarshal the total supply state
	err = json.Unmarshal(forTotalSupply, &currFoodie)
	if err != nil {
		return fmt.Errorf("failed to unmarshal total supply: %w", err)
	}

	// Ensure total supply is not nil
	if forTotalSupply == nil {
		return fmt.Errorf("total supply is nil")
	} else {
		// Decrease the total supply by the burned amount
		currFoodie.TotalSupply -= burnTokenInput.BurnTokenAmount
		fmt.Println("Updated total supply:", currFoodie)
	}

	// Marshal the updated foodie state for storage
	foodieAsByte, err := json.Marshal(currFoodie)
	if err != nil {
		return fmt.Errorf("failed to marshal foodie input: %w", err)
	}

	// Store the updated foodie state on the ledger
	err = ctx.GetStub().PutState(currFoodie.ID, foodieAsByte)
	if err != nil {
		return fmt.Errorf("failed to store foodie state: %v", err)
	}

	// Marshal the burn transaction for storage
	TXNAsByte, err := json.Marshal(burntxn)
	if err != nil {
		return fmt.Errorf("failed to marshal transaction: %w", err)
	}

	// Store the burn transaction state on the ledger
	err = ctx.GetStub().PutState(TxnCompositeKey, TXNAsByte)
	if err != nil {
		return fmt.Errorf("failed to store transaction state: %v", err)
	}

	return nil
}

func (s *SmartContract) GetBalance(ctx contractapi.TransactionContextInterface, user string, id string) (int, error) {

	// Create a composite key for the owner entry
	var indexName = DOCTYPE + "~Owner"
	ownerKey, err := ctx.GetStub().CreateCompositeKey(indexName, []string{id, user})
	if err != nil {
		return 0, fmt.Errorf("failed to create composite key in add balance: %w", err)
	}
	fmt.Println("Owner key for adding balance:", ownerKey)

	// Retrieve the current state from the ledger
	checkOwnerEntry, err := ctx.GetStub().GetState(ownerKey)
	if err != nil {
		return 0, fmt.Errorf("failed to fetch owner entry: %w", err)
	}
	fmt.Println("Current owner entry state:", string(checkOwnerEntry))

	var checkOwner OWNERSTRUCT
	if checkOwnerEntry != nil {
		// Unmarshal the existing data from the ledger
		err = json.Unmarshal(checkOwnerEntry, &checkOwner)
		if err != nil {
			return 0, fmt.Errorf("failed to unmarshal existing owner entry: %w", err)
		}
		fmt.Printf("Owner balance for user %s is %d - \n", user, checkOwner.Amount)
	}

	return checkOwner.Amount, nil
}

// get History foodie
// list of owners
// GetQuery retrieves transactions based on the specified owner.
// It constructs a query string to select documents of type "TRANSFERTXN" for the given owner.
func (s *SmartContract) GetQuery(ctx contractapi.TransactionContextInterface, owner string) ([]*TXN, error) {
	// Construct the query string to select transactions for the specified owner.
	queryString := fmt.Sprintf(`{"selector":{"DocType":"%s"}}`, owner)
	
	// Execute the query and get the results.
	output, err := getQueryResultForQueryString(ctx, queryString)
	if err != nil {
		return nil, err // Return an error if the query fails.
	}
	fmt.Println(output) // Log the output for debugging.
	
	// Return the results of the query.
	return getQueryResultForQueryString(ctx, queryString)
}

// GetAllOwners retrieves all transactions associated with a given owner.
// This function behaves similarly to GetQuery, but is named to imply it retrieves all records for that owner.
func (s *SmartContract) GetAllOwners(ctx contractapi.TransactionContextInterface, owner string) ([]*TXN, error) {
	// Construct the query string to select all transactions for the specified owner.
	queryString := fmt.Sprintf(`{"selector":{"DocType":"%s"}}`, owner)
	
	// Execute the query and get the results.
	output, err := getQueryResultForQueryString(ctx, queryString)
	if err != nil {
		return nil, err // Return an error if the query fails.
	}
	fmt.Println(output) // Log the output for debugging.
	
	// Return the results of the query.
	return getQueryResultForQueryString(ctx, queryString)
}

// GetAssetHistory retrieves the history of a specific asset based on its ID.
// It provides a detailed log of all transactions associated with the asset.
func (s *SmartContract) GetAssetHistory(ctx contractapi.TransactionContextInterface, assetID string) ([]HistoryQueryResult, error) {
	log.Printf("GetAssetHistory: ID %v", assetID) // Log the asset ID for tracking.

	// Get the history of the asset using its ID.
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(assetID)
	if err != nil {
		return nil, err // Return an error if the history retrieval fails.
	}
	defer resultsIterator.Close() // Ensure the iterator is closed after use.

	var records []HistoryQueryResult // Initialize a slice to hold the history records.
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next() // Retrieve the next result in the iterator.
		if err != nil {
			return nil, err // Return an error if fetching the next result fails.
		}

		var asset FOODIE // Define a variable to hold the asset data.
		if len(response.Value) > 0 {
			// Unmarshal the response value into the asset struct if it exists.
			err = json.Unmarshal(response.Value, &asset)
			if err != nil {
				return nil, err // Return an error if unmarshalling fails.
			}
		} else {
			// If there is no value, create a placeholder asset with just the ID.
			asset = FOODIE{
				ID: assetID,
			}
		}

		// Convert the response timestamp to a proper format.
		timestamp, err := ptypes.Timestamp(response.Timestamp)
		if err != nil {
			return nil, err // Return an error if timestamp conversion fails.
		}

		// Create a new history record with transaction details.
		record := HistoryQueryResult{
			TxId:      response.TxId,
			Timestamp: timestamp,
			Record:    &asset,
			IsDelete:  response.IsDelete,
		}
		records = append(records, record) // Add the record to the slice.
	}
	fmt.Println("records-", records) // Log the retrieved records for debugging.
	return records, nil // Return the compiled history records.
}

// getQueryResultForQueryString executes a query based on the provided query string.
// It returns the results as a slice of TXN structs.
func getQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]*TXN, error) {
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString) // Execute the query.
	if err != nil {
		return nil, err // Return an error if the query fails.
	}
	defer resultsIterator.Close() // Ensure the iterator is closed after use.

	return constructQueryResponseFromIterator(resultsIterator) // Construct and return the response from the iterator.
}

// constructQueryResponseFromIterator converts query results from the iterator into a slice of TXN structs.
func constructQueryResponseFromIterator(resultsIterator shim.StateQueryIteratorInterface) ([]*TXN, error) {
	var assets []*TXN // Initialize a slice to hold the assets.
	for resultsIterator.HasNext() {
		queryResult, err := resultsIterator.Next() // Retrieve the next result in the iterator.
		if err != nil {
			return nil, err // Return an error if fetching the next result fails.
		}
		var asset TXN // Define a variable to hold the asset data.
		err = json.Unmarshal(queryResult.Value, &asset) // Unmarshal the result value into the asset struct.
		if err != nil {
			return nil, err // Return an error if unmarshalling fails.
		}
		assets = append(assets, &asset) // Add the asset to the slice.
	}

	return assets, nil // Return the compiled assets.
}


func addBalance(ctx contractapi.TransactionContextInterface, userId string, id string, amount int) error {
	var OwnerStruct OWNERSTRUCT

	// Create a composite key for the owner entry
	var indexName = DOCTYPE + "~Owner"
	ownerKey, err := ctx.GetStub().CreateCompositeKey(indexName, []string{id, userId})
	if err != nil {
		return fmt.Errorf("failed to create composite key in add balance: %w", err)
	}
	fmt.Println("Owner key for adding balance:", ownerKey)

	// Define the owner structure values
	OwnerStruct.ID = id
	OwnerStruct.UserID = userId
	OwnerStruct.Amount = amount
	OwnerStruct.DocType = OWNER

	// Retrieve the current state from the ledger
	checkOwnerEntry, err := ctx.GetStub().GetState(ownerKey)
	if err != nil {
		return fmt.Errorf("failed to fetch owner entry: %w", err)
	}
	fmt.Println("Current owner entry state:", string(checkOwnerEntry))

	var checkOwner OWNERSTRUCT
	if checkOwnerEntry != nil {
		// Unmarshal the existing data from the ledger
		err = json.Unmarshal(checkOwnerEntry, &checkOwner)
		if err != nil {
			return fmt.Errorf("failed to unmarshal existing owner entry: %w", err)
		}
		// Update the owner's balance by adding the new amount
		OwnerStruct.Amount = checkOwner.Amount + amount
	}

	// Marshal the updated owner structure for storage
	OwnerAsByte, err := json.Marshal(OwnerStruct)
	if err != nil {
		return fmt.Errorf("failed to marshal owner structure: %w", err)
	}

	// Store the updated owner entry in the ledger
	err = ctx.GetStub().PutState(ownerKey, OwnerAsByte)
	if err != nil {
		return fmt.Errorf("failed to put owner state: %v", err)
	}

	return nil
}

func removeBalance(ctx contractapi.TransactionContextInterface, userId string, id string, amount int) error {
	var OwnerStruct OWNERSTRUCT

	// Create a composite key for the owner entry
	var indexName = DOCTYPE + "~Owner"
	ownerKey, err := ctx.GetStub().CreateCompositeKey(indexName, []string{id, userId})
	if err != nil {
		return fmt.Errorf("failed to create composite key in remove balance: %w", err)
	}
	fmt.Println("Owner key for removing balance:", ownerKey)

	// Define the owner structure values
	OwnerStruct.ID = id
	OwnerStruct.UserID = userId
	OwnerStruct.Amount = amount
	OwnerStruct.DocType = OWNER

	// Retrieve the current state from the ledger
	checkOwnerEntry, err := ctx.GetStub().GetState(ownerKey)
	if err != nil {
		return err
	}
	fmt.Println("Current owner entry state for removal:", string(checkOwnerEntry))

	var checkOwner OWNERSTRUCT
	if checkOwnerEntry != nil {
		// Unmarshal the existing data from the ledger
		err = json.Unmarshal(checkOwnerEntry, &checkOwner)
		if err != nil {
			return fmt.Errorf("failed to unmarshal existing owner entry: %w", err)
		}
		// Validate that the owner's balance is sufficient for the removal
		if checkOwner.Amount < amount {
			return fmt.Errorf("insufficient balance for owner %s", checkOwner.UserID)
		}
		// Update the owner's balance by subtracting the specified amount
		OwnerStruct.Amount = checkOwner.Amount - amount
		fmt.Println("Updated owner structure:", OwnerStruct)
	}

	// Marshal the updated owner structure for storage
	OwnerAsByte, err := json.Marshal(OwnerStruct)
	if err != nil {
		return fmt.Errorf("failed to marshal owner structure: %w", err)
	}

	// Store the updated owner entry in the ledger
	err = ctx.GetStub().PutState(ownerKey, OwnerAsByte)
	if err != nil {
		return fmt.Errorf("failed to put owner state: %v", err)
	}

	return nil
}

func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create fabcar chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting fabcar chaincode: %s", err.Error())
	}
}
