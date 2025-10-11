// Base MongoDB initialization for shared Paklog instance
// Creates dedicated users for services that don't provide their own init scripts

function ensureUser(dbName, username, password) {
  const db = db.getSiblingDB(dbName);
  if (!db.getUser(username)) {
    db.createUser({
      user: username,
      pwd: password,
      roles: [{ role: 'readWrite', db: dbName }]
    });
    print(`Created user ${username} for database ${dbName}`);
  } else {
    print(`User ${username} already exists in database ${dbName}`);
  }
}

ensureUser('inventorydb', 'inventory', 'inventory123');
ensureUser('warehouse', 'warehouse', 'warehouse123');
ensureUser('order_management', 'ordermanagement', 'ordermanagement123');
ensureUser('shipment_db', 'shipment', 'shipment123');

print('Shared MongoDB base initialization complete.');
