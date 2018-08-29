const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const yaml = require('js-yaml');
const fs = require('fs');

async function deleteService(ns, dname, manifest) {
  const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });

  try {
    const deleted =  await client.api.v1.namespaces(ns).services(dname).delete();
    console.log('Delete:', deleted);
  } catch (err) {
    if (err.code !== 409) throw err;
    console.log(err);
  }
}

async function deleteDaemonSet(ns, dname, manifest) {
  const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });

  try {
    const deleted = await client.apis.extensions.v1beta1.namespaces(ns).daemonsets(dname).delete();
    console.log('Deleted:', deleted);
  } catch (err) {
    if (err.code !== 409) throw err;
    console.log(err);
  }
}

async function deleteConfigMap(ns, dname, manifest) {
  const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });

  try {
    const deleted = await client.api.v1.namespaces(ns).configmaps(dname).delete();
    console.log('Deleted:', deleted);
  } catch (err) {
    if (err.code !== 409) throw err;
    console.log(err);
  }
}

async function deleteDeploy(ns, dname, manifest) {
  const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });

  try {
    const deleted = await client.apis.extensions.v1beta1.namespaces(ns).deployments(dname).delete();
    console.log('Deleted:', deleted);
  } catch (err) {
    if (err.code !== 409) throw err;
    console.log(err);
  }
}

async function deletePod(ns, dname, manifest) {
  var  client = new Client({ config: config.fromKubeconfig(), version: '1.9' });

  try {
    const deleted = await client.api.v1.namespaces(ns).pods.delete();
    console.log('Deteled:', deleted);
  } catch (err) {
    if (err.code !== 409) throw err;
    console.log(err);
  }
}
var args = process.argv.slice(2);
const ns = args[0]; 

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



deleteDeploy(ns, monitor_deployment_name, D_monitor_deployment);
deleteDeploy(ns, geth_miner_deployment_name, D_geth_miner_deployment);

deletePod(ns, geth_boot_node_pod_name, P_geth_boot_node_pod);

deleteConfigMap(ns, keystore_name, CM_keystore);
deleteConfigMap(ns, gethconfig_miner_name, CM_gethconfig_miner);
deleteConfigMap(ns, genesis_config_name, CM_genesis_config);
deleteConfigMap(ns, monitor_config_name, CM_monitor_config);

deleteDaemonSet(ns, geth_boot_nodesetup_pod_name, Ds_geth_boot_nodesetup_pod);

deleteService(ns, geth_bootnode_svc_name, S_geth_bootnode_svc);
deleteService(ns, miner_svc_name, S_miner_svc);
deleteService(ns, monitor_svc_name, S_monitor_svc);
