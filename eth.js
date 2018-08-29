const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const yaml = require('js-yaml');
const fs = require('fs');


async function createNamespace(ns) {
  const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });
  var test_opts = {
    'apiVersion' : 'v1',
     'kind' : 'Namespace',
    'metadata' : {
	    'name' : ns
    }
  }
  try {
    const create = await client.api.v1.namespaces.post({ body: test_opts });
    console.log('Create:', create);
  } catch (err) {
    if (err.code !== 409) throw err;
    console.log(err);
  }
}


async function apply(ns, dname, manifest, opts) {
  const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });
  var api = opts.api;
  var version = opts.version;
  var method = opts.method;
  var extend = opts.extend;

  
  var getNamespace = null;
  if(extend == true){
     getNamespace = client[api].extensions[version].namespaces(ns);
  }else{
    getNamespace = client[api][version].namespaces(ns);
  }


  try {
    const create = await getNamespace[method].post({ body: manifest });
    console.log('Create:', create);
  } catch (err) {
    if (err.code !== 409) throw err;

    const replace = await getNamespace[method](dname).put({ body: manifest });
    console.log('Replace:', replace);
  }
}

async function applyService(ns, dname, manifest) {
     var opts = { 'api' : 'api', 'extend' : false,  'version' : 'v1', 'method' : 'services' };
     apply(ns, dname, manifest, opts)	
}

async function applyDaemonSet(ns, dname, manifest) {
     var opts = { 'api' : 'apis', 'extend': true ,'version' : 'v1beta1', 'method' : 'daemonsets' };
     apply(ns, dname, manifest, opts)	
}

async function applyConfigMap(ns, dname, manifest) {
     var opts = { 'api' : 'api', 'extend' : false,  'version' : 'v1', 'method' : 'configmaps' };
     apply(ns, dname, manifest, opts)	
}

async function applyDeploy(ns, dname, manifest) {
     var opts = { 'api' : 'apis', 'extend': true ,'version' : 'v1beta1', 'method' : 'deployments' };
     apply(ns, dname, manifest, opts)	
}

async function applyPod(ns, dname, manifest) {
     var opts = { 'api' : 'api', 'extend' : false,  'version' : 'v1', 'method' : 'pods' };
     apply(ns, dname, manifest, opts)	
}
var args = process.argv.slice(2);

const ns = args[0] 
//const ns = 'test1'

// ConfigMap
const CM_keystore = yaml.safeLoad(fs.readFileSync('./yaml/CM_keystore-config.yaml'));
CM_keystore.metadata.namespace = ns
var keystore_name = CM_keystore.metadata.name
const CM_gethconfig_miner = yaml.safeLoad(fs.readFileSync('./yaml/CM_gethconfig-miner.yaml'));
CM_gethconfig_miner.metadata.namespace = ns
var gethconfig_miner_name = CM_gethconfig_miner.metadata.name
const CM_genesis_config = yaml.safeLoad(fs.readFileSync('./yaml/CM_genesis-config.yaml'));
CM_genesis_config.metadata.namespace = ns
var genesis_config_name = CM_genesis_config.metadata.name
const CM_monitor_config = yaml.safeLoad(fs.readFileSync('./yaml/CM_monitor-config.yaml'));
CM_monitor_config.metadata.namespace = ns
var monitor_config_name = CM_monitor_config.metadata.name

// DaemonSet
const Ds_geth_boot_nodesetup_pod = yaml.safeLoad(fs.readFileSync('./yaml/Ds_geth-boot-node-setup-pod.yaml'));
var geth_boot_nodesetup_pod_name = Ds_geth_boot_nodesetup_pod.metadata.name

// Service
const S_geth_bootnode_svc = yaml.safeLoad(fs.readFileSync('./yaml/S_geth-bootnode-svc.yaml'));
var geth_bootnode_svc_name = S_geth_bootnode_svc.metadata.name
const S_miner_svc = yaml.safeLoad(fs.readFileSync('./yaml/S_miner-svc.yaml'));
var miner_svc_name = S_miner_svc.metadata.name
const S_monitor_svc = yaml.safeLoad(fs.readFileSync('./yaml/S_monitor-svc.yaml'));
var monitor_svc_name = S_monitor_svc.metadata.name

// Pod
const  P_geth_boot_node_pod = yaml.safeLoad(fs.readFileSync('./yaml/P_geth-boot-node-pod.yaml'));
var geth_boot_node_pod_name = P_geth_boot_node_pod.metadata.name

// Deployment
const  D_monitor_deployment = yaml.safeLoad(fs.readFileSync('./yaml/D_monitor-deployment.yaml'));
var monitor_deployment_name = D_monitor_deployment.metadata.name
const  D_geth_miner_deployment = yaml.safeLoad(fs.readFileSync('./yaml/D_geth-miner-deployment.yaml'));
var geth_miner_deployment_name = D_geth_miner_deployment.metadata.name

createNamespace(ns);

applyConfigMap(ns, keystore_name, CM_keystore);
applyConfigMap(ns, gethconfig_miner_name, CM_gethconfig_miner);
applyConfigMap(ns, genesis_config_name, CM_genesis_config);
applyConfigMap(ns, monitor_config_name, CM_monitor_config);

applyDaemonSet(ns, geth_boot_nodesetup_pod_name, Ds_geth_boot_nodesetup_pod);

applyService(ns, geth_bootnode_svc_name, S_geth_bootnode_svc);
applyService(ns, miner_svc_name, S_miner_svc);
applyService(ns, monitor_svc_name, S_monitor_svc);


applyDeploy(ns, monitor_deployment_name, D_monitor_deployment);
applyDeploy(ns, geth_miner_deployment_name, D_geth_miner_deployment);

applyPod(ns, geth_boot_node_pod_name, P_geth_boot_node_pod);
