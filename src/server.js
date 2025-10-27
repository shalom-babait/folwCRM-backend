const app = require('../app');
const {deleteAllDBTables, deleteAllData,insertData,createManager} = require('./services/sql/sql-helpers');
const { connectSql } = require('./services/sql/sql-connection');
const { buildingDBTables } = require('./services/sql/sql-init');
require('dotenv').config();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

(async () => {
    try {
        // in progress 
         await connectSql();
         await deleteAllData();
         await deleteAllDBTables();
         await buildingDBTables();
         await insertData();

        // final
        // await connectSql();
        // await buildingDBTables();

        app.listen(port, () => {
            console.log(`Server running at http://${host}:${port}/`);
        });
    } catch (error) {
        console.error('Error in connecting to SQL or building database tables:', error);
    }
})();