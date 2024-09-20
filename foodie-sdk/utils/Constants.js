// TODO - Need to find a better approach for getting public journey data from specific org
// Currently using default org as 1


const CTE = {
    Transformation: 'Transformation',
    Commission: 'Commission',
    Aggregation: 'Aggregation',
    DisAggregation: 'Disaggregation',
    Decommission: 'Decommission',
    Observation: 'Observation'
}

const DOCTYPE = {
    Asset: 'Asset',
    Event: 'Event'
}

const ASSET_STATUS = {
    Inactive: 0,
    Active: 1,
    Expired: 2
}


const PERMISSIONS_METHODS = {
    GET: 'GET',
    PUT: 'PUT',
    POST: 'POST',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
}

const READ = [PERMISSIONS_METHODS.GET]
const UPDATE = [PERMISSIONS_METHODS.PATCH, PERMISSIONS_METHODS.PUT ]
const CREATE = [PERMISSIONS_METHODS.POST ]
const DELETE = [PERMISSIONS_METHODS.DELETE]
const ALL = [PERMISSIONS_METHODS.PUT, PERMISSIONS_METHODS.PATCH, PERMISSIONS_METHODS.POST, PERMISSIONS_METHODS.GET, PERMISSIONS_METHODS.DELETE ]
const NO = []



const SETUP_TYPE = {
    SINGLE_MACHINE: 'single-machine',
    K8S : 'k8s'
}

const ENVIRONMENTS = {
    DEV: 'dev',
    QA: 'qa',
    UAT: 'uat'
}

const WHITE_LISTED_DOMAINS = ['https://alpha.spydra.io', "https://qa.spydra.io"]

const NETWORK_PARAMETERS = {
    CHAINCODE_NAME: process.env.SETUP == SETUP_TYPE.K8S ?'spydra-cc' : 'foodie',
    CHANNEL_NAME: process.env.SETUP == SETUP_TYPE.K8S ? 'spydra-channel': 'mychannel'
}

module.exports = {
    NETWORK_PARAMETERS,
    SETUP_TYPE,
    ENVIRONMENTS,
    WHITE_LISTED_DOMAINS,
    DOCTYPE,
    READ,
    CREATE,
    UPDATE,
    DELETE,
    ALL,
    NO
}