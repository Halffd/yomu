// The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.
// We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.
/* initSqlJs(config).then(function(SQL){
  //Create the database
  const db = new SQL.Database();
  // Run a query without reading the results
  db.run("CREATE TABLE test (col1, col2);");
  // Insert two rows: (1,111) and (2,222)
  db.run("INSERT INTO test VALUES (?,?), (?,?)", [1,111,2,222]);
  // Prepare a statement
  const stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN $start AND $end");
  stmt.getAsObject({$start:1, $end:1}); // {col1:1, col2:111}
  // Bind new values
  stmt.bind({$start:1, $end:2});
  while(stmt.step()) { //
    const row = stmt.getAsObject();
    console.log('Here is a row: ' + JSON.stringify(row));
  }
});*/
export class Db {
  constructor() {
    this.baseUrl = 'http://localhost:5300/yomu';
    this.bin = 'http://localhost:5300/bin';
  }

  async add(data, url = this.baseUrl) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.id;
  }

  async delete(id) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    return result.message;
  }

  async set(id, data, url = this.baseUrl) {
      if(url == 1){
      url = this.bin
    }
    await setTimeout(() => {}, parseInt(Math.random() * 10000));
    const response = await fetch(`${url}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.id;
  }

  async find(id) {
    const response = await fetch(`${this.baseUrl}/${id}`);
    const result = await response.json();
    return result;
  }
}